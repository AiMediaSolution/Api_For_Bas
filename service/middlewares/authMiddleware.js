const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

// Middleware authenticateToken để xác thực token JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401); // Nếu không có token, trả về 401 Unauthorized

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403); // Nếu xác thực token thất bại, trả về 403 Forbidden
    req.user = user;
    next(); // Nếu thành công, tiếp tục request
  });
}

module.exports = { authenticateToken };
