import express from 'express';
import line from '@line/bot-sdk';
import dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';

const envPath = "./config/.env";
dotenv.config({path:envPath});

// create ChatGPT config from env variables
const gptConfig = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});


// create LINE SDK config from env variables
const lineConfig = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(lineConfig);
// creat OpenAI
const openai = new OpenAIApi(gptConfig);
// create Express app
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(lineConfig), (req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch((err) => {
        console.error(err);
        res.status(500).end();
    });
});

// event handler
async function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        // ignore non-text-message event
        return Promise.resolve(null);
    }

    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ 
            role: 'user', // user input
            content: event.message.text,
        }, {
            role: 'system', // gpt res input
            content: '好的，我一率用中文回答' 
        }],
        max_tokens: 500,
    });

    // create a echoing text message
    const echo = { 
        type: 'text', 
        text:  completion.data.choices[0].message.content.trim() || '抱歉，我沒有話可說了。'
    };

    // use reply API
    return client.replyMessage(event.replyToken, echo);
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`listening on ${port}`);    
});