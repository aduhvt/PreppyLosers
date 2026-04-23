const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    default: undefined,
  },
  phoneNumber: {
    type: String,
    default: undefined,
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

  emailToken: {
    type: String,
    default: null,
  },

  emailVerificationCode: {
    type: String,
    default: null,
  },

  emailVerificationExpires: {
    type: Date,
    default: null,
  },

  emailVerified: {
    type: Boolean,
    default: false,
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

userSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: { email: { $type: "string" } },
  },
);

userSchema.index(
  { phoneNumber: 1 },
  {
    unique: true,
    partialFilterExpression: { phoneNumber: { $type: "string" } },
  },
);

module.exports = mongoose.model("User", userSchema);
