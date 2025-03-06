const express = require("express");
const Service = require("../models/Service");
const auth = require("../middleware/auth");
const serviceRouter = express.Router();

// Create a service listing
serviceRouter.post("/", auth.checkAuth, async (req, res) => {
  const { title, description, price, category, workSamples, availability } =
    req.body;
  try {
    const service = new Service({
      freelancerId: req.user._id,
      title,
      description,
      price,
      category,
      workSamples,
      availability,
    });
    await service.save();
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all services with search and filter
serviceRouter.get("/", async (req, res) => {
  const { search, category, minPrice, maxPrice } = req.query;
  const query = {};

  if (search) {
    query.title = { $regex: search, $options: "i" }; // Case-insensitive search
  }
  if (category) {
    query.category = category;
  }
  if (minPrice) {
    query.price = { $gte: minPrice };
  }
  if (maxPrice) {
    query.price = { ...query.price, $lte: maxPrice };
  }

  try {
    const services = await Service.find(query).populate(
      "freelancerId",
      "username"
    );
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a service listing
serviceRouter.put("/:id", auth.checkAuth, async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a service listing
serviceRouter.delete("/:id", auth.checkAuth, async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = serviceRouter;
