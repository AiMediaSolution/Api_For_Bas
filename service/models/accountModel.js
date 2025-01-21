const { db } = require("../database");
const bcrypt = require("bcrypt");

// Get user account by userName
function getUserByUsername(userName, callback) {
  db.get(`SELECT * FROM account WHERE userName = ?`, [userName], (err, row) => {
    if (err) {
      return callback(err);
    }
    callback(null, row);
  });
}

// Create new account with hashed password
async function createUser(accountType, username, password, callback) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      `INSERT INTO account (account_type, userName, passWord) VALUES (?, ?, ?)`,
      [accountType, username, hashedPassword],
      callback
    );
  } catch (error) {
    callback(error);
  }
}
async function createCustomerAccount(userName, password, callback) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      `INSERT INTO account (account_type, userName, passWord) VALUES(?, ?, ?)`,
      ["customer", userName, hashedPassword]
    );
  } catch (error) {
    callback(error);
  }
}

// Save refresh token by accountId
function saveRefreshToken(accountId, refreshToken, callback) {
  db.run(
    `UPDATE account SET refresh_token = ? WHERE account_Id = ?`,
    [refreshToken, accountId],
    callback
  );
}

// Get refresh token by accountId
function getRefreshTokenByUserId(accountId, callback) {
  db.get(
    `SELECT refresh_token FROM account WHERE account_Id = ?`,
    [accountId],
    (err, row) => {
      if (err) return callback(err);
      callback(null, row ? row.refresh_token : null);
    }
  );
}

module.exports = {
  getUserByUsername,
  createUser,
  saveRefreshToken,
  getRefreshTokenByUserId,
  createCustomerAccount,
};
