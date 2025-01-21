const express = require("express");
const { verifySecretKey } = require("../middlewares/authMiddleware");
const {
  addDataHandler,
  getDataHandler,
  updateStatusHandler,
} = require("../controllers/dataController");
const router = express.Router();

router.post("/", verifySecretKey, updateStatusHandler);
router.get("/", verifySecretKey, getDataHandler);

module.exports = router;
