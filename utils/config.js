require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const NODE_ENV = process.env.NODE_ENV;
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

module.exports = {
  MONGODB_URI,
  PORT,
  JWT_SECRET,
  EMAIL_USER,
  EMAIL_PASS,
  NODE_ENV,
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
};
