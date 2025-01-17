require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
  getUserByUsername,
  createUser,
  saveRefreshToken,
  getRefreshTokenByUserId,
} = require("../models/accountModel");

// Login and create access token and refresh token
function login(req, res) {
  const { userName, passWord } = req.body;

  getUserByUsername(userName, (err, user) => {
    if (err) return res.status(500).json({ error: err.message });

    // Check account invalid or deleted
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    } else if (user.isDeleted) {
      return res.status(403).json({ error: "Account has been deleted" });
    }

    // Check password
    if (!bcrypt.compareSync(passWord, user.passWord)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
      { account_Id: user.account_Id, account_type: user.account_type },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { account_Id: user.account_Id, account_type: user.account_type },
      process.env.REFRESH_SECRET_KEY,
      { expiresIn: "7d" }
    );

    // write token when login successfully
    console.log("Access Token:", accessToken);
    console.log("Refresh Token:", refreshToken);

    // save refresh token to data base
    saveRefreshToken(user.account_Id, refreshToken, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ accessToken, refreshToken });
    });
  });
}

// Làm mới access token bằng refresh token
function refreshToken(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.status(401).json({ error: "No refresh token provided" });

  jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid refresh token" });

    getRefreshTokenByUserId(user.account_Id, (err, storedToken) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!storedToken || storedToken !== refreshToken) {
        return res.status(403).json({ error: "Refresh token mismatch" });
      }

      const newAccessToken = jwt.sign(
        { account_Id: user.account_Id, account_type: user.account_type },
        process.env.SECRET_KEY,
        { expiresIn: "15m" }
      );
      res.json({ accessToken: newAccessToken });
    });
  });
}

module.exports = { login, refreshToken };
