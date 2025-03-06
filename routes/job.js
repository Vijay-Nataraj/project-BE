// routes/job.js
const express = require("express");
const Job = require("../models/Job");
const auth = require("../middleware/auth");
const jobRouter = express.Router();

// Create a job listing
jobRouter.post("/", auth.checkAuth, async (req, res) => {
  console.log("Received job data:", req.body);
  const { title, description, budget, deadline, skills } = req.body;
  try {
    const job = new Job({
      clientId: req.user._id,
      title,
      description,
      budget,
      deadline,
      skills,
    });
    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all job listings
jobRouter.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().populate("clientId", "username");
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a job listing
jobRouter.put("/:id", auth.checkAuth, async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a job listing
jobRouter.delete("/:id", auth.checkAuth, async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = jobRouter;
