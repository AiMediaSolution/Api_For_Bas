const apiUrl = "http://localhost:3000";
const token = localStorage.getItem("token");

// Function to fetch all accounts
async function fetchAccounts() {
  const response = await fetch(`${apiUrl}/admin`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    const accounts = await response.json();
    displayAccounts(accounts);
  } else {
    alert("Failed to fetch accounts");
  }
}

// Function to display accounts in the table
function displayAccounts(accounts) {
  const accountTableBody = document.getElementById("accountTableBody");
  accountTableBody.innerHTML = "";

  accounts.forEach((account) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${account.account_Id}</td>
            <td>${account.account_type}</td>
            <td>${account.userName}</td>
            <td>
                <button onclick="editAccount(${account.account_Id})">Edit</button>
                <button onclick="deleteAccount(${account.account_Id})">Delete</button>
            </td>
        `;
    accountTableBody.appendChild(row);
  });
}

// Function to create a new account
document
  .getElementById("createForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const accountType = document.getElementById("accountType").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch(`${apiUrl}/admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ accountType, username, password }),
    });

    if (response.ok) {
      fetchAccounts();
      document.getElementById("createForm").reset();
    } else {
      alert("Failed to create account");
    }
  });

// Function to delete an account
async function deleteAccount(accountId) {
  const response = await fetch(`${apiUrl}/admin/${accountId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    fetchAccounts();
  } else {
    alert("Failed to delete account");
  }
}

// Function to edit an account
function editAccount(accountId) {
  document.getElementById("update-account").style.display = "block";

  const account = Array.from(
    document.getElementById("accountTableBody").children
  ).find((row) => row.children[0].textContent == accountId);

  document.getElementById("updateAccountId").value = accountId;
  document.getElementById("updateAccountType").value =
    account.children[1].textContent;
  document.getElementById("updateUsername").value =
    account.children[2].textContent;
}

// Function to update an account
document
  .getElementById("updateForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const accountId = document.getElementById("updateAccountId").value;
    const accountType = document.getElementById("updateAccountType").value;
    const username = document.getElementById("updateUsername").value;
    const password = document.getElementById("updatePassword").value;

    const response = await fetch(`${apiUrl}/admin/${accountId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ accountType, username, password }),
    });

    if (response.ok) {
      fetchAccounts();
      document.getElementById("updateForm").reset();
      document.getElementById("update-account").style.display = "none";
    } else {
      alert("Failed to update account");
    }
  });

// Function to log out
function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

// Initial fetch of accounts
fetchAccounts();
