// webSocketServer.js
const WebSocket = require("ws");
const clients = [];

// Tạo WebSocket Server
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

// Hàm broadcast để gửi dữ liệu tới tất cả các client
function broadcast(data) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

module.exports = { wss, broadcast };
