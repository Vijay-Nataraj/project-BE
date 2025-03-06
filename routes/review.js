const express = require("express");
const Review = require("../models/Review");
const auth = require("../middleware/auth");
const reviewRouter = express.Router();

// Create a review
reviewRouter.post("/", auth.checkAuth, async (req, res) => {
  const { freelancerId, rating, comment } = req.body;
  try {
    const review = new Review({
      freelancerId,
      clientId: req.user._id,
      rating,
      comment,
    });
    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get reviews for a freelancer
reviewRouter.get("/freelancer/:id", async (req, res) => {
  try {
    const reviews = await Review.find({ freelancerId: req.params.id }).populate(
      "clientId",
      "username"
    );
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = reviewRouter;
