const IP: string = "10.0.0.29";
const PORT: number = 8080;

const socket = new WebSocket(`ws://${IP}:${PORT}`);

let responsePromise: {
  resolve: (value: string) => void;
  reject: (error: Error) => void;
} | null = null;

socket.addEventListener("open", () => {
  console.log("WebSocket connection established!");
  socket.send("Hi Arsenius");
});

socket.addEventListener("message", (e) => {
  console.log("Server:", e.data);

  // Resolve the promise if we're waiting for a response
  if (responsePromise) {
    responsePromise.resolve(e.data);
    responsePromise = null;
  }
});

socket.addEventListener("close", (event) => {
  console.log("WebSocket connection closed:", event.code, event.reason);

  // Reject any pending promise if connection closes
  if (responsePromise) {
    responsePromise.reject(new Error("WebSocket connection closed"));
    responsePromise = null;
  }
});

socket.addEventListener("error", (error) => {
  console.error("WebSocket error:", error);

  // Reject any pending promise if there's an error
  if (responsePromise) {
    responsePromise.reject(new Error("WebSocket error"));
    responsePromise = null;
  }
});

export function getAIresponse(input: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Store the promise to resolve when we get a response
    responsePromise = { resolve, reject };

    // Send the input to the server
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(input);
    } else {
      reject(new Error("WebSocket is not connected"));
    }
  });
}
