import { WebSocketServer } from "ws";
import { setupConnection } from "./connectionHandler";

const IP = "0.0.0.0";
const PORT = 8080;

export let wss: WebSocketServer;

export function startWebSocketServer() {
    wss = new WebSocketServer({ host: IP, port: PORT });

    wss.on("connection", setupConnection);

    console.log(`Server running on ws://${IP}:${PORT}`);
}
