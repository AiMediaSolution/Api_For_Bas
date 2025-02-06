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
    };

    ws.onmessage = (event) => {
      console.log("Received:", event.data);
      try {
        const data = JSON.parse(event.data);
        updateDataList(data);
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
    // const dataList = document.getElementById("data-list");
    // const div = document.createElement("div");
    // div.className = "data-item";
    // div.textContent = `Content: ${data.content}, Status: ${data.status}, Date: ${data.date}`;
    // dataList.appendChild(div);
  }

  // Hàm xử lý sự kiện đăng xuất
  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      window.location.href = "login.html";
    });
  }

  // Hàm xử lý sự kiện mở trang Account
  const accountButton = document.getElementById("Account-button");
  if (accountButton) {
    accountButton.addEventListener("click", () => {
      window.location.href = "account.html";
    });
  }

  // Hàm làm mới token
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

  // Hàm fetch dữ liệu với xác thực
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

  // Hàm thêm dữ liệu
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

  // Hàm lấy danh sách dữ liệu từ danh sách nhập vào
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

  // Hàm thêm nhiều dữ liệu
  const addMultiListData = async (dataList) => {
    try {
      const response = await fetchWithAuth("http://localhost:3000/data/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: dataList }),
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

  // Hàm lấy dữ liệu và hiển thị
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

  // Gắn sự kiện click cho các nút và form
  document
    .getElementById("fetch-data-button")
    .addEventListener("click", fetchData);
  document.getElementById("add-data-button").addEventListener("click", addData);
  document
    .getElementById("get-list-data-button")
    .addEventListener("click", getListData);

  // Kiểm tra token khi tải trang
  const token = localStorage.getItem("token");
  console.log("Token on load:", token);
  if (!token) {
    window.location.href = "login.html";
  }

  // Kết nối WebSocket khi trang được tải
  const userName = localStorage.getItem("userName");
  if (userName) {
    connectWebSocket(userName);
  }
});
