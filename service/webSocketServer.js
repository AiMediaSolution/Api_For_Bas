const WebSocket = require("ws");
const rooms = {}; // Đối tượng để lưu trữ các Rooms và người dùng

// Tạo WebSocket Server
const wss = new WebSocket.Server({ noServer: true });

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "join") {
      const roomName = data.room;
      if (!rooms[roomName]) {
        rooms[roomName] = [];
      }
      rooms[roomName].push(ws);
      ws.room = roomName;
      console.log(`Client joined room: ${roomName}`);
    } else if (data.type === "message") {
      const roomName = ws.room;
      if (roomName && rooms[roomName]) {
        rooms[roomName].forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
      }
    }
  });

  ws.on("close", () => {
    const roomName = ws.room;
    if (roomName && rooms[roomName]) {
      rooms[roomName] = rooms[roomName].filter((client) => client !== ws);
      if (rooms[roomName].length === 0) {
        delete rooms[roomName];
      }
    }
    console.log("Client disconnected");
  });
});

function broadcast(room, data) {
  if (rooms[room]) {
    rooms[room].forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
}

module.exports = { wss, broadcast };
