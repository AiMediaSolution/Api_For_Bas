const express = require("express");
const { login, refreshToken } = require("../controllers/authController");

const router = express.Router();

// Route để xử lý yêu cầu đăng nhập
router.post("/login", login);

// Route để xử lý yêu cầu làm mới token
router.post("/token", refreshToken);

module.exports = router;
