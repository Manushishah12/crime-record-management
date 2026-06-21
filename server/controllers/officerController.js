const Officer = require("../models/officer");
const { body, validationResult } = require("express-validator");

const validateOfficer = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("badgeNumber").trim().notEmpty().withMessage("Badge number is required"),
  body("rank").trim().notEmpty().withMessage("Rank is required"),
  body("phoneNumber").trim().notEmpty().withMessage("Phone number is required"),
  body("email").isEmail().withMessage("Valid email is required"),
];

const addOfficer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const officer = await Officer.create(req.body);
    res.status(201).json(officer);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Badge number already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

const getOfficers = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { badgeNumber: { $regex: search, $options: "i" } },
        { rank: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const officers = await Officer.find(filter).sort({ createdAt: -1 });
    res.json(officers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOfficerById = async (req, res) => {
  try {
    const officer = await Officer.findById(req.params.id);
    if (!officer) {
      return res.status(404).json({ message: "Officer not found" });
    }

    const Case = require("../models/case");
    const cases = await Case.find({ assignedOfficer: officer._id })
      .populate("criminal", "name status")
      .sort({ createdAt: -1 });

    res.json({ officer, cases });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOfficer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const officer = await Officer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!officer) {
      return res.status(404).json({ message: "Officer not found" });
    }

    res.json(officer);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Badge number already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

const deleteOfficer = async (req, res) => {
  try {
    const Case = require("../models/case");
    const linkedCases = await Case.countDocuments({
      assignedOfficer: req.params.id,
    });

    if (linkedCases > 0) {
      return res.status(400).json({
        message: "Cannot delete officer with assigned cases. Reassign cases first.",
      });
    }

    const officer = await Officer.findByIdAndDelete(req.params.id);
    if (!officer) {
      return res.status(404).json({ message: "Officer not found" });
    }

    res.json({ message: "Officer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addOfficer,
  getOfficers,
  getOfficerById,
  updateOfficer,
  deleteOfficer,
  validateOfficer,
};
