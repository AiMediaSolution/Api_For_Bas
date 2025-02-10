document.addEventListener("DOMContentLoaded", () => {
  const apiUrl = "ws://localhost:3000";
  let ws;

  function connectWebSocket(userName) {
    ws = new WebSocket(apiUrl);

    ws.onopen = () => {
      console.log("Connected to WebSocket server.");
      const joinRoomMessage = JSON.stringify({ type: "join", room: userName });
      ws.send(joinRoomMessage);
      console.log(`Sent join room request for room: ${userName}`);
      const fetchCurrentDataMessage = JSON.stringify({
        type: "fetch_current_data",
      });
      ws.send(fetchCurrentDataMessage);
      console.log("Sent request to fetch current data.");
    };

    ws.onmessage = (event) => {
      try {
        console.log("Received:", event.data);
        const data = JSON.parse(event.data);
        let statusBas = "Unknown";
        if (data && data.payload) {
          updateDataList(data);
          if (data.payload.statusBas) {
            statusBas = data.payload.statusBas;
          } else {
            console.warn("Missing statusBas in payload, setting default.");
          }
        } else {
          console.warn("Invalid data received, skipping updateDataList.");
        }
        updateStatusOfBas(statusBas);
      } catch (err) {
        console.error("Error processing message:", err);
      }
    };

    ws.onclose = () => {
      console.log(
        "Disconnected from WebSocket server. Reconnecting in 5 seconds..."
      );
      setTimeout(() => connectWebSocket(userName), 5000);
    };
    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };
  }

  function updateDataList(data) {
    console.log("Received:", data);
    const dataList = document.getElementById("data-now");
    dataList.innerHTML = "";
    const div = document.createElement("div");
    div.className = "data-item";
    const action = data.payload.action || "";
    if (action === "editData") {
      div.textContent = `${data.payload.message}, Date: ${
        data.payload.data.date || "N/A"
      }, Content: ${data.payload.data.content || "N/A"}, Status now: ${
        data.payload.data.statusData || "N/A"
      } `;
      dataList.appendChild(div);
    }
  }
  function updateStatusOfBas(newMessage) {
    const messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML = `<p><strong>BAS status:</strong> ${newMessage}</p>`;
  }
  // Logout
  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", (event) => {
      event.preventDefault();
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      window.location.href = "login.html";
    });
  }

  // Event handler function opens Account paget
  const accountButton = document.getElementById("Account-button");
  if (accountButton) {
    accountButton.addEventListener("click", (event) => {
      event.preventDefault();
      window.location.href = "account.html";
    });
  }

  // refresh token
  const refreshToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      window.location.href = "login.html";
      return null;
    }

    try {
      const response = await fetch("http://localhost:3000/auth/refresh-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.accessToken);
        return data.accessToken;
      } else {
        window.location.href = "login.html";
        return null;
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      window.location.href = "login.html";
      return null;
    }
  };

  // Fetch data with authentication
  const fetchWithAuth = async (url, options = {}) => {
    let token = localStorage.getItem("token");
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };

    let response = await fetch(url, options);

    if (response.status === 401) {
      token = await refreshToken();
      if (token) {
        options.headers.Authorization = `Bearer ${token}`;
        response = await fetch(url, options);
      }
    }

    return response;
  };

  // add new data by user
  const addData = async () => {
    const content = document.getElementById("content").value;
    try {
      const response = await fetchWithAuth("http://localhost:3000/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          status: "processing",
          date: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        alert("Data added successfully");
        document.getElementById("content").value = "";
      } else {
        const errorData = await response.json();
        alert(`Failed to add data: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error adding data:", error);
      alert("An error occurred while adding data. Please try again later.");
    }
  };

  // Get list of data from input list
  const getListData = () => {
    const listContent = document.getElementById("list-content").value;
    const dataList = listContent
      .split("\n")
      .filter((item) => item.trim() !== "");
    const formattedData = dataList
      .map((content) => ({
        content: content.trim(),
        status: "pending",
        date: new Date().toISOString(),
      }))
      .filter((data) => data.content);
    addMultiListData(formattedData);
  };

  // Add multi data
  const addMultiListData = async (dataList) => {
    const userName = localStorage.getItem("userName");
    try {
      const response = await fetchWithAuth("http://localhost:3000/data/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: dataList, userName: userName }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("All data added successfully:", result);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add multiple data");
      }
    } catch (error) {
      console.error("Error adding multiple data:", error);
      alert(`Error: ${error.message}`);
    }
  };

  // Get all data by user role
  const fetchData = async () => {
    try {
      const response = await fetchWithAuth("http://localhost:3000/data", {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        const dataList = document.getElementById("data-list");
        dataList.innerHTML = "";
        data.forEach((item) => {
          const div = document.createElement("div");
          div.className = "data-item";
          div.textContent = `Content: ${item.content}, Status: ${item.status}, Date: ${item.date}`;
          dataList.appendChild(div);
        });
      } else {
        alert("Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("An error occurred while fetching data. Please try again later.");
    }
  };

  // Attach click event to buttons and forms
  document
    .getElementById("fetch-data-button")
    .addEventListener("click", fetchData);
  document.getElementById("add-data-button").addEventListener("click", addData);
  document
    .getElementById("get-list-data-button")
    .addEventListener("click", getListData);

  // Check token when page is loaded
  const token = localStorage.getItem("token");
  console.log("Token on load:", token);
  if (!token) {
    window.location.href = "login.html";
  }

  // WebSocket connection when page is loaded
  const userName = localStorage.getItem("userName");
  if (userName) {
    connectWebSocket(userName);
  }
});
