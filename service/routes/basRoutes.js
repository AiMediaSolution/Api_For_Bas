const express = require("express");
const {
  updateStatusHandler,
  getAllDataForBas,
} = require("../controllers/dataController");
const { verifySecretKey } = require("../middlewares/authMiddleware");

const router = express.Router();
router.get("/", verifySecretKey, getAllDataForBas);
router.post("/", verifySecretKey, updateStatusHandler);
module.exports = router;
