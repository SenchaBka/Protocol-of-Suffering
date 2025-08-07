import WebSocket from "ws";
import { handleMessage } from "./chatHandler";

export function setupConnection(ws: WebSocket) {
  console.log("Client connected");
  ws.send("Welcome to the server!");

  ws.on("message", (msg) => handleMessage(ws, msg));

  ws.on("close", () => console.log("Client disconnected"));
  ws.on("error", (err) => console.error("Connection error:", err));
}
