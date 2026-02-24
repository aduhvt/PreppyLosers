require("dotenv").config();

const jwt = require("jsonwebtoken");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { Resend } = require("resend");
const Product = require("./models/Product");
const User = require("./models/User");
const Order = require("./models/Order");

const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const resend = new Resend(process.env.RESEND_API_KEY);

// 🔥 SEND OTP ROUTE
app.post("/api/auth/send-otp", async (req, res) => {
  console.log("Send OTP route hit");

  try {
    const { email } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ email });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Your OTP Code",
      html: `
        <div style="font-family: Arial; font-size: 18px;">
          <h2>Your OTP Code</h2>
          <p>Your OTP is:</p>
          <h1>${otp}</h1>
          <p>This code expires in 5 minutes.</p>
        </div>
      `,
    });

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// VERIFY OTP
app.post("/api/auth/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Clear OTP
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // 🔐 Generate JWT
    const token = jwt.sign(
  {
    userId: user._id,
    email: user.email,
    role: user.role,   // IMPORTANT
  },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

    res.json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("VERIFY ERROR:", error);
    res.status(500).json({ message: "Verification failed" });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

app.get("/api/protected", authenticate, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user,
  });
});
app.post("/api/products", async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.json(product);
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    res.status(500).json({ message: "Failed to create product" });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();

    res.json(products);
  } catch (error) {
    console.error("FETCH PRODUCTS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

app.get("/api/seed", async (req, res) => {
  const product = await Product.create({
    name: "Oversized Black Tee",
    description: "Heavyweight 240gsm cotton streetwear tee.",
    price: 1499,
    images: ["https://images.unsplash.com/photo-1523381210434-271e8be1f52b"],
    sizes: ["S", "M", "L", "XL"],
    category: "T-Shirt",
    stock: 100,
    isFeatured: true,
  });

  res.json(product);
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

// CREATE ORDER ROUTE (PROTECTED)
app.post("/api/orders", authenticate, async (req, res) => {
  try {
    const { items, shippingAddress, totalAmount } = req.body;

    const order = await Order.create({
      user: req.user.userId,
      items,
      shippingAddress,
      totalAmount,
      paymentStatus: "pending",
    });

    res.json({
      message: "Order created successfully",
      order,
    });

  } catch (error) {
    console.error("ORDER ERROR:", error);
    res.status(500).json({ message: "Failed to create order" });
  }
});

app.get("/api/orders/my", authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("FETCH ORDERS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

app.get(
  "/api/admin/orders",
  authenticate,
  adminOnly,
  async (req, res) => {
    try {
      const orders = await Order.find()
        .populate("user", "email")
        .sort({ createdAt: -1 });

      res.json(orders);
    } catch (error) {
      console.error("ADMIN FETCH ERROR:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  }
);

app.put(
  "/api/admin/orders/:id",
  authenticate,
  adminOnly,
  async (req, res) => {
    try {
      const { paymentStatus } = req.body;

      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { paymentStatus },
        { new: true }
      );

      res.json(order);
    } catch (error) {
      console.error("UPDATE ORDER ERROR:", error);
      res.status(500).json({ message: "Failed to update order" });
    }
  }
);