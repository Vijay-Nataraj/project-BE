const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = require("../utils/config");
const PaymentRouter = express.Router();

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// Create a payment order
PaymentRouter.post("/create-order", async (req, res) => {
  const { amount, currency } = req.body; // Amount should be in paise (1 INR = 100 paise)

  // Input validation
  if (!amount || !currency) {
    return res
      .status(400)
      .json({ message: "Amount and currency are required." });
  }

  const options = {
    amount: amount * 100, // Convert to paise
    currency: currency,
    receipt: `receipt_${Date.now()}`, // Unique receipt ID using timestamp
  };

  try {
    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res
      .status(500)
      .json({ message: "Failed to create order. Please try again." });
  }
});

// Verify payment
PaymentRouter.post("/verify-payment", async (req, res) => {
  const { paymentId, orderId, signature } = req.body;

  // Input validation
  if (!paymentId || !orderId || !signature) {
    return res
      .status(400)
      .json({ message: "Payment ID, Order ID, and Signature are required." });
  }

  // Verify the payment signature
  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(orderId + "|" + paymentId)
    .digest("hex");

  if (expectedSignature === signature) {
    // Payment is verified
    res.status(200).json({ message: "Payment verified successfully" });
  } else {
    // Payment verification failed
    res.status(400).json({ message: "Payment verification failed" });
  }
});

module.exports = PaymentRouter;
