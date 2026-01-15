import WebSocket from "ws";
import { OpenAI } from "openai";
import { wss } from "../websocket/server";
import dotenv from "dotenv";
import { characterPrompts, getSystemPrompt } from "./characterPrompts";


dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function handleMessage(ws: WebSocket, message: WebSocket.Data) {
  let character = "angrySkeleton";
  let userText = "";
  let requestId: number | undefined;

  try {
    const parsed = JSON.parse(message.toString());
    character = parsed.character || character;
    userText = parsed.text || "";
    requestId = parsed.id;
  } catch {
    userText = message.toString();
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
      const payload: any = { type: "ai_response", text: response };
      if (requestId !== undefined) payload.id = requestId;
      ws.send(JSON.stringify(payload));
    } else {
      console.warn("OpenAI returned no response");
      ws.send(JSON.stringify({ type: "error", text: "Sorry, no response generated.", ...(requestId !== undefined ? { id: requestId } : {}) }));
    }
  } catch (error) {
    console.error("OpenAI API error:", error);
    ws.send(JSON.stringify({ type: "error", text: "Error processing your request.", ...(requestId !== undefined ? { id: requestId } : {}) }));
  }
}
