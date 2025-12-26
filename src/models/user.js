const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      index: true,
      required: true,
      minlength: 3,
      maxlength: 50,
    },
    lastName: {
      type: String,
      minlength: 3,
      maxlength: 50,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email");
        }
      },
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      validate: {
        validator: function (v) {
          return v === "Male" || v === "Female" || v === "Other";
        },
        message: "Gender must be either Male, Female or Other",
      },
    },
    photoUrl: {
      type: String,
      // validate(value) {
      //   if (!validator.isURL(value)) {
      //     throw new Error(`Invalid photo URL: ${value}`);
      //   }
      // },
    },
    about: {
      type: String,
      default: "I am a software engineer",
    },
    skills: {
      type: [String],
    },
  },
  { timestamps: true }
);

userSchema.methods.getJwtToken = function () {
  try {
    const secret = process.env.JWT_SECRET;
    return jwt.sign({ userId: this._id }, secret, {
      expiresIn: "7d",
    });
  } catch (err) {
    console.log("Error getting JWT token", err);
    throw new Error("Error getting JWT token");
  }
};

const User = mongoose.model("User", userSchema);
module.exports = User;
