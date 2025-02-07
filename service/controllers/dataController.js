const {
  addData,
  getDataByAccountId,
  getAllData,
  updateStatus,
  addMultiData,
  getAllDataPending,
  getCountOfDataPending,
} = require("../models/dataModel");
const { broadcast } = require("../webSocketServer");

function addDataHandler(req, res) {
  const account_Id = req.user.account_Id;
  const { content, status, date } = req.body;
  addData(account_Id, content, status, date, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const data = {
      status: true,
      message: "Data added successfully",
    };
    broadcast("admin", data);
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
    getCountOfDataPending((err, countDataPending) => {
      if (err) return res.status(500).json({ error: err.message });
      const broadcastData = {
        count: countDataPending,
        payload: {
          statusBas: "pending",
          message: "Multiple data added successfully",
          accountId: req.user.account_Id,
          action: "addMultipleData",
          data: "",
        },
      };
      broadcast("BAS", broadcastData);
      res.status(201).json({ message: "Multiple data added successfully" });
    });
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
  const {
    count,
    statusBas,
    payload: { message, account_Id, action, data },
  } = req.body;

  console.log(statusBas);

  const { data_Id, content, statusData, date, userName } = data || {};
  console.log(userName);

  if (userName === "BAS") {
    getCountOfDataPending((err, countDataPending) => {
      if (err) return res.status(500).json({ error: err.message });

      const broadcastData = {
        count: countDataPending,
        statusBas: "free",
        payload: {
          statusBas: "free",
          message: "Multiple data added successfully",
          action: "done doing bas",
          data: "",
        },
      };

      broadcast("BAS", broadcastData);
      return res
        .status(201)
        .json({ message: "Multiple websocket successfully" }); // 🔴 Thêm return ở đây
    });

    return; // 🔴 Chặn code tiếp tục chạy updateStatus() nếu userName === "BAS"
  }

  updateStatus(statusData, date, data_Id, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    broadcast(userName, {
      userName,
      status: statusData,
      data_Id,
      date,
      message: `Processing element with content: ${content}`,
    });

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

module.exports = {
  addDataHandler,
  getDataHandler,
  updateStatusHandler,
  getAllDataForBas,
  addMultiDataHandler,
  updateSocket,
  updateDataInWebsocket,
};
