const express = require("express");
const User = require("../models/User");
const Job = require("../models/Job");
const Freelancer = require("../models/Freelancer");
const auth = require("../middleware/auth");

const userRouter = express.Router();

// Get user profile
userRouter.get("/", auth.checkAuth, async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch user profile." });
  }
});

// Update user profile
userRouter.put("/", auth.checkAuth, async (req, res) => {
  const { name, skills, portfolio, businessDetails } = req.body;
  try {
    // Update the user profile
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User  not found" });
    }

    // Update fields
    user.profile.name = name || user.profile.name;
    user.profile.skills = skills
      ? skills.split(",").map((skill) => skill.trim())
      : user.profile.skills;
    user.profile.portfolio = portfolio
      ? portfolio.split(",").map((item) => item.trim())
      : user.profile.portfolio;
    user.profile.businessDetails =
      businessDetails || user.profile.businessDetails;

    // Save the updated user
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update profile." });
  }
});

// POST /jobs
userRouter.post("/jobs", auth.checkAuth, async (req, res) => {
  try {
    const newJob = new Job({
      ...req.body,
      clientId: req.user._id,
    });
    await newJob.save();
    res.status(201).json(newJob);
  } catch (error) {
    res.status(400).json({ message: "Failed to create job", error });
  }
});

// GET /freelancers
userRouter.get("/freelancers", async (req, res) => {
  try {
    const freelancers = await Freelancer.find();
    res.status(200).json(freelancers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch freelancers", error });
  }
});

// Logout user
userRouter.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
});

module.exports = userRouter;
