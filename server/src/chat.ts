import WebSocket, { WebSocketServer } from "ws";
import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

const IP = "10.0.0.29";
const PORT = 8080;

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY in environment variables");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const wss = new WebSocketServer({ host: IP, port: PORT });

console.log(`WebSocket server running on ws://${IP}:${PORT}`);

function broadcastMessage(message: string) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

async function handleMessage(ws: WebSocket, message: WebSocket.Data) {
  const msgString = message.toString();
  console.log("Received:", msgString);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Use a lot of buzzy and garbage words. Be very short. Call me cutie-patutie.",
        },
        { role: "user", content: msgString },
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

wss.on("connection", (ws: WebSocket) => {
  console.log("Connection made");

  ws.send("Welcome to the server");

  ws.on("message", async (message: WebSocket.Data) => {
    const msgString = message.toString();
    console.log("Received:", msgString);

    try {
      // Get response from OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Use a lot of buzzy and garbage words. Be very short. Call me cutie-patutie." },
          { role: "user", content: msgString },
        ],
      });

      const response = completion.choices[0].message.content;

      if (response) {
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(response);
          }
        });
      } else {
        console.warn("OpenAI returned null response");
        ws.send("Sorry, no response generated.");
      }
    } catch (error) {
      console.error("OpenAI error:", error);
      ws.send("Error processing your request.");
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });

  ws.on("error", (err) => {
    console.error("Connection error:", err);
  });
});

console.log(`WebSocket server running on ws://${IP}:${PORT}`);
