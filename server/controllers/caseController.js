const Case = require("../models/case");
const Criminal = require("../models/criminal");
const Officer = require("../models/officer");
const { body, validationResult } = require("express-validator");

const validateCase = [
  body("caseNumber").trim().notEmpty().withMessage("Case number is required"),
  body("crimeType").trim().notEmpty().withMessage("Crime type is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("location").trim().notEmpty().withMessage("Location is required"),
  body("criminal").notEmpty().withMessage("Criminal reference is required"),
  body("status")
    .optional()
    .isIn(["Open", "Under Investigation", "Closed"])
    .withMessage("Invalid status"),
];

const canManageCase = (caseDoc, user) => {
  if (user.role === "Admin") return true;
  if (user.role === "Viewer") return false;
  if (user.role === "Officer") {
    if (!caseDoc.assignedOfficer) return true;
    if (!user.officerRef) return false;
    return caseDoc.assignedOfficer.toString() === user.officerRef.toString();
  }
  return false;
};

const populateOptions = [
  { path: "criminal", select: "name age gender status address crimeHistory" },
  { path: "assignedOfficer", select: "name badgeNumber rank phoneNumber email" },
  { path: "timeline.createdBy", select: "name email" },
];

const addCase = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const criminal = await Criminal.findById(req.body.criminal);
    if (!criminal) {
      return res.status(400).json({ message: "Invalid criminal reference" });
    }

    if (req.body.assignedOfficer) {
      const officer = await Officer.findById(req.body.assignedOfficer);
      if (!officer) {
        return res.status(400).json({ message: "Invalid officer reference" });
      }
    }

    const timeline = [
      {
        event: "Case Created",
        description: `Case ${req.body.caseNumber} was created`,
        createdBy: req.user._id,
      },
    ];

    if (req.body.assignedOfficer) {
      timeline.push({
        event: "Officer Assigned",
        description: "Officer assigned at case creation",
        createdBy: req.user._id,
      });
    }

    const newCase = await Case.create({ ...req.body, timeline });
    const populated = await Case.findById(newCase._id).populate(populateOptions);
    res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Case number already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

const getCases = async (req, res) => {
  try {
    const { search, status, crimeType, officerId } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (crimeType) filter.crimeType = { $regex: crimeType, $options: "i" };
    if (officerId) filter.assignedOfficer = officerId;

    if (search) {
      filter.$or = [
        { caseNumber: { $regex: search, $options: "i" } },
        { crimeType: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    let cases = await Case.find(filter)
      .populate(populateOptions)
      .sort({ createdAt: -1 });

    if (search && cases.length === 0) {
      const criminals = await Criminal.find({
        name: { $regex: search, $options: "i" },
      }).select("_id");
      const criminalIds = criminals.map((c) => c._id);
      cases = await Case.find({ ...filter, criminal: { $in: criminalIds } })
        .populate(populateOptions)
        .sort({ createdAt: -1 });
    }

    res.json(cases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCaseById = async (req, res) => {
  try {
    const caseDoc = await Case.findById(req.params.id).populate([
      ...populateOptions,
      {
        path: "criminal",
        select: "name age gender status address crimeHistory",
      },
    ]);

    if (!caseDoc) {
      return res.status(404).json({ message: "Case not found" });
    }

    const Evidence = require("../models/evidence");
    const evidence = await Evidence.find({ relatedCase: caseDoc._id }).sort({
      uploadDate: -1,
    });

    res.json({ case: caseDoc, evidence });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCase = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const caseDoc = await Case.findById(req.params.id);
    if (!caseDoc) {
      return res.status(404).json({ message: "Case not found" });
    }

    if (!canManageCase(caseDoc, req.user)) {
      return res.status(403).json({ message: "Not authorized to manage this case" });
    }

    const updates = { ...req.body };
    const timeline = [...caseDoc.timeline];

    if (
      updates.status &&
      updates.status !== caseDoc.status
    ) {
      timeline.push({
        event: "Status Updated",
        description: `Status changed from ${caseDoc.status} to ${updates.status}`,
        createdBy: req.user._id,
      });

      if (updates.status === "Closed") {
        timeline.push({
          event: "Case Closed",
          description: "Case has been closed",
          createdBy: req.user._id,
        });
      }
    }

    if (
      updates.assignedOfficer &&
      updates.assignedOfficer !== caseDoc.assignedOfficer?.toString()
    ) {
      const officer = await Officer.findById(updates.assignedOfficer);
      if (!officer) {
        return res.status(400).json({ message: "Invalid officer reference" });
      }
      timeline.push({
        event: "Officer Assigned",
        description: `Assigned to ${officer.name} (${officer.badgeNumber})`,
        createdBy: req.user._id,
      });
    }

    updates.timeline = timeline;

    const updatedCase = await Case.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate(populateOptions);

    res.json(updatedCase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCase = async (req, res) => {
  try {
    const caseDoc = await Case.findById(req.params.id);
    if (!caseDoc) {
      return res.status(404).json({ message: "Case not found" });
    }

    if (!canManageCase(caseDoc, req.user) && req.user.role !== "Admin") {
      return res.status(403).json({ message: "Not authorized to delete this case" });
    }

    const Evidence = require("../models/evidence");
    await Evidence.deleteMany({ relatedCase: req.params.id });
    await Case.findByIdAndDelete(req.params.id);

    res.json({ message: "Case deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addTimelineEntry = async (req, res) => {
  try {
    const { event, description } = req.body;
    if (!event) {
      return res.status(400).json({ message: "Event is required" });
    }

    const caseDoc = await Case.findById(req.params.id);
    if (!caseDoc) {
      return res.status(404).json({ message: "Case not found" });
    }

    if (!canManageCase(caseDoc, req.user)) {
      return res.status(403).json({ message: "Not authorized to update this case" });
    }

    caseDoc.timeline.push({
      event,
      description: description || "",
      createdBy: req.user._id,
    });

    await caseDoc.save();
    const updated = await Case.findById(caseDoc._id).populate(populateOptions);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addCase,
  getCases,
  getCaseById,
  updateCase,
  deleteCase,
  addTimelineEntry,
  validateCase,
};
