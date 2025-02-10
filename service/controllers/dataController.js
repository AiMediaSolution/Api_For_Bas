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
  const { data, userName } = req.body;
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
          statusBas: "doing",
          roomName: "BAS",
          content: "",
          message: "Multiple data added successfully",
          account_Id: req.user.account_Id,
          action: "addMultipleData",
          data: {
            userName: userName,
          },
        },
      };
      broadcast("BAS", broadcastData);
      broadcast(userName, broadcastData);
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
    payload: { roomName, statusBas, message, account_Id, action, data },
  } = req.body;
  const { data_Id, content, statusData, date, userName } = data || {};
  if (roomName === "BAS") {
    let newStatusBas = "Free";
    getCountOfDataPending((err, countDataPending) => {
      if (err) return res.status(500).json({ error: err.message });
      console.log(countDataPending, " ne");
      if (!countDataPending == 0) {
        newStatusBas = "doing";
      }
      const broadcastData = {
        count: countDataPending,
        payload: {
          roomName: "BAS",
          statusBas: newStatusBas,
          content: content,
          message: "Multiple data added successfully",
          action: "done update bas",
          data: data,
        },
      };
      broadcast("BAS", broadcastData);
      broadcast(userName, broadcastData);
      return res
        .status(201)
        .json({ message: "Multiple websocket successfully" });
    });

    return;
  }

  updateStatus(statusData, date, data_Id, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    getCountOfDataPending((err, countDataPending) => {
      if (err) return res.status(500).json({ error: err.message });

      const newData = {
        data_Id: data_Id,
        statusData: statusData,
        content: content,
        date: date,
        userName: userName,
      };
      const broadcastData1 = {
        count: countDataPending,
        roomName: userName,
        payload: {
          statusBas: statusBas,
          message: message,
          accountId: account_Id,
          action: action,
          data: newData,
        },
      };
      broadcast(userName, broadcastData1);
      return res.status(201).json({ message: "Edit successfully" });
    });
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
