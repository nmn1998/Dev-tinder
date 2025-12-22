const jwt = require("jsonwebtoken");
const User = require("../models/user");
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      throw new Error("Unauthorized");
    }
    const decoded = jwt.verify(token, "devTinder@98");
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new Error("User not found");
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
