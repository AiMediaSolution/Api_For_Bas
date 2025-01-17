const express = require("express");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authenticateToken, (req, res) => {
  const { content, status, date } = req.body;
  console.log("toiday");
  try {
    console.log("Received data:", { content, status, date });
    // Giả sử bạn lưu dữ liệu vào database ở đây
    // Ví dụ: await database.save({ content, status, date });
    res.status(201).json({ message: "Data added successfully" });
  } catch (error) {
    console.error("Error adding data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/", authenticateToken, (req, res) => {
  try {
    // Giả sử bạn lấy dữ liệu từ database ở đây
    const data = [
      {
        content: "Sample content",
        status: "new",
        date: "2025-01-16T12:00:00Z",
      },
    ];
    res.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
