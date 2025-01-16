const express = require("express");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { addData, fetchData } = require("../controllers/dataController");

const router = express.Router();

router.post("/", authenticateToken, addData); // Sử dụng middleware authenticateToken
router.get("/", authenticateToken, fetchData);

module.exports = router;
