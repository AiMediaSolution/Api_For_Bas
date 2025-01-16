const express = require("express");
const {
  createAccountHandler,
  readAllAccountsHandler,
  readAccountByIdHandler,
  updateAccountHandler,
  deleteAccountHandler,
} = require("../controllers/adminController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/authorizeMiddleware");

const router = express.Router();

// Admin routes
router.post("/", authenticateToken, authorize(["admin"]), createAccountHandler);
router.get(
  "/",
  authenticateToken,
  authorize(["admin"]),
  readAllAccountsHandler
);
router.get(
  "/:accountId",
  authenticateToken,
  authorize(["admin"]),
  readAccountByIdHandler
);
router.put(
  "/:accountId",
  authenticateToken,
  authorize(["admin"]),
  updateAccountHandler
);
router.delete(
  "/:accountId",
  authenticateToken,
  authorize(["admin"]),
  deleteAccountHandler
);

module.exports = router;
