const {
  addData,
  getDataByAccountId,
  getAllData,
  updateStatus,
} = require("../models/dataModel");
const { broadcast } = require("../webSocketServer");

function addDataHandler(req, res) {
  const account_Id = req.user.account_Id;
  const { content, status, date } = req.body;
  addData(account_Id, content, status, date, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    broadcast({ account_Id, content, status, date });
    res.status(201).json({ message: "Data added successfully" });
  });
}

function getDataHandler(req, res) {
  const { account_type, account_Id } = req.user;
  if (account_type === "customer") {
    getDataByAccountId(account_Id, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  } else if (account_type === "admin" || account_type === "manager") {
    getAllData((err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  } else {
    res.status(403).json({ message: "Forbidden: Invalid account type" });
  }
}
function updateStatusHandler(req, res) {
  const { data_Id, status, date } = req.body;
  updateStatus(status, date, data_Id, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    broadcast({ data_Id, date, data_Id });
    res.status(201).json({ message: "Edit successfully" });
  });
}

module.exports = { addDataHandler, getDataHandler, updateStatusHandler };
