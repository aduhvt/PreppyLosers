const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    sparse: true, // Allows nulls to be unique
  },
  phoneNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  otp: String,
  otpExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },

  role: {
    type: String,
    default: "user", // user or admin
  },

  name: {
    type: String,
    default: "",
  },

  addressBook: {
    fullName: String,
    address: String,
    city: String,
    pincode: String,
    phone: String,
    country: { type: String, default: "India" },
    apartment: String,
  },
});

module.exports = mongoose.model("User", userSchema);
