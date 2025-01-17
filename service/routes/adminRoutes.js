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
router.post(
  "/",
  authenticateToken,
  authorize(["admin", "manager"]),
  createAccountHandler
);
router.get(
  "/",
  authenticateToken,
  authorize(["admin", "manager"]),
  readAllAccountsHandler
);
router.get(
  "/:accountId",
  authenticateToken,
  authorize(["admin", "manager"]),
  readAccountByIdHandler
);
router.put(
  "/:accountId",
  authenticateToken,
  authorize(["admin", "manager"]),
  updateAccountHandler
);
router.delete(
  "/:accountId",
  authenticateToken,
  authorize(["admin", "manager"]),
  deleteAccountHandler
);

module.exports = router;
