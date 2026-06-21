const Case = require("../models/case");
const Criminal = require("../models/criminal");
const Officer = require("../models/officer");

const getOpenCasesReport = async (req, res) => {
  try {
    const cases = await Case.find({
      status: { $in: ["Open", "Under Investigation"] },
    })
      .populate("criminal", "name status")
      .populate("assignedOfficer", "name badgeNumber rank")
      .sort({ date: -1 });

    res.json({
      reportType: "Open Cases Report",
      generatedAt: new Date(),
      total: cases.length,
      data: cases,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getClosedCasesReport = async (req, res) => {
  try {
    const cases = await Case.find({ status: "Closed" })
      .populate("criminal", "name status")
      .populate("assignedOfficer", "name badgeNumber rank")
      .sort({ updatedAt: -1 });

    res.json({
      reportType: "Closed Cases Report",
      generatedAt: new Date(),
      total: cases.length,
      data: cases,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCriminalReport = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const criminals = await Criminal.find(filter).sort({ createdAt: -1 });

    res.json({
      reportType: "Criminal Report",
      generatedAt: new Date(),
      total: criminals.length,
      data: criminals,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOfficerReport = async (req, res) => {
  try {
    const officers = await Officer.find().sort({ name: 1 });
    const cases = await Case.find({ assignedOfficer: { $ne: null } });

    const data = officers.map((officer) => ({
      ...officer.toObject(),
      assignedCaseCount: cases.filter(
        (c) => c.assignedOfficer?.toString() === officer._id.toString()
      ).length,
    }));

    res.json({
      reportType: "Officer Report",
      generatedAt: new Date(),
      total: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOpenCasesReport,
  getClosedCasesReport,
  getCriminalReport,
  getOfficerReport,
};
