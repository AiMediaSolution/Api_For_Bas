const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const multer = require("multer");
const csvParser = require("csv-parser");
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
const db = new sqlite3.Database("database.db"); // Use a file-based database
const upload = multer({ dest: "uploads/" });
const SECRET_KEY = "your_secret_key";

app.use(bodyParser.json());
app.use(cors());

// Initialize database
db.serialize(() => {
  // Create account table
  db.run(`CREATE TABLE IF NOT EXISTS account (
    account_Id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_type TEXT NOT NULL,
    userName TEXT NOT NULL UNIQUE,
    passWord TEXT NOT NULL
  )`);

  // Create data table
  db.run(`CREATE TABLE IF NOT EXISTS data (
    data_Id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_Id INTEGER NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL,
    date TEXT NOT NULL,
    FOREIGN KEY (account_Id) REFERENCES account(account_Id)
  )`);

  // Insert default admin account if not exists
  db.get(`SELECT * FROM account WHERE userName = ?`, ["admin"], (err, user) => {
    if (!user) {
      const hashedPassword = bcrypt.hashSync("admin", 10);
      db.run(
        `INSERT INTO account (account_type, userName, passWord) VALUES (?, ?, ?)`,
        ["admin", "admin", hashedPassword]
      );
    }
  });
});

// Middleware for authentication
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Lấy token từ header Authorization
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403); // Token không hợp lệ
    req.user = user;
    next();
  });
}

// Middleware for authorization
function authorize(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.account_type)) {
      return res.sendStatus(403);
    }
    next();
  };
}

// Login endpoint
app.post("/login", (req, res) => {
  const { userName, passWord } = req.body;

  db.get(
    `SELECT * FROM account WHERE userName = ?`,
    [userName],
    (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user || !bcrypt.compareSync(passWord, user.passWord)) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign(
        { account_Id: user.account_Id, account_type: user.account_type },
        SECRET_KEY,
        { expiresIn: "1h" } // Token expires in 1 hour
      );
      res.json({ token });
    }
  );
});

// Add customers via CSV (Manager only)
app.post(
  "/add-customers",
  authenticateToken,
  authorize(["manager"]),
  upload.single("file"),
  (req, res) => {
    const filePath = req.file.path;

    const customers = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        const { userName, passWord } = row;
        const hashedPassword = bcrypt.hashSync(passWord, 10);
        customers.push(["customer", userName, hashedPassword]);
      })
      .on("end", () => {
        const placeholders = customers.map(() => "(?, ?, ?)").join(",");
        const query = `INSERT INTO account (account_type, userName, passWord) VALUES ${placeholders}`;
        const values = customers.flat();

        db.run(query, values, function (err) {
          fs.unlinkSync(filePath);
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: "Customers added successfully" });
        });
      });
  }
);

// Add data
app.post("/data", authenticateToken, (req, res) => {
  const { content, status, date } = req.body;
  const { account_Id } = req.user;

  db.run(
    `INSERT INTO data (account_Id, content, status, date) VALUES (?, ?, ?, ?)`,
    [account_Id, content, status, date],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ data_Id: this.lastID });
    }
  );
});

// View data
app.get("/data", authenticateToken, (req, res) => {
  const { account_type, account_Id } = req.user;

  let query = "SELECT * FROM data";
  const params = [];

  if (account_type === "customer") {
    query += " WHERE account_Id = ?";
    params.push(account_Id);
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
