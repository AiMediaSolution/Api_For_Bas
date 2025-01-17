const express = require("express");
const { login, refreshToken } = require("../controllers/authController");

const router = express.Router();

// Route to process login request
router.post("/login", login);

// Route to process refresh Token
router.post("/token", refreshToken);

module.exports = router;
