// chat.js - to send requests to OpenAI API
// Temporary terminal command: Invoke-RestMethod -Uri "http://localhost:3001/api/chat" -Method Post -Headers @{"Content-Type"="application/json"} -Body '{"message": "Hello!"}'^C
const { OpenAI } = require("openai"); 

console.log('API Key available in chat.js:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getChatResponse(userMessage) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful game character." },
      { role: "user", content: userMessage },
    ],
  });

  return completion.choices[0].message.content;
}

module.exports = { getChatResponse };