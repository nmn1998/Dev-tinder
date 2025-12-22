const express = require("express");
const requestRouter = express.Router();
const User = require("../models/user");
const authMiddleware = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");

requestRouter.post(
  "/request/send/:status/:toUserId",
  authMiddleware,
  async (req, res) => {
    try {
      const fromUserId = req.user?._id;
      const toUserId = req.params?.toUserId;
      const status = req.params.status;

      // allow only interested/ignored status
      const allowedStatus = ["interested", "ignored"];
      const allow = allowedStatus.includes(status);
      if (!allow) throw new Error("Status not allowed");

      // to user should exist
      const exist = await User.findById(toUserId);
      if (!exist) throw new Error("User not found");

      // should not send request to itself
      if (fromUserId == toUserId) throw new Error("Invalid Request");

      // check connection already exist
      const existingRequest = await ConnectionRequest.findOne({
        $or: [
          {
            fromUserId: fromUserId,
            toUserId: toUserId,
          },
          {
            fromUserId: toUserId,
            toUserId: fromUserId,
          },
        ],
      });

      if (existingRequest) throw new Error("Connection already exist");

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();
      res.status(200).send({
        success: true,
        message: `${
          status == "ignored" ? "Ignored" : "Connection send"
        } Successfully`,
        data,
      });
    } catch (err) {
      res.status(400).send({
        success: false,
        message: "Error sending request",
        error: err.message,
      });
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  authMiddleware,
  async (req, res) => {
    try {
      const { status, requestId } = req.params;
      const loggedInUser = req.user;
      // allow only accepted/rejected status
      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        throw new Error("Status not allowed");
      }

      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser?._id,
        status: "interested",
      });
  
      if (!connectionRequest) {
        throw new Error("Request not found");
      }
      connectionRequest.status = status;
      const data = await connectionRequest.save();
      res.status(200).send({
        success: true,
        message: `Connection ${
          status == "accepted" ? "Accepted" : "Rejected"
        } Successfully`,
        data,
      });
    } catch (err) {
      res.status(400).send({
        success: false,
        message: "Error reviewing request",
        error: err.message,
      });
    }
  }
);

module.exports = requestRouter;
