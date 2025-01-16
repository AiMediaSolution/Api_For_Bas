const { getDataByAccountId, getAllData } = require("../models/dataModel");
const { db } = require("../database");

function addData(req, res) {
  const { account_Id, content, status, date } = req.body;

  db.run(
    `INSERT INTO data (account_Id, content, status, date) VALUES (?, ?, ?, ?)`,
    [account_Id, content, status, date],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res
        .status(201)
        .json({ message: "Data added successfully", id: this.lastID });
    }
  );
}

function fetchData(req, res) {
  db.all(`SELECT * FROM data`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
}

function getDataHandler(req, res) {
  const { account_type, account_Id } = req.user;

  if (account_type === "customer") {
    getDataByAccountId(account_Id, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  } else {
    getAllData((err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  }
}

module.exports = { addData, fetchData, getDataHandler };
