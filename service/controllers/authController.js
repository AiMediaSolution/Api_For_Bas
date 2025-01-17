require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
  getUserByUsername,
  createUser,
  saveRefreshToken,
  getRefreshTokenByUserId,
} = require("../models/accountModel");

// Đăng nhập và tạo access token và refresh token
function login(req, res) {
  console.log("ccc");
  const { userName, passWord } = req.body;
  console.log("ccc" + req.body);

  getUserByUsername(userName, (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user || !bcrypt.compareSync(passWord, user.passWord)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
      { account_Id: user.account_Id, account_type: user.account_type },
      process.env.SECRET_KEY,
      { expiresIn: "15m" } // Thời gian sống ngắn hơn cho access token
    );

    const refreshToken = jwt.sign(
      { account_Id: user.account_Id, account_type: user.account_type },
      process.env.REFRESH_SECRET_KEY,
      { expiresIn: "7d" } // Thời gian sống dài hơn cho refresh token
    );

    // Ghi lại token khi đăng nhập thành công
    console.log("Access Token:", accessToken);
    console.log("Refresh Token:", refreshToken);

    // Lưu refresh token vào cơ sở dữ liệu
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
