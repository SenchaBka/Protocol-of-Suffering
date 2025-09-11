import WebSocket from "ws";
import { OpenAI } from "openai";
import { wss } from "./server";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Character prompts stored here
const characterPrompts: Record<string, string> = {
  buzzwordBot: "Use a lot of buzzy and garbage words. Be very short. Call me cutie-patutie.",
  friendlyHelper: "Be kind and helpful, speak like a cheerful assistant.",
  detective: "Act like a sharp detective solving mysteries, be concise and clever.",
  professor: "Respond with detailed explanations like a knowledgeable professor.",
};

function getSystemPrompt(character: string): string {
  return characterPrompts[character] ?? "Be neutral and helpful.";
}

// Broadcast message to all connected clients
function broadcastMessage(message: string) {
  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

export async function handleMessage(ws: WebSocket, message: WebSocket.Data) {
  let character = "buzzwordBot";
  let userText = "";

  try {
    const parsed = JSON.parse(message.toString());
    character = parsed.character || character;
    userText = parsed.text || "";
  } catch {
    userText = message.toString(); // fallback plain text
  }

  const systemContent = getSystemPrompt(character);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: userText },
      ],
    });

    const response = completion.choices?.[0]?.message?.content;

    if (response) {
      broadcastMessage(response);
    } else {
      console.warn("OpenAI returned no response");
      ws.send("Sorry, no response generated.");
    }
  } catch (error) {
    console.error("OpenAI API error:", error);
    ws.send("Error processing your request.");
  }
}
