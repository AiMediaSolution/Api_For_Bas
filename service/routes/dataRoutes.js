const express = require("express");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  addDataHandler,
  getDataHandler,
  addMultiDataHandler,
} = require("../controllers/dataController");
const router = express.Router();

router.post("/", authenticateToken, addDataHandler);
router.post("/list", authenticateToken, addMultiDataHandler);
router.get("/", authenticateToken, getDataHandler);

module.exports = router;
