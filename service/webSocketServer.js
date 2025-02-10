const WebSocket = require("ws");
const rooms = {}; // Object to store Rooms and messages

// Create WebSocket Server
const wss = new WebSocket.Server({ noServer: true });

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const data = JSON.parse(message);
    if (data.type === "join") {
      const roomName = data.room;
      if (!rooms[roomName]) {
        rooms[roomName] = { clients: [], messages: [] };
      }
      rooms[roomName].clients.push(ws);
      ws.room = roomName;
      console.log(`Client joined room: ${roomName}`);
    } else if (data.type === "fetch_current_data") {
      const roomName = "BAS";
      if (rooms[roomName]) {
        ws.send(JSON.stringify(rooms[roomName].messages));
      } else {
        ws.send(
          JSON.stringify({ type: "error", message: "Room 'BAS' not found." })
        );
      }
    } else if (data.type === "message") {
      console.log("room");
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
      rooms[roomName].clients = rooms[roomName].clients.filter(
        (client) => client !== ws
      );
      if (rooms[roomName].clients.length === 0) {
        delete rooms[roomName];
      }
    }
    console.log("Client disconnected");
  });
});
function broadcast(room, data) {
  if (!room || !rooms[room]) {
    console.log(`Room ${room} does not exist or has no clients.`);
    return;
  }
  rooms[room].messages = data;
  rooms[room].clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}
module.exports = { wss, broadcast };
