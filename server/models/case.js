const mongoose = require("mongoose");

const timelineEntrySchema = new mongoose.Schema(
  {
    event: { type: String, required: true },
    description: { type: String, default: "" },
    date: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { _id: true }
);

const caseSchema = new mongoose.Schema(
  {
    caseNumber: { type: String, required: true, unique: true },
    crimeType: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["Open", "Under Investigation", "Closed"],
      default: "Open",
    },
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Officer",
      default: null,
    },
    criminal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Criminal",
      required: true,
    },
    timeline: [timelineEntrySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Case", caseSchema);
