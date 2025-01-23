const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const { initializeDatabase } = require("./database");
const http = require("http");
const { wss } = require("./webSocketServer");

const app = express();
const PORT = 3000;

// initialize DataBase
initializeDatabase();
app.use(bodyParser.json());
app.use(cors());

// Create HTTP server and attach WebSocket server
const server = http.createServer(app);
server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

// Import routes
const authRoutes = require("./routes/authRoutes");
const dataRoutes = require("./routes/dataRoutes");
const adminRoutes = require("./routes/adminRoutes");
const basRouters = require("./routes/basRoutes");
// Use routes
app.use("/auth", authRoutes);
app.use("/data", dataRoutes);
app.use("/admin", adminRoutes);
app.use("/bas", basRouters);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
// const express = require("express");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// require("dotenv").config();
// const { initializeDatabase } = require("./database");
// const http = require("http");
// const { wss, broadcast } = require("./webSocketServer");

// const app = express();
// const PORT = 3000;

// // initialize DataBase
// initializeDatabase();
// app.use(bodyParser.json());
// app.use(cors());

// // Create HTTP server and attach WebSocket server
// const server = http.createServer(app);
// server.on("upgrade", (request, socket, head) => {
//   wss.handleUpgrade(request, socket, head, (ws) => {
//     wss.emit("connection", ws, request);
//   });
// });

// // Endpoint để cập nhật trạng thái
// app.post("/update-status", (req, res) => {
//   const { status } = req.body;
//   // Cập nhật trạng thái trong cơ sở dữ liệu hoặc logic khác nếu cần
//   broadcast({ status });
//   res.status(200).json({ message: "Status updated successfully" });
// });

// // Import routes
// const authRoutes = require("./routes/authRoutes");
// const dataRoutes = require("./routes/dataRoutes");
// const adminRoutes = require("./routes/adminRoutes");

// // Use routes
// app.use("/auth", authRoutes);
// app.use("/data", dataRoutes);
// app.use("/admin", adminRoutes);

// server.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });
