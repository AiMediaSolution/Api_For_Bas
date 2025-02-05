const express = require("express");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  addDataHandler,
  getDataHandler,
  addMultiDataHandler,
} = require("../controllers/dataController");
const router = express.Router();

// Router add data
router.post("/", authenticateToken, addDataHandler);

// Router add list data
router.post("/list", authenticateToken, addMultiDataHandler);

// Router get all data by user
router.get("/", authenticateToken, getDataHandler);

module.exports = router;
