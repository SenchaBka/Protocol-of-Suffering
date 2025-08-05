const IP: string = "192.168.1.158";
const PORT: number = 8080;

const socket = new WebSocket(`ws://${IP}:${PORT}`);

socket.addEventListener("open", () => {
  console.log("WebSocket connection established!");
  socket.send("Hi Arsenius");
  startChat();
});

socket.addEventListener("message", (e) => {
  console.log("Server:", e.data);
});

socket.addEventListener("close", (event) => {
  console.log("WebSocket connection closed:", event.code, event.reason);
});

socket.addEventListener("error", (error) => {
  console.error("WebSocket error:", error);
});

// Simple chat function
function startChat() {
  import("readline").then((readline) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log("Type your messages (press Enter to send):");

    rl.on("line", (input: string) => {
      if (input.trim()) {
        socket.send(input.trim());
        console.log("You:", input.trim());
      }
    });

    // Handle Ctrl+C
    rl.on("SIGINT", () => {
      console.log("Closing connection...");
      socket.close();
      rl.close();
      process.exit(0);
    });
  });
}
