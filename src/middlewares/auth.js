const jwt = require("jsonwebtoken");
const User = require("../models/user");
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).send({
        success: false,
        message: "Token not found",
      });
    }
    const secret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);  
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).send({
        success: false,
        message: "User not found",
      });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(400).send({
      success: false,
      message: "Error authenticating user",
      error: err.message,
    });
  }
};

module.exports = authMiddleware;
