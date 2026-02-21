const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        name: String,
        price: Number,
        quantity: Number,
        selectedSize: String,
        image: String,
      },
    ],

    shippingAddress: {
      fullName: String,
      address: String,
      city: String,
      pincode: String,
      phone: String,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    paymentStatus: {
      type: String,
      default: "pending", // pending, paid
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);