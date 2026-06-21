const fs = require("fs");
const path = require("path");
const Evidence = require("../models/evidence");
const Case = require("../models/case");
const { body, validationResult } = require("express-validator");

const validateEvidence = [
  body("evidenceName").trim().notEmpty().withMessage("Evidence name is required"),
  body("evidenceType")
    .isIn(["Image", "PDF", "Document", "Other"])
    .withMessage("Invalid evidence type"),
  body("relatedCase").notEmpty().withMessage("Related case is required"),
];

const addEvidence = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    if (!req.file) {
      return res.status(400).json({ message: "File upload is required" });
    }

    const caseDoc = await Case.findById(req.body.relatedCase);
    if (!caseDoc) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Invalid case reference" });
    }

    const evidence = await Evidence.create({
      evidenceName: req.body.evidenceName,
      evidenceType: req.body.evidenceType,
      description: req.body.description || "",
      relatedCase: req.body.relatedCase,
      fileName: req.file.originalname,
      filePath: req.file.filename,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedBy: req.user._id,
    });

    caseDoc.timeline.push({
      event: "Evidence Added",
      description: `Evidence "${req.body.evidenceName}" was uploaded`,
      createdBy: req.user._id,
    });
    await caseDoc.save();

    const populated = await Evidence.findById(evidence._id)
      .populate("relatedCase", "caseNumber crimeType")
      .populate("uploadedBy", "name email");

    res.status(201).json(populated);
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: error.message });
  }
};

const getEvidence = async (req, res) => {
  try {
    const { caseId, search } = req.query;
    const filter = {};

    if (caseId) filter.relatedCase = caseId;
    if (search) {
      filter.$or = [
        { evidenceName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const evidence = await Evidence.find(filter)
      .populate("relatedCase", "caseNumber crimeType status")
      .populate("uploadedBy", "name email")
      .sort({ uploadDate: -1 });

    res.json(evidence);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteEvidence = async (req, res) => {
  try {
    const evidence = await Evidence.findById(req.params.id);
    if (!evidence) {
      return res.status(404).json({ message: "Evidence not found" });
    }

    const filePath = path.join(__dirname, "../uploads", evidence.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Evidence.findByIdAndDelete(req.params.id);
    res.json({ message: "Evidence deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addEvidence,
  getEvidence,
  deleteEvidence,
  validateEvidence,
};
