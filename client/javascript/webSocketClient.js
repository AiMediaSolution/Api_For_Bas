const WebSocket = require("ws");

const apiUrl = [[API]];

let ws;

function connectWebSocket(userName) {
  ws = new WebSocket(apiUrl);

  ws.on("open", () => {
    console.log("Connected to WebSocket server.");
    const joinRoomMessage = JSON.stringify({ type: "join", room: userName });
    ws.send(joinRoomMessage);
    console.log(`Sent join room request for room: ${userName}`);
  });

  ws.on("message", (data) => {
    console.log("Received:", data);
    try {
      console.log("Data saved to file." + data);
    } catch (err) {
      console.error("Error writing to file:", err);
    }
  });

  ws.on("close", () => {
    console.log(
      "Disconnected from WebSocket server. Reconnecting in 5 seconds..."
    );
    setTimeout(() => connectWebSocket(userName), 5000);
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
  });
}

module.exports = { connectWebSocket };
