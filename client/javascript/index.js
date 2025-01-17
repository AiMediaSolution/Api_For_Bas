document.getElementById("logout-button").addEventListener("click", function () {
  // Xóa token từ localStorage
  localStorage.removeItem("token");

  // Chuyển hướng người dùng đến trang đăng nhập
  window.location.href = "index.html";
});

const apiUrl = "http://localhost:3000";

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const response = await fetch(`${apiUrl}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userName: username, passWord: password }),
  });

  if (response.ok) {
    const data = await response.json();
    localStorage.setItem("data", data);
    localStorage.setItem("token", data.accessToken); // Lưu trữ token vào localStorage
    console.log("Token saved in login:", data);
    document.getElementById("login-section").style.display = "none";
    document.getElementById("data-section").style.display = "block";
  } else {
    alert("Login failed");
  }
}

async function addData() {
  const token = localStorage.getItem("token");
  const content = document.getElementById("content").value;
  if (!token) {
    alert("No token found. Please login first.");
    return;
  }
  try {
    console.log("add data");
    const response = await fetch(`${apiUrl}/data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        content,
        status: "new",
        date: new Date().toISOString(),
      }),
    });
    if (response.ok) {
      const data = await response.json();
      alert("Data added successfully" + data);
      document.getElementById("content").value = "";
    } else {
      const errorData = await response.json();
      alert(`Failed to add data: ${errorData.error}`);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to add data: Network error or server is down");
  }
}

async function fetchData() {
  const token = localStorage.getItem("token");
  console.log("Token found in localStorage:", token); // Log token để kiểm tra

  if (!token) {
    alert("No token found. Please login first.");
    return;
  }

  const response = await fetch(`${apiUrl}/data`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
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
}

// Kiểm tra nếu token tồn tại và hiển thị phần data
window.onload = () => {
  const token = localStorage.getItem("token");
  console.log("Token on load:", token); // Log token để kiểm tra

  if (token) {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("data-section").style.display = "block";
  }
};
