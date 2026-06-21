const mongoose = require("mongoose");

const criminalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    age: {
      type: Number,
      required: true,
    },

    gender: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    crimeHistory: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["Wanted", "Arrested", "Released"],
      default: "Wanted",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Criminal", criminalSchema);