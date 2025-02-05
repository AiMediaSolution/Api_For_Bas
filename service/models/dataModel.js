const { db } = require("../database");

function addData(accountId, content, status, date, callback) {
  db.run(
    `INSERT INTO data (account_Id, content, status, date) VALUES (?, ?, ?, ?)`,
    [accountId, content, status, date],
    callback
  );
}
function addMultiData(dataArray, callback) {
  const placeholders = dataArray.map(() => "(?, ?, ?, ?)").join(", ");
  const values = dataArray.flatMap(({ accountId, content, status, date }) => [
    accountId,
    content,
    status,
    date,
  ]);

  const query = `
    INSERT INTO data (account_Id, content, status, date)
    VALUES ${placeholders}
  `;

  db.run("BEGIN TRANSACTION", (err) => {
    if (err) return callback(err);

    db.run(query, values, (insertErr) => {
      if (insertErr) {
        db.run("ROLLBACK", () => callback(insertErr));
      } else {
        db.run("COMMIT", callback);
      }
    });
  });
}

function getDataByAccountId(accountId, callback) {
  db.all(`SELECT * FROM data WHERE account_Id = ?`, [accountId], callback);
}

function getAllData(callback) {
  db.all(`SELECT * FROM data`, [], callback);
}
function getAllDataProcessing(callback) {
  db.all(`SELECT * FROM data WHERE = "processing"`, [], callback);
}
function getAllAccountAdmin(callback) {
  db.all(`SELECT * FROM account WHERE account_type = 'admin'`, [], callback);
}
function updateStatus(newStatus, date, data_Id, callback) {
  db.run(
    `UPDATE data SET status = ? , "date" = ?  WHERE data_Id = ?`,
    [newStatus, date, data_Id],
    callback
  );
}
function getAllDataPending(callback) {
  db.all(
    `SELECT * FROM data WHERE status = 'new status khanh 1'`,
    [],
    callback
  );
}
module.exports = {
  addData,
  getDataByAccountId,
  getAllData,
  getAllAccountAdmin,
  updateStatus,
  getAllDataProcessing,
  addMultiData,
  getAllDataPending,
};
