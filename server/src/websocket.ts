// Create my own server
const ws = require("ws");
const IP: string = "192.168.1.158";
const PORT: number = 8080;
const SOCKET = new WebSocket(`ws://${IP}:${PORT}`);

// Create server

const wss = new ws.Server({
    host: IP,
    port: 8080
});

wss.on('connection', function connection(ws: any){
    console.log('Arsenii is connected');

    ws.on("message", function incoming(message: any){
        console.log("Received:", message.toString());

        // Echo message to all clients
        wss.clients.forEach(function each(client: any) {
            if (client.readyState === WebSocket.OPEN) {
                client.send('Echo: ' + message);
            }
            });
        });

        ws.send("Welcome to the server");
});

console.log('WebSocket server running on ws://10.0.0.182:8080');