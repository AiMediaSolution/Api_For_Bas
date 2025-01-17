document.getElementById("logout-button").addEventListener("click", function () {
  // Delete token in localStorage
  localStorage.removeItem("token");

  // Redirect to index page
  window.location.href = "index.html";
});
document
  .getElementById("Account-button")
  .addEventListener("click", function () {
    window.location.href = "account.html";
  });
const apiUrl = "http://localhost:3000";

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
    // Check it response and set data to localStorage
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("data", JSON.stringify(data));
      localStorage.setItem("token", data.accessToken);
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
  const token = localStorage.getItem("token");
  const content = document.getElementById("content").value;
  if (!token) {
    alert("No token found. Please login first.");
    return;
  }
  // Try catch to post data
  try {
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

// Get data in dataBase and display in index.html
async function fetchData() {
  const token = localStorage.getItem("token");
  console.log("Token found in localStorage:", token);

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
    // ForEach all item in data to display
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
  console.log("Token on load:", token); // Log token to check
  //If token valid to set display class
  if (token) {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("data-section").style.display = "block";
  }
};
