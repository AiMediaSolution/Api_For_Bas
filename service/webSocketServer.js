const WebSocket = require("ws");
const clients = [];

// Create WebSocket Server
const wss = new WebSocket.Server({ noServer: true });

wss.on("connection", (ws) => {
  clients.push(ws);
  console.log("Client connected");

  ws.on("close", () => {
    const index = clients.indexOf(ws);
    if (index !== -1) {
      clients.splice(index, 1);
    }
    console.log("Client disconnected");
  });
});

// Send data to all client
function broadcast(data) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}
function statusBasNow(data) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

module.exports = { wss, broadcast, statusBasNow };
