const express = require("express");
const profileRouter = express.Router();
const User = require("../models/user");
const authMiddleware = require("../middlewares/auth");
const { validateProfileEditFields } = require("../utils/validator");

profileRouter.get("/profile/view", authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("User not found");
    }
    res.status(200).send({
      success: true,
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (err) {
    res.status(400).send({
      success: false,
      message: "Error fetching profile",
      error: err.message,
    });
  }
});

profileRouter.patch("/profile/edit", authMiddleware, async (req, res) => {
  try {
    const isAllowed = validateProfileEditFields(req.body);
    if (!isAllowed) {
      throw new Error("Fields not allowed");
    }
    const loggedInUser = req.user;
    Object.keys(req.body).forEach(
      (field) => (loggedInUser[field] = req.body[field])
    );
    await User.findByIdAndUpdate(loggedInUser._id, loggedInUser, {
      new: true,
      runValidators: true,
    });
    res.status(200).send({
      success: true,
      message: "Profile updated successfully",
      data: loggedInUser,
    });
  } catch (err) {
    res.status(400).send({
      success: false,
      message: "Error updating profile",
      error: err.message,
    });
  }
});

// update photo for all users
profileRouter.put("/profile/updatePhoto", authMiddleware, async (req, res) => {
  try {
    const photoUrl = "https://picsum.photos/seed/picsum/200";
    
    const result = await User.updateMany(
      {},
      { photoUrl },
      { runValidators: true }
    );

    res.status(200).send({
      success: true,
      message: "All users' photos updated successfully",
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (err) {
    res.status(400).send({
      success: false,
      message: "Error updating photos",
      error: err.message,
    });
  }
});

module.exports = profileRouter;
