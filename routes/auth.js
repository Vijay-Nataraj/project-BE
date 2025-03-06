const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_SECRET, NODE_ENV } = require("../utils/config");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

const authRouter = express.Router();

// Register a new user
authRouter.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, role });
    await user.save();
    res.status(201).json({ message: "User  registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login a user
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt with email:", email); // Debugging log

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User  not found"); // Debugging log
      return res.status(400).json({ message: "User  not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Invalid credentials"); // Debugging log
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "3h" });

    // Send the token to the HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.status(200).json({
      token,
      user: {
        role: user.role,
        id: user._id,
        email: user.email,
      },
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error); // Log the error
    res.status(500).json({ message: error.message });
  }
});

// Forgot password
authRouter.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User  not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex"); // Hash the token
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes

    await user.save();

    // Retrieve the origin
    const origin = req.get("origin") || `${req.protocol}://${req.get("host")}`;
    const resetUrl = `${origin}/reset-password/${token}`;

    await sendEmail({
      to: email,
      subject: `Password Reset Request`,
      text: `Click on the link to reset your password: ${resetUrl}`,
    });

    return res
      .status(200)
      .json({ message: "Password reset link sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reset password
authRouter.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex"); // Hash the token

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Password reset token is invalid or has expired" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password has been updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = authRouter;
