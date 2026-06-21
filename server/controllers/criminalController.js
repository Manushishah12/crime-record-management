const Criminal = require("../models/criminal");
const { body, validationResult } = require("express-validator");

const validateCriminal = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("age").isInt({ min: 1, max: 150 }).withMessage("Valid age is required"),
  body("gender").trim().notEmpty().withMessage("Gender is required"),
  body("address").trim().notEmpty().withMessage("Address is required"),
  body("crimeHistory").trim().notEmpty().withMessage("Crime history is required"),
  body("status")
    .optional()
    .isIn(["Wanted", "Arrested", "Released"])
    .withMessage("Invalid status"),
];

const addCriminal = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const criminal = await Criminal.create(req.body);
    res.status(201).json(criminal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCriminals = async (req, res) => {
  try {
    const { search, status } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { crimeHistory: { $regex: search, $options: "i" } },
      ];
    }

    const criminals = await Criminal.find(filter).sort({ createdAt: -1 });
    res.json(criminals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCriminalById = async (req, res) => {
  try {
    const criminal = await Criminal.findById(req.params.id);
    if (!criminal) {
      return res.status(404).json({ message: "Criminal not found" });
    }

    const Case = require("../models/case");
    const cases = await Case.find({ criminal: criminal._id })
      .populate("assignedOfficer", "name badgeNumber rank")
      .sort({ createdAt: -1 });

    res.json({ criminal, cases });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCriminal = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const criminal = await Criminal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!criminal) {
      return res.status(404).json({ message: "Criminal not found" });
    }

    res.json(criminal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCriminal = async (req, res) => {
  try {
    const Case = require("../models/case");
    const linkedCases = await Case.countDocuments({ criminal: req.params.id });

    if (linkedCases > 0) {
      return res.status(400).json({
        message: "Cannot delete criminal with linked cases. Remove cases first.",
      });
    }

    const criminal = await Criminal.findByIdAndDelete(req.params.id);
    if (!criminal) {
      return res.status(404).json({ message: "Criminal not found" });
    }

    res.json({ message: "Criminal deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addCriminal,
  getCriminals,
  getCriminalById,
  updateCriminal,
  deleteCriminal,
  validateCriminal,
};
