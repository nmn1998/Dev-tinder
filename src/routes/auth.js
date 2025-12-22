const express = require("express");
const authRouter = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { validateSignupData } = require("../utils/validator");

// signup
authRouter.post("/signup", async (req, res) => {
  try {
    const userObj = req.body;
    const { firstName, lastName, emailId, password } = userObj;

    validateSignupData(userObj);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: hashedPassword,
    });

    const savedUser = await user.save();
    res.status(201).send({
      success: true,
      message: "User created successfully",
      data: savedUser,
    });
  } catch (err) {
    res.status(400).send({
      success: false,
      message: "Error creating user",
      error: err.message,
    });
  }
});
// login
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId });
    if (!user) {
      throw new Error("Invalid Credentials");
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new Error("Invalid Credentials");
    }
    const token = await user.getJwtToken();
    res.cookie("token", token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    res.status(200).send({
      success: true,
      message: "Logged in successfully",
    });
  } catch (err) {
    res.status(400).send({
      success: false,
      message: "Error logging in",
      error: err.message,
    });
  }
});

// logout

authRouter.post("/logout", async (req, res) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
    });
    res.status(200).send("Logout Successfully");
  } catch (err) {
    res.status(400).send({
      success: false,
      message: "Error logging out",
      error: err.message,
    });
  }
});

module.exports = authRouter;
