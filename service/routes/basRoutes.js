const express = require("express");
const {
  updateStatusHandler,
  getAllDataForBas,
  updateSocket,
} = require("../controllers/dataController");
const { verifySecretKey } = require("../middlewares/authMiddleware");

const router = express.Router();

// Router get all data in bas
router.get("/", verifySecretKey, getAllDataForBas);

// Router update status in bas
router.post("/", verifySecretKey, updateStatusHandler);

// Router update status by bas
router.post("/update_status", verifySecretKey, updateSocket);
module.exports = router;
