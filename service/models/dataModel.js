const { db } = require("../database");

function addData(accountId, content, status, date, callback) {
  db.run(
    `INSERT INTO data (account_Id, content, status, date) VALUES (?, ?, ?, ?)`,
    [accountId, content, status, date],
    callback
  );
}

function getDataByAccountId(accountId, callback) {
  db.all(`SELECT * FROM data WHERE account_Id = ?`, [accountId], callback);
}

function getAllData(callback) {
  db.all(`SELECT * FROM data`, [], callback);
}

// Sửa hàm này để truy vấn từ bảng account với điều kiện account_type là 'admin'
function getAllAccountAdmin(callback) {
  db.all(`SELECT * FROM account WHERE account_type = 'admin'`, [], callback);
}

module.exports = {
  addData,
  getDataByAccountId,
  getAllData,
  getAllAccountAdmin,
};
