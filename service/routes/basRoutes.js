const express = require("express");
const {
  addDataHandler,
  getDataHandler,
} = require("../controllers/dataController");
const router = express.Router();

router.post("/", authenticateToken, addDataHandler);
module.exports = router;
