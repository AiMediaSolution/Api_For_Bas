function authorize(roles = []) {
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user || (roles.length && !roles.includes(req.user.account_type))) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

module.exports = { authorize };
