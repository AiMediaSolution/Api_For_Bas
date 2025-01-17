const {
  addData,
  getDataByAccountId,
  getAllData,
} = require("../models/dataModel");

function addDataHandler(req, res) {
  const account_Id = req.user.account_Id;
  const { content, status, date } = req.body;
  addData(account_Id, content, status, date, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: "Data added successfully" });
  });
}

// function fetchAllDataHandler(req, res) {
//   const { account_type } = req.user;
//   addData(account_Id, content, status, date, (err) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }
//     res.status(201).json({ message: "Data added successfully" });
//   });
// }

function getDataHandler(req, res) {
  const { account_type, account_Id } = req.user;
  console.log(account_Id + " " + account_type + "cccccccccc");
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

module.exports = { addDataHandler, getDataHandler };
