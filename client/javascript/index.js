document.getElementById("logout-button").addEventListener("click", function () {
  // Delete token in localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  // Redirect to index page
  window.location.href = "index.html";
});

document
  .getElementById("Account-button")
  .addEventListener("click", function () {
    window.location.href = "account.html";
  });

const apiUrl = "http://localhost:3000";

// Function to refresh the access token
async function refreshToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    window.location.href = "index.html";
    return null;
  }

  try {
    const response = await fetch(`${apiUrl}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("token", data.accessToken);
      return data.accessToken;
    } else {
      window.location.href = "index.html"; // Redirect to login page if refresh fails
      return null;
    }
  } catch (error) {
    console.error("Error refreshing token:", error);
    window.location.href = "index.html";
    return null;
  }
}

// Function to fetch data with authentication and refresh token if needed
async function fetchWithAuth(url, options = {}) {
  let token = localStorage.getItem("token");

  // Append Authorization header
  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  let response = await fetch(url, options);

  // If token expired, refresh token once
  if (response.status === 401) {
    token = await refreshToken();
    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
      response = await fetch(url, options);
    }
  }

  return response;
}

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userName: username, passWord: password }),
    });

    // Check if response and set data to localStorage
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("data", JSON.stringify(data));
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      console.log("Token saved in login:", data);

      // Set display and hidden element
      document.getElementById("login-section").style.display = "none";
      document.getElementById("data-section").style.display = "block";
    } else {
      const errorData = await response.json();
      if (errorData.error === "Account has been deleted") {
        alert("This account has been deleted. Please contact support.");
      } else {
        alert("Login failed: " + errorData.error);
      }
    }
  } catch (error) {
    console.error("Error during login:", error);
    alert("An error occurred during login. Please try again later.");
  }
}

// Function addData to by account
async function addData() {
  const content = document.getElementById("content").value;
  const response = await fetchWithAuth(`${apiUrl}/data`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
}
// Add list Data
function addListData() {
  const listContent = document.getElementById("list-content").value;

  // Split the rows into an array
  const dataList = listContent.split("\n").filter((item) => item.trim() !== "");

  // Call function add data
  dataList.forEach((data) => {
    console.log("data: " + data);
    addData1(data);
  });
}
async function addData1(data) {
  const content = data;
  const response = await fetchWithAuth(`${apiUrl}/data`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content,
      status: "new",
      date: new Date().toISOString(),
    }),
  });

  if (response.ok) {
    const data = await response.json();
    // alert("Data added successfully" + data);
    // document.getElementById("content").value = "";
  } else {
    const errorData = await response.json();
    alert(`Failed to add data: ${errorData.error}`);
  }
}

// Get data in dataBase and display in index.html
async function fetchData() {
  const response = await fetchWithAuth(`${apiUrl}/data`, {
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
}

// If token valid and display data
window.onload = () => {
  const token = localStorage.getItem("token");
  console.log("Token on load:", token);
  if (token) {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("data-section").style.display = "block";
  }
};
