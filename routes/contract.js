const express = require("express");
const Contract = require("../models/Contract");
const auth = require("../middleware/auth");
const contractRouter = express.Router();

// Create a contract
contractRouter.post("/", auth.checkAuth, async (req, res) => {
  const { freelancerId, clientId, serviceId, milestones } = req.body;
  try {
    const contract = new Contract({
      freelancerId,
      clientId,
      serviceId,
      milestones,
    });
    await contract.save();
    res.status(201).json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all contracts for a freelancer
contractRouter.get("/freelancer/:id", auth.checkAuth, async (req, res) => {
  try {
    const contracts = await Contract.find({
      freelancerId: req.params.id,
    }).populate("clientId serviceId");
    res.status(200).json(contracts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update contract status
contractRouter.put("/:id", auth.checkAuth, async (req, res) => {
  try {
    const contract = await Contract.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }
    res.status(200).json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = contractRouter;
