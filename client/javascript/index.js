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
    localStorage.setItem("token", data.token); // Lưu trữ token vào localStorage
    document.getElementById("login-section").style.display = "none";
    document.getElementById("data-section").style.display = "block";
  } else {
    alert("Login failed");
  }
}

async function addData() {
  const content = document.getElementById("content").value;
  const token = localStorage.getItem("token");
  console.log(localStorage.getItem("token"));
  console.log("Token:", token);
  if (!token) {
    alert("No token found. Please login first.");
    return;
  }

  const response = await fetch(`${apiUrl}/data`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Đính kèm token trong header Authorization
    },
    body: JSON.stringify({
      content,
      status: "new",
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
}

async function fetchData() {
  const token = localStorage.getItem("token"); // Lấy token từ localStorage
  console.log("token ne: " + token);
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
  if (token) {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("data-section").style.display = "block";
  }
};
