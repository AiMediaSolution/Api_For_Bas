const jwt = require("jsonwebtoken");
const app = require("../app");
require("dotenv").config();

function authenticateToken(req, res, next) {
  console.log("toi đây rồi nè");
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log("toi đây rồi nè" + authHeader);
  console.log("toi đây rồi nè" + token);
  console.log("toi đây rồi nè22222222221" + process.env.ACCESS_TOKEN_SECRET);
  if (!token) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    console.log("error: " + err);
    if (err) {
      return res.sendStatus(403); // Forbidden
    }
    req.user = user;
    next();
  });
}

module.exports = { authenticateToken };
