const mongoose = require("mongoose");

const officerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    badgeNumber: { type: String, required: true, unique: true },
    rank: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Officer", officerSchema);
