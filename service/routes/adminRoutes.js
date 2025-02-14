const express = require("express");
const {
  createAccountHandler,
  readAllAccountsHandler,
  readAccountByIdHandler,
  updateAccountHandler,
  deleteAccountHandler,
  restoreAccountHandler,
} = require("../controllers/adminController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/authorizeMiddleware");

const router = express.Router();

// Admin routes

// Create new account
router.post(
  "/",
  authenticateToken,
  authorize(["admin", "manager"]),
  createAccountHandler
);
// Get all account
router.get(
  "/",
  authenticateToken,
  authorize(["admin", "manager"]),
  readAllAccountsHandler
);
// Read account by id
router.get(
  "/:accountId",
  authenticateToken,
  authorize(["admin", "manager"]),
  readAccountByIdHandler
);
// Edit account
router.put(
  "/:accountId",
  authenticateToken,
  authorize(["admin", "manager"]),
  updateAccountHandler
);
// Delete account
router.delete(
  "/:accountId",
  authenticateToken,
  authorize(["admin", "manager"]),
  deleteAccountHandler
);
router.put(
  "/restore/:accountId",
  authenticateToken,
  authorize(["admin", "manager"]),
  restoreAccountHandler
);

module.exports = router;
