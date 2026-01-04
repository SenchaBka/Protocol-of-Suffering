const IP: string = "192.168.2.15";
const PORT: number = 8080;

let socket: WebSocket | null = null;
let responsePromise: {
  resolve: (value: string) => void;
  reject: (error: Error) => void;
} | null = null;

const token = localStorage.getItem("token");
if (token) {
  connectWebSocket(token);
}

export function connectWebSocket(jwtToken: string) {
  return new Promise<WebSocket>((resolve, reject) => {
    socket = new WebSocket(`ws://${IP}:${PORT}/?token=${jwtToken}`);

    socket.addEventListener("open", () => {
      console.log("WebSocket connection established!");
      socket!.send("Hi Arsenius");
      resolve(socket!);
    });

    socket.addEventListener("message", (e) => {
      console.log("Server:", e.data);

      if (responsePromise) {
        responsePromise.resolve(e.data);
        responsePromise = null;
      }
    });

    socket.addEventListener("close", () => {
      console.log("Disconnected. Reconnecting...");
      setTimeout(() => {
        connectWebSocket(jwtToken);
      }, 1000);
    });

    socket.addEventListener("error", (error) => {
      console.error("WebSocket error:", error);
      if (responsePromise) {
        responsePromise.reject(new Error("WebSocket error"));
        responsePromise = null;
      }
      reject(error);
    });
  });
}

export function getAIresponse(input: string): Promise<string> {
  return new Promise((resolve, reject) => {
    responsePromise = { resolve, reject };
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(input);
    } else {
      reject(new Error("WebSocket is not connected"));
    }
  });
}
