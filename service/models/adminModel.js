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
    `SELECT 
    a.account_Id, 
    a.account_type, 
    a.userName, 
    a.isDeleted, 
    COUNT(d.account_Id) AS data
    FROM account a
    LEFT JOIN data d ON a.account_Id = d.account_Id
    WHERE a.account_Id != ? AND a.account_type != 'admin'
    GROUP BY a.account_Id, a.account_type, a.userName, a.isDeleted;
    `,
    [currentAdminId],
    callback
  );
}

// Read all account in dataBase by Manager
function readCustomerAccounts(currentAdminId, callback) {
  db.all(
    `SELECT 
    a.account_Id, 
    a.account_type, 
    a.userName, 
    a.isDeleted, 
    COUNT(d.account_Id) AS data
    FROM account a
    LEFT JOIN data d ON a.account_Id = d.account_Id
    WHERE a.account_Id != ? AND a.account_type != 'admin' AND a.account_type != 'manager'
    GROUP BY a.account_Id, a.account_type, a.userName, a.isDeleted;`,
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
    let query = `UPDATE account SET account_type = ?, userName = ?`;
    let params = [accountType, username];

    if (password) {
      const hashedPassword = await hashPassword(password);
      query += `, passWord = ?`;
      params.push(hashedPassword);
    }

    query += ` WHERE account_Id = ?`;
    params.push(accountId);

    db.run(query, params, callback);
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
