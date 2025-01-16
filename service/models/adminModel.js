const { db } = require("../database");
const bcrypt = require("bcrypt");

// Hàm băm mật khẩu bất đồng bộ
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Tạo tài khoản mới
async function createAccount(accountType, username, password, callback) {
  try {
    const hashedPassword = await hashPassword(password);
    db.run(
      `INSERT INTO account (account_type, userName, passWord) VALUES (?, ?, ?)`,
      [accountType, username, hashedPassword],
      callback
    );
  } catch (error) {
    callback(error);
  }
}

// Đọc tất cả tài khoản, ngoại trừ tài khoản admin hiện tại
function readAllAccounts(currentAdminId, callback) {
  db.all(
    `SELECT * FROM account WHERE account_Id != ?`,
    [currentAdminId],
    callback
  );
}

// Đọc một tài khoản cụ thể theo ID
function readAccountById(accountId, callback) {
  db.get(`SELECT * FROM account WHERE account_Id = ?`, [accountId], callback);
}

// Cập nhật tài khoản theo ID
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

// Xóa tài khoản theo ID
function deleteAccount(accountId, callback) {
  db.run(`DELETE FROM account WHERE account_Id = ?`, [accountId], callback);
}

module.exports = {
  createAccount,
  readAllAccounts,
  readAccountById,
  updateAccount,
  deleteAccount,
};
