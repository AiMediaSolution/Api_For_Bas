const express = require("express");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  addDataHandler,
  getDataHandler,
} = require("../controllers/dataController");
const router = express.Router();

router.post("/", authenticateToken, addDataHandler);
router.get("/", authenticateToken, getDataHandler);
module.exports = router;
