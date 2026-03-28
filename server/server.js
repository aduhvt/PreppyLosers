require("dotenv").config();

const jwt = require("jsonwebtoken");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { Resend } = require("resend");
const { OAuth2Client } = require("google-auth-library");
const Product = require("./models/Product");
const User = require("./models/User");
const Order = require("./models/Order");
const Razorpay = require("razorpay");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const twilio = require("twilio");
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

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

// 🔥 SEND MAGIC LINK ROUTE
app.post("/api/auth/send-otp", async (req, res) => {
  console.log("Send Magic Link route hit for email:", req.body.email);

  try {
    const { email } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ email });
    }

    const magicToken = jwt.sign(
      { email: user.email, type: "magic_link" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    const magicLink = `http://localhost:5173/verify?token=${magicToken}`;

    console.log("Attempting to send email via Resend...");
    const emailRes = await resend.emails.send({
      from: "Preppy Losers <auth@preppylosers.in>",
      to: email,
      subject: "Login to Preppy Losers",
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; color: #000; background-color: #ffffff;">
          <h1 style="font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 30px;">PREPPY LOSERS</h1>
          
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
            Click the button below to log in to your account. For your security, this link will expire in 15 minutes.
          </p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${magicLink}" style="background-color: #000; color: #fff; padding: 15px 35px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px; letter-spacing: 1px; display: inline-block; text-transform: uppercase;">LOG IN TO SHOP</a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px; line-height: 1.5;">
            If the button above doesn't work, copy and paste this link into your browser:<br>
            <span style="color: #000; word-break: break-all;">${magicLink}</span>
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            You received this because a login was requested for your account. If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    console.log("Resend API response:", emailRes);

    if (emailRes.error) {
      console.error("Resend Error details:", emailRes.error);
      return res.status(400).json({ error: emailRes.error.message });
    }

    res.json({ message: "Magic link sent successfully" });
  } catch (error) {
    console.error("SEND MAGIC LINK ERROR:", error);
    res.status(500).json({ error: "Failed to send magic link" });
  }
});

// 📱 SEND PHONE OTP (WHATSAPP)
app.post("/api/auth/send-phone-otp", async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    let user = await User.findOne({ phoneNumber });

    if (!user) {
      user = await User.create({ phoneNumber });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const crypto = require("crypto");

    // Hash OTP before saving to DB
    user.otp = crypto.createHash("sha256").update(otp).digest("hex");
    user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 mins expiry
    await user.save();

    console.log(`[WhatsApp Simulation] Sending OTP ${otp} to ${phoneNumber}`);

    // 📱 Twilio WhatsApp Integration
    try {
      await twilioClient.messages.create({
        body: `Your Preppy Losers login OTP is ${otp}`,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${phoneNumber}`,
      });
      console.log(`WhatsApp OTP sent successfully to ${phoneNumber}`);
    } catch (twilioError) {
      console.error("Twilio WhatsApp Error:", twilioError);
      return res.status(400).json({ 
        error: "Twilio failed to send message", 
        details: twilioError.message 
      });
    }

    res.json({ message: "OTP sent to WhatsApp" });
  } catch (error) {
    console.error("SEND PHONE OTP ERROR:", error);
    res.status(500).json({ error: "Failed to send WhatsApp OTP" });
  }
});

// 📱 VERIFY PHONE OTP
app.post("/api/auth/verify-phone-otp", async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    const user = await User.findOne({ phoneNumber });

    if (!user) return res.status(400).json({ message: "User not found" });

    const crypto = require("crypto");
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    if (user.otp !== hashedOtp)
      return res.status(400).json({ message: "Invalid OTP" });
    if (user.otpExpires < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    // Clear OTP
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, phoneNumber: user.phoneNumber, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("VERIFY PHONE OTP ERROR:", error);
    res.status(500).json({ error: "Verification failed" });
  }
});

// 🔥 GOOGLE OAUTH ROUTE
app.post("/api/auth/google", async (req, res) => {
  try {
    const { token } = req.body;

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        name: name || "",
        // Role defaults to 'user' in the schema
      });
    } else if (!user.name && name) {
      // If user exists but has no name, update it
      user.name = name;
      await user.save();
    }

    // Generate long-term JWT (7 days)
    const authToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      message: "Google login successful",
      token: authToken,
    });
  } catch (error) {
    console.error("GOOGLE AUTH ERROR:", error);
    res.status(401).json({ message: "Invalid Google token" });
  }
});

// VERIFY MAGIC LINK
app.get("/api/auth/verify-link", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Token is missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== "magic_link") {
      return res.status(400).json({ message: "Invalid token type" });
    }

    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // 🔐 Generate Long-term JWT (7 days)
    const authToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      message: "Login successful",
      token: authToken,
    });
  } catch (error) {
    console.error("VERIFY LINK ERROR:", error);
    res.status(401).json({ message: "Link expired or invalid" });
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
app.post("/api/products", authenticate, adminOnly, async (req, res) => {
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
  try {
    // Clear existing products to ensure a clean shop page as requested
    await Product.deleteMany({});

    const product = await Product.create({
      name: "Doctor sleeve - cybersigil(1)",
      description:
        "Premium cotton sleeve with intricate cybersigil embroidery. Limited edition underground culture wear.",
      price: 1899,
      images: ["https://images.unsplash.com/photo-1578932750294-f5999e81f18c"], // Placeholder professional sleeve-like image
      sizes: ["S", "M", "L", "XL"],
      sizeStock: {
        S: 20,
        M: 25,
        L: 15,
        XL: 10,
      },
      category: "Sleeves",
      isFeatured: true,
      salesCount: 0,
    });

    res.json({ message: "Product seeded successfully", product });
  } catch (error) {
    console.error("SEED ERROR:", error);
    res.status(500).json({ message: "Failed to seed product" });
  }
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

    // 1. Create Razorpay Order first to get the ID
    const options = {
      amount: totalAmount * 100, // Amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // 2. Create DB Order with the Razorpay ID
    const order = await Order.create({
      user: req.user.userId,
      items,
      shippingAddress,
      totalAmount,
      paymentStatus: "pending",
      razorpayOrderId: razorpayOrder.id,
    });

    res.json({
      message: "Order created successfully",
      order: {
        ...order.toObject(),
        id: razorpayOrder.id, // Ensure frontend gets the Razorpay order ID
        amount: razorpayOrder.amount,
      },
    });
  } catch (error) {
    console.error("ORDER ERROR:", error);
    res.status(500).json({ message: "Failed to create order" });
  }
});

// VERIFY PAYMENT ROUTE
app.post("/api/orders/verify", authenticate, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const crypto = require("crypto");

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // Payment is verified
      const order = await Order.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
          paymentStatus: "paid",
          razorpayPaymentId: razorpay_payment_id,
        },
        { new: true },
      );

      // 📦 UPDATE STOCK AND SALES COUNT
      if (order && order.paymentStatus === "paid") {
        for (const item of order.items) {
          const product = await Product.findById(item.productId);
          if (product) {
            // Increment sales count
            product.salesCount = (product.salesCount || 0) + item.quantity;

            // Decrement stock for the specific size
            if (
              product.sizeStock &&
              product.sizeStock.get(item.selectedSize) !== undefined
            ) {
              const currentStock = product.sizeStock.get(item.selectedSize);
              product.sizeStock.set(
                item.selectedSize,
                Math.max(0, currentStock - item.quantity),
              );
            }

            await product.save();
          }
        }
      }

      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error("VERIFY ERROR:", error);
    res.status(500).json({ message: "Verification failed" });
  }
});

app.get("/api/orders/my", authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId }).sort({
      createdAt: -1,
    });

    res.json(orders);
  } catch (error) {
    console.error("FETCH ORDERS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

app.get("/api/admin/orders", authenticate, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("ADMIN FETCH ERROR:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

app.put("/api/admin/orders/:id", authenticate, adminOnly, async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true },
    );

    res.json(order);
  } catch (error) {
    console.error("UPDATE ORDER ERROR:", error);
    res.status(500).json({ message: "Failed to update order" });
  }
});
app.get("/api/users/profile", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "-otp -otpExpires",
    );
    res.json(user);
  } catch (error) {
    console.error("FETCH PROFILE ERROR:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

app.put("/api/users/profile", authenticate, async (req, res) => {
  try {
    const { name, addressBook } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, addressBook },
      { new: true },
    );

    res.json({
      message: "Profile updated",
      user,
    });
  } catch (error) {
    console.error("PROFILE UPDATE ERROR:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
});
