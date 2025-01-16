const express = require("express");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/data", authenticateToken, (req, res) => {
  const { content, status, date } = req.body;
  // Thêm logic để lưu dữ liệu
  console.log("aaaaaaaaaaaaaaaaa1111111111111");
  res.status(201).json({ message: "Data added successfully" });
});

router.get("/data", authenticateToken, (req, res) => {
  // Thêm logic để lấy dữ liệu
  res.json(data);
});

module.exports = router;
