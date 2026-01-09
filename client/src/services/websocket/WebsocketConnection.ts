const IP: string = "192.168.2.15";
const PORT: number = 8080;

let socket: WebSocket | null = null;
let responsePromise: {
  resolve: (value: string) => void;
  reject: (error: Error) => void;
} | null = null;

export function connectWebSocket(jwtToken: string) {
  // Return existing open socket if present
  if (socket && socket.readyState === WebSocket.OPEN) return Promise.resolve(socket);

  return new Promise<WebSocket>((resolve, reject) => {
    try {
      socket = new WebSocket(`ws://${IP}:${PORT}/?token=${jwtToken}`);
    } catch (err) {
      return reject(err);
    }

    socket.addEventListener("open", () => {
      console.log("WebSocket connection established!");
      try {
        socket!.send("Hi Arsenius");
      } catch (e) {
        console.warn("Could not send greetings message:", e);
      }
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
      // clear socket reference so subsequent calls try to reconnect
      socket = null;
      setTimeout(() => {
        connectWebSocket(jwtToken).catch(() => {});
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

export async function getAIresponse(input: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    responsePromise = { resolve, reject };

    try {
      const token = localStorage.getItem("token");
      if (!token) return reject(new Error("No auth token available"));

      if (!socket || socket.readyState !== WebSocket.OPEN) {
        await connectWebSocket(token);
      }

      socket!.send(input);
    } catch (err) {
      responsePromise = null;
      reject(new Error("WebSocket is not connected"));
    }
  });
}

// Initialize after the variables and functions are defined
const token = localStorage.getItem("token");
if (token) {
  connectWebSocket(token).catch((e) => console.error("Initial WS connect failed:", e));
}
