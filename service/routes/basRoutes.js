const express = require("express");
const {
  updateStatusHandler,
  getAllDataForBas,
  updateSocket,
} = require("../controllers/dataController");
const { verifySecretKey } = require("../middlewares/authMiddleware");

const router = express.Router();
router.get("/", verifySecretKey, getAllDataForBas);
router.post("/", verifySecretKey, updateStatusHandler);
router.post("/update_status", verifySecretKey, updateSocket);
module.exports = router;
