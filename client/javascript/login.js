document.addEventListener("DOMContentLoaded", () => {
  const apiUrl = "http://localhost:3000";

  // Hàm làm mới token
  const refreshToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      window.location.href = "login.html";
      return null;
    }

    try {
      const response = await fetch(`${apiUrl}/auth/refresh-token`, {
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

  const login = async () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName: username, passWord: password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("data", JSON.stringify(data));
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("userName", username);
        console.log("Token saved in login:", data);
        window.location.href = "index.html";
      } else {
        const errorData = await response.json();
        alert(`Login failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred during login. Please try again later.");
    }
  };

  // Gắn sự kiện click cho nút đăng nhập
  document.getElementById("login-button").addEventListener("click", login);
});
