const {
  addData,
  getDataByAccountId,
  getAllData,
  updateStatus,
  addMultiData,
  getAllDataPending,
} = require("../models/dataModel");
const { broadcast } = require("../webSocketServer");

function addDataHandler(req, res) {
  const account_Id = req.user.account_Id;
  const { content, status, date } = req.body;
  addData(account_Id, content, status, date, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    broadcast({ status: true });
    res.status(201).json({ message: "Data added successfully" });
  });
}
function addMultiDataHandler(req, res) {
  const account_Id = req.user.account_Id;
  const { data } = req.body;

  if (!Array.isArray(data) || data.length === 0) {
    return res.status(400).json({ error: "Invalid or empty data array" });
  }

  const dataArray = data.map((item) => ({
    accountId: account_Id,
    content: item.content,
    status: item.status,
    date: item.date,
  }));

  addMultiData(dataArray, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    broadcast("BAS", { status: true });
    res.status(201).json({ message: "Multiple data added successfully" });
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
  const { data_Id, status, date, content, userName } = req.body;
  updateStatus(status, date, data_Id, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const data1 = {
      userName: userName,
      status: status,
      message: `Processing element with content: ${content}`,
    };
    broadcast("admin", data1);
    res.status(201).json({ message: "Edit successfully" });
  });
}
function getAllDataForBas(req, res) {
  getAllDataPending((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
}

function updateSocket(req, res) {
  const { status } = req.body;
  broadcast({ status });
  res.status(200).json({ message: "Status updated successfully" });
}
function updateDataInWebsocket(req, res) {
  const { data } = res.body;
  res.status(200).json({ message: "Edit Data when listening in websocket" });
}
function countDataPending(req, res) {
  getAllDataPending((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const count = rows.length;
    res.json({ count });
  });
}

module.exports = {
  addDataHandler,
  getDataHandler,
  updateStatusHandler,
  getAllDataForBas,
  addMultiDataHandler,
  updateSocket,
  updateDataInWebsocket,
  countDataPending,
};
