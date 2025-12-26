const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.DB_CONNECTION_SECRET);
  } catch (err) {
    console.log("Error connecting to MongoDB", err);
  }
}

module.exports = connectDB;
