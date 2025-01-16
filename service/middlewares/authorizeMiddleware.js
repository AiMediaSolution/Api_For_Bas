// Middleware authorize để kiểm tra quyền truy cập dựa trên vai trò người dùng
function authorize(allowedRoles) {
  return (req, res, next) => {
    // Kiểm tra xem vai trò của người dùng có nằm trong danh sách allowedRoles hay không
    if (!allowedRoles.includes(req.user.account_type)) {
      return res.sendStatus(403); // Nếu người dùng không có quyền, trả về 403 Forbidden
    }
    next(); // Nếu thành công, tiếp tục request
  };
}

module.exports = { authorize };
