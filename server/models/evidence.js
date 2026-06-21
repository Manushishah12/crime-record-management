const mongoose = require("mongoose");

const evidenceSchema = new mongoose.Schema(
  {
    evidenceName: { type: String, required: true },
    evidenceType: {
      type: String,
      enum: ["Image", "PDF", "Document", "Other"],
      required: true,
    },
    description: { type: String, default: "" },
    uploadDate: { type: Date, default: Date.now },
    relatedCase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      required: true,
    },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    mimeType: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Evidence", evidenceSchema);
