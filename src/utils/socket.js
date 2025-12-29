const { Server } = require("socket.io");
const crypto = require("crypto");
const { Chat, Message } = require("../models/chat");
const ConnectionRequest = require("../models/connectionRequest");
const getSecretId = (userId, toUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, toUserId].sort().join("_"))
    .digest("hex");
};

const initializeSocket = (server) => {
  try {
    const io = new Server(server, {
      cors: {
        origin: "http://localhost:5173",
        credentials: true,
      },
    });

    io.on("connection", (socket) => {
      //   Hanle event here
      socket.on("join-chat", ({ userId, toUserId }) => {
        const roomId = getSecretId(userId, toUserId);
        socket.join(roomId);
        console.log(`User ${userId} joined room ${roomId}`);
      });

      socket.on("send-message", async ({ firstName, lastName, userId, toUserId, text, createdAt }) => {
        const roomId = getSecretId(userId, toUserId);
        try {
          const connection = await ConnectionRequest.findOne({
            $or: [
              { fromUserId: userId, toUserId: toUserId },
              { fromUserId: toUserId, toUserId: userId },
            ],
            status: "accepted",
          });
          if (!connection) {
            throw new Error("You are not connected to this user");
          }

          // Find or create chat
          let chat = await Chat.findOne({
            participants: { $all: [userId, toUserId] },
          });
          if (!chat) {
            chat = new Chat({ 
              participants: [userId, toUserId],
              lastMessage: text,
              lastMessageAt: new Date()
            });
            await chat.save();
          }

          // Insert message into Message collection
          const message = new Message({
            chatId: chat._id,
            senderId: userId,
            text: text,
            status: "sent"
          });
          await message.save();

          // Update chat.lastMessage and lastMessageAt
          chat.lastMessage = text;
          chat.lastMessageAt = message.createdAt;
          await chat.save();

          io.to(roomId).emit("received-message", { firstName, lastName, text, createdAt });
          console.log(`User ${userId} sent message: ${text}`);
        } catch (err) {
          console.log("Error sending message", err);
        }
      });

      socket.on("disconnect", () => {
        console.log("A user disconnected");
      });
    });

    io.on("disconnect", (socket) => {
      console.log("A user disconnected");
    });

    return io;
  } catch (err) {
    console.log("Error initializing socket", err);
    throw new Error("Error initializing socket");
  }
};
module.exports = initializeSocket;
