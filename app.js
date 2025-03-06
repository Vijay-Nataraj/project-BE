const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
const authRouter = require("./routes/auth");
const serviceRouter = require("./routes/service");
const contractRouter = require("./routes/contract");
const paymentRouter = require("./routes/payment");
const reviewRouter = require("./routes/review");
const auth = require("./middleware/auth");
const jobRouter = require("./routes/job");
const userRouter = require("./routes/user");

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  cors({
    origin: "https://vjn-freelance-marketplace.netlify.app",
    credentials: true,
  })
);

// Authentication routes
app.use("/api/v1/auth", authRouter);

// Freelancer features
app.use("/api/v1/services", serviceRouter); // Service listings
app.use("/api/v1/contracts", contractRouter); // Contract management
app.use("/api/v1/payments", paymentRouter); // Payment processing
app.use("/api/v1/reviews", reviewRouter); // Reviews

app.use("/api/v1/jobs", jobRouter); // Contract management

// Profile routes
app.use(
  "/api/v1/profile",
  auth.checkAuth,
  auth.allowRoles(["freelancer", "client"]),
  userRouter // Use userRouter for handling profile routes
);

module.exports = app;
