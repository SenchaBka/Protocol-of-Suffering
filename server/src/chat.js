// chat.js
const { OpenAI } = require("openai"); // Use require, not import

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