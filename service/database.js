const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const path = require("path");
const dbPath = path.join(__dirname, "../../data/database.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // Create account table
    db.run(
      `CREATE TABLE IF NOT EXISTS account (
      account_Id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_type TEXT NOT NULL,
      userName TEXT NOT NULL UNIQUE,
      passWord TEXT NOT NULL,
      refresh_token TEXT,
      isDeleted BOOLEAN DEFAULT FALSE
    )`,
      (err) => {
        if (err) {
          console.error("Error creating account table:", err.message);
        } else {
          console.log("Account table created or already exists.");
          // Insert default admin account if not exists
          insertDefaultAdminAccount();
        }
      }
    );

    // Create data table
    db.run(
      `CREATE TABLE IF NOT EXISTS data (
      data_Id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_Id INTEGER NOT NULL,
      content TEXT NOT NULL,
      status TEXT NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY (account_Id) REFERENCES account(account_Id)
    )`,
      (err) => {
        if (err) {
          console.error("Error creating data table:", err.message);
        } else {
          console.log("Data table created or already exists.");
        }
      }
    );
  });
}

function insertDefaultAdminAccount() {
  db.get(
    `SELECT * FROM account WHERE userName = ?`,
    ["admin"],
    async (err, user) => {
      if (err) {
        console.error("Error checking for default admin account:", err.message);
      } else if (!user) {
        try {
          const hashedPassword = await bcrypt.hash("admin", 10);
          db.run(
            `INSERT INTO account (account_type, userName, passWord) VALUES (?, ?, ?)`,
            ["admin", "admin", hashedPassword],
            (err) => {
              if (err) {
                console.error(
                  "Error inserting default admin account:",
                  err.message
                );
              } else {
                console.log("Default admin account created successfully.");
              }
            }
          );
        } catch (hashError) {
          console.error(
            "Error hashing password for default admin account:",
            hashError.message
          );
        }
      } else {
        console.log("Default admin account already exists.");
      }
    }
  );
}

module.exports = { db, initializeDatabase };
