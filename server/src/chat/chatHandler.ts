import WebSocket from "ws";
import { OpenAI } from "openai";
import dotenv from "dotenv";
import { Collection, MongoClient } from "mongodb";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const mongoClient = new MongoClient(process.env.MONGODB_URI!);

interface Session {
  character: string;
  messages: { role: "system" | "user" | "assistant"; content: string }[];
}

const sessions = new Map<WebSocket, Session>();

interface CharacterDoc {
  _id: string;      
  systemPrompt: string;
}

// Load character system prompt from MongoDB
async function loadCharacterPrompt(character: string): Promise<string> {
  const db = mongoClient.db("protocolDB");
  
  const col: Collection<CharacterDoc> = db.collection("characters");
  const doc = await col.findOne({ _id: character });
  return doc?.systemPrompt ?? "RETURN ONLY: CHARACTER NOT FOUND.";
}

export async function handleMessage(ws: WebSocket, message: WebSocket.Data) {
  // Parse incoming message
  let userText = "";
  let character = "DEFAULT"; // default
  let requestId: number | undefined;

  try {
    const parsed = JSON.parse(message.toString());
    userText = parsed.text || "";
    character = parsed.character || character;
    requestId = parsed.id;
  } catch {
    userText = message.toString();
  }

  // Get existing session
  let session = sessions.get(ws);

  // Initialize session if needed
  if (!session || session.character !== character) {
    const systemPrompt = await loadCharacterPrompt(character);

// 🔹 Debug log here
    console.log(`Loaded system prompt for character "${character}":`, systemPrompt);

    session = {
      character,
      messages: [{ role: "system", content: systemPrompt }],
    };
    sessions.set(ws, session);
  }

  // Append user message
  session.messages.push({ role: "user", content: userText });

  try {
    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: session.messages,
    });

    const response = completion.choices?.[0]?.message?.content;

    if (response) {
      // Append assistant response to session
      session.messages.push({ role: "assistant", content: response });

      // Send back to client
      const payload: any = { type: "ai_response", text: response };
      if (requestId !== undefined) payload.id = requestId;
      ws.send(JSON.stringify(payload));
    } else {
      ws.send(
        JSON.stringify({
          type: "error",
          text: "Sorry, no response generated.",
          ...(requestId !== undefined ? { id: requestId } : {}),
        })
      );
    }
  } catch (error) {
    console.error("OpenAI API error:", error);
    ws.send(
      JSON.stringify({
        type: "error",
        text: "Error processing your request.",
        ...(requestId !== undefined ? { id: requestId } : {}),
      })
    );
  }
}