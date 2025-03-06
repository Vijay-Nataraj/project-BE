const mongoose = require("mongoose");

const freelancerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    skills: {
      type: [String],
      required: true,
    },
    portfolio: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        client: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        comment: String,
        rating: Number,
      },
    ],
  },
  { timestamps: true }
);

const Freelancer = mongoose.model("Freelancer", freelancerSchema);
module.exports = Freelancer;
