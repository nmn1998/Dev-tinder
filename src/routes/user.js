const express = require("express");
const authMiddleware = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const userRouter = express.Router();
const User = require("../models/user");
USER_Data = [
  "firstName",
  "lastName",
  "photoUrl",
  "skills",
  "age",
  "gender",
  "about",
];

// fetch user/request/received
userRouter.get("/user/request/received", authMiddleware, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const data = await ConnectionRequest.find({
      toUserId: loggedInUser?._id,
      status: "interested",
    }).populate("fromUserId", USER_Data);

    res.status(200).send({
      success: true,
      message: "Request fetched Successfuly",
      data,
    });
  } catch (err) {
    res.status(400).send({
      success: false,
      message: "Error fetching request",
      error: err.message,
    });
  }
});

userRouter.get("/user/connections", authMiddleware, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connection = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser?._id, status: "accepted" },
        { fromUserId: loggedInUser?._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_Data)
      .populate("toUserId", USER_Data);

    const data = connection.map((row) => {
      if (row?.fromUserId?._id.toString() == loggedInUser?._id.toString())
        return row.toUserId;
      else return row.fromUserId;
    });

    res.status(200).send({
      success: true,
      message: "Request fetched Successfuly",
      data,
    });
  } catch (err) {
    res.status(400).send({
      success: false,
      message: "Error fetching request",
      error: err.message,
    });
  }
});

// feed api

userRouter.get("/user/feeds", authMiddleware, async (req, res) => {
  try {
    const loggedInUser = req?.user;
    // pagination
    const page = parseInt(req.query?.page) || 1;
    let limit = parseInt(req?.query?.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * 10;

    // find all the user who is  already sent or recieved connections
    const connection = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser?._id }, { toUserId: loggedInUser?._id }],
    }).select("fromUserId toUserId");

    const hideUserFromFeed = new Set();

    connection.forEach((req) => {
      hideUserFromFeed.add(req.fromUserId?.toString());
      hideUserFromFeed.add(req.toUserId?.toString());
    });

    // find users who is not in hideUserFromFeed array and logged in user should not see itself
    const feeds = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUserFromFeed) } },
        { _id: { $ne: loggedInUser?._id } },
      ],
    })
      .select(USER_Data)
      .skip(skip)
      .limit(limit);
    res.status(200).send({
      success: true,
      message: "Feeds fetched successfully",
      data: feeds,
    });
  } catch (err) {
    res.status(400).send({
      success: false,
      message: "Error fetching feeds",
      error: err.message,
    });
  }
});
module.exports = userRouter;
