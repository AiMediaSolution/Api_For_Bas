const express = require("express");
const { updateStatusHandler } = require("../controllers/dataController");
const { verifySecretKey } = require("../middlewares/authMiddleware");
const router = express.Router();
router.post("/", verifySecretKey, updateStatusHandler);
module.exports = router;
