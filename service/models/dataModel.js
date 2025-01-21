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

function getAllAccountAdmin(callback) {
  db.all(`SELECT * FROM account WHERE account_type = 'admin'`, [], callback);
}
function updateStatus(data_Id, date, newStatus, callback) {
  db.run(
    `UPDATE data SET status = ? , "date" = ?  WHERE account_Id = ?`,
    [newStatus, date, data_Id],
    callback
  );
}
module.exports = {
  addData,
  getDataByAccountId,
  getAllData,
  getAllAccountAdmin,
  updateStatus,
};
