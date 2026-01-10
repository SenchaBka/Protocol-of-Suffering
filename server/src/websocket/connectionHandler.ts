import WebSocket from "ws";
import jwt from "jsonwebtoken";
import { handleMessage } from "../chat/chatHandler";
export function setupConnection(ws: WebSocket, req: any) {
  const params = new URLSearchParams(req.url?.split("?")[1]);
  const token = params.get("token");

  if (!token) {
    ws.close(4001, "Unauthorized: No token");
    return;
  }

  try {
    // Verify token
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    console.log("User authenticated:", payload);

    // Attach user info to ws for later use
    //(ws as any).user = payload;

    console.log("Client connected");
    ws.send(JSON.stringify({ type: "welcome", text: "Welcome to the server!" }));

    ws.on("message", (msg) => handleMessage(ws, msg));

    ws.on("close", () => console.log("Client disconnected"));
    ws.on("error", (err) => console.error("Connection error:", err));

  } catch (err) {
    ws.close(4002, "Unauthorized: Invalid token");
  }
}
