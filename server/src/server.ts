// Commands:
// npx tsc - to complile all TypeScript files
// ts-node - to run the server

import { WebSocketServer } from "ws";
import { setupConnection } from "./connectionHandler";

const IP = "10.0.0.29";
const PORT = 8080;

export const wss = new WebSocketServer({ host: IP, port: PORT });

wss.on("connection", setupConnection);

console.log(`Server running on ws://${IP}:${PORT}`);
