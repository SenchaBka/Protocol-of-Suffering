// server.js - Load dotenv FIRST
require("dotenv").config({ path: "../.env" });

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { getChatResponse } = require("./chat");

// Debug line
console.log('API Key loaded in server.js:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }

  try {
    const reply = await getChatResponse(message);
    res.json({ reply });
  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({ error: "Failed to get response from OpenAI" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});