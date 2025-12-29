const express = require("express");
const mongoose = require("mongoose");
const chatRouter = express.Router();
const authMiddleware = require("../middlewares/auth");
const { Chat, Message } = require("../models/chat");

chatRouter.get("/chat/:toUserId", authMiddleware, async (req, res) => {
  try {
    const toUserId = req.params.toUserId;
    const userId = req.user._id;
    const cursor = req.query.cursor; // Message ID to start from
    const limit = parseInt(req.query.limit) || 10; // Number of messages to fetch
    
    // Find or create chat
    let chat = await Chat.findOne({
      participants: { $all: [userId, toUserId] },
    });
    
    if (!chat) {
      chat = new Chat({
        participants: [userId, toUserId],
      });
      await chat.save();
    }

    // Build query for cursor-based pagination
    let query = { chatId: chat._id };
    
    // If cursor is provided, fetch messages before this cursor (for descending order)
    if (cursor) {
      // Validate cursor format
      if (!mongoose.Types.ObjectId.isValid(cursor)) {
        return res.status(400).send({
          success: false,
          message: "Invalid cursor format",
        });
      }
      
      // Verify cursor message exists and belongs to this chat
      const cursorMessage = await Message.findOne({
        _id: cursor,
        chatId: chat._id,
      });
      
      if (!cursorMessage) {
        return res.status(400).send({
          success: false,
          message: "Invalid cursor - message not found or doesn't belong to this chat",
        });
      }
      
      // Fetch messages created before the cursor message (for descending order)
      query.createdAt = { $lt: cursorMessage.createdAt };
    }

    // Fetch messages with cursor-based pagination
    const messages = await Message.find(query)
      .populate({ path: "senderId", select: "firstName lastName" })
      .sort({ createdAt: -1 })
      .limit(limit + 1); // Fetch one extra to check if there are more

    // Check if there are more messages
    const hasMore = messages.length > limit;
    const messagesToReturn = hasMore ? messages.slice(0, limit) : messages;
    
    // Get next cursor (ID of the last message in current batch)
    const nextCursor = messagesToReturn.length > 0 
      ? messagesToReturn[messagesToReturn.length - 1]._id.toString() 
      : null;

    res.status(200).send({
      success: true,
      message: "Chat fetched successfully",
      data: {
        chat: chat,
        messages: messagesToReturn,
        pagination: {
          nextCursor: nextCursor,
          hasMore: hasMore,
          limit: limit,
        },
      },
    });
  } catch (err) {
    res.status(400).send({
      success: false,
      message: "Error fetching chat",
      error: err.message,
    });
  }
});

module.exports = chatRouter;
