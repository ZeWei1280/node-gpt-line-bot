import dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';

const envPath = "./config/.env";
dotenv.config({path:envPath});

// create ChatGPT config from env variables
const gptConfig = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

// creat OpenAI
const openai = new OpenAIApi(gptConfig);




var history = [];

const generateAiResponse = async ( userMessage ) =>{
    if(userMessage === '#restart'){
        resetHistory();
        return '重置對話紀錄'
    }

    if(userMessage === '#繁體中文'){
        addToHistory({
            role: 'user',
            content: '一律用繁體中文回答'
        });
        return '設置繁體中文'
    }

    addToHistory({
        role: 'user',
        content: userMessage
    });

    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: history,
        max_tokens: 500,
    });

    const sysMessage = completion.data.choices[0].message.content.trim() || '抱歉，我沒有話可說了。'
    
    addToHistory({
        role: 'system',
        content: sysMessage
    });
    return sysMessage
}


const resetHistory = () =>{
    history = [];
}

const addToHistory = ( message ) =>{
    history.push(message);
    if(history.length > 2)
        history.shift();
}
        
export {generateAiResponse}