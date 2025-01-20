const { db } = require("../database");
const bcrypt = require("bcrypt");

// Asynchronous password hashing
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Create new account
async function createAccount(accountType, username, password, callback) {
  try {
    const hashedPassword = await hashPassword(password);
    db.run(
      `INSERT INTO account (account_type, userName, passWord) VALUES (?, ?, ?)`,
      [accountType, username, hashedPassword],
      (err) => {
        if (err) {
          if (err.code === "SQLITE_CONSTRAINT") {
            // Check for binding errors UNIQUE
            callback(new Error("Username already exists"));
          } else {
            callback(err);
          }
        } else {
          callback(null);
        }
      }
    );
  } catch (error) {
    callback(error);
  }
}

// Read all account in dataBase by Admin
function readAllAccounts(currentAdminId, callback) {
  db.all(
    `SELECT * FROM account WHERE account_Id != ? AND account_type != 'admin'`,
    [currentAdminId],
    callback
  );
}
// Read all account in dataBase by Manager
function readCustomerAccounts(currentAdminId, callback) {
  db.all(
    `SELECT * FROM account WHERE account_Id != ? AND account_type = 'customer'`,
    [currentAdminId],
    callback
  );
}
// Read a specific account by Id
function readAccountById(accountId, callback) {
  db.get(`SELECT * FROM account WHERE account_Id = ?`, [accountId], callback);
}

// Update account by ID
async function updateAccount(
  accountId,
  accountType,
  username,
  password,
  callback
) {
  try {
    const hashedPassword = await hashPassword(password);
    db.run(
      `UPDATE account SET account_type = ?, userName = ?, passWord = ? WHERE account_Id = ?`,
      [accountType, username, hashedPassword, accountId],
      callback
    );
  } catch (error) {
    callback(error);
  }
}

// Delete account by
function deleteAccount(accountId, callback) {
  db.run(
    `UPDATE account SET isDeleted = TRUE WHERE account_Id = ?`,
    [accountId],
    callback
  );
}
// Restore account by Id
function restoreAccount(accountId, callback) {
  db.run(
    `UPDATE account SET isDeleted = FALSE WHERE account_Id = ?`,
    [accountId],
    callback
  );
}

module.exports = {
  createAccount,
  readAllAccounts,
  readAccountById,
  updateAccount,
  deleteAccount,
  readCustomerAccounts,
  restoreAccount,
};
