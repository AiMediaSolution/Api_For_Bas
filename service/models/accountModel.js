const { db } = require("../database");
const bcrypt = require("bcrypt");

// Lấy người dùng theo tên người dùng
function getUserByUsername(username, callback) {
  db.get(`SELECT * FROM account WHERE userName = ?`, [username], callback);
}

// Tạo người dùng mới với mật khẩu đã được băm
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

// Lưu refresh token theo ID người dùng
function saveRefreshToken(accountId, refreshToken, callback) {
  db.run(
    `UPDATE account SET refresh_token = ? WHERE account_Id = ?`,
    [refreshToken, accountId],
    callback
  );
}

// Lấy refresh token theo ID người dùng
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
};
