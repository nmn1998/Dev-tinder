const mongoose = require("mongoose");

const url =
  "mongodb+srv://nmnagrawal99_db_user:199809@namancluster.frntp1e.mongodb.net/devTinder";

async function connectDB() {
  try {
    await mongoose.connect(url);
  } catch (err) {
    console.log("Error connecting to MongoDB", err);
  }
}

module.exports = connectDB;
