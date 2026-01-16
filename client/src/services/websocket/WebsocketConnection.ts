const IP: string = "192.168.2.15";
const PORT: number = 8080;

let socket: WebSocket | null = null;
// request tracking
let responsePromise: {
  resolve: (value: string) => void;
  reject: (error: Error) => void;
  id: number;
} | null = null;

let responseTimeout: ReturnType<typeof setTimeout> | null = null;
let currentRequestId = 0;

function cleanupPending(err?: Error) {
  if (responseTimeout) { clearTimeout(responseTimeout); responseTimeout = null; }
  if (responsePromise) { responsePromise.reject(err ?? new Error("Socket closed")); responsePromise = null; }
}

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
      // Try parse structured JSON messages
      let parsed: any = null;
      try {
        parsed = JSON.parse(e.data as string);
      } catch {
        parsed = null;
      }

      // Only resolve when it's an ai_response matching our request id
      if (parsed && parsed.type === "ai_response" && responsePromise && parsed.id === responsePromise.id) {
        if (responseTimeout) { clearTimeout(responseTimeout); responseTimeout = null; }
        responsePromise.resolve(parsed.text);
        responsePromise = null;
        return;
      }

      // Log welcome messages
      if (parsed && parsed.type === "welcome") {
        console.log("Server welcome:", parsed.text);
        return;
      }

      // If message is unstructured, ignore obvious welcome text to avoid accidental resolves
      if (responsePromise && typeof e.data === "string" && /welcome/i.test(e.data as string)) {
        console.log("Ignored server welcome message");
        return;
      }
    });

    socket.addEventListener("close", () => {
      console.log("Disconnected. Reconnecting...");
      cleanupPending();
      socket = null;
    });

    socket.addEventListener("error", (error) => {
      console.error("WebSocket error:", error);
      cleanupPending(new Error("WebSocket error"));
      reject(error);
    });
  });
}

export async function getAIresponse(input: string, character: string = "DEFAULT"): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return reject(new Error("No auth token available"));

      if (!socket || socket.readyState !== WebSocket.OPEN) {
        await connectWebSocket(token);
      }

      const id = ++currentRequestId;
      responsePromise = { resolve, reject, id };

      responseTimeout = setTimeout(() => {
        if (responsePromise) {
          responsePromise.reject(new Error("Timed out waiting for server response"));
          responsePromise = null;
        }
        responseTimeout = null;
      }, 15000);

      // Send structured request including character
      socket!.send(JSON.stringify({
        type: "request",
        id,
        text: input,
        character // <-- include character here
      }));
    } catch (err) {
      responsePromise = null;
      if (responseTimeout) { clearTimeout(responseTimeout); responseTimeout = null; }
      reject(new Error("WebSocket is not connected"));
    }
  });
}

// Helper: cleanly close the WebSocket connection
export function disconnectWebSocket() {
  if (socket) {
    try {
      // Normal closure with close code 1000 (OK)
      socket.close(1000, "Client disconnect");
    } catch (e) {
      console.warn("Error while closing socket:", e);
    }
    // Ensure any pending response promise is cleared
    responsePromise = null;
    socket = null;
  }
}
