const Criminal = require("../models/criminal");
const Case = require("../models/case");

const getStats = async (req, res) => {
  try {
    const [
      totalCriminals,
      totalCases,
      openCases,
      closedCases,
      underInvestigation,
      wantedCriminals,
      arrestedCriminals,
      recentCriminals,
      recentCases,
    ] = await Promise.all([
      Criminal.countDocuments(),
      Case.countDocuments(),
      Case.countDocuments({ status: "Open" }),
      Case.countDocuments({ status: "Closed" }),
      Case.countDocuments({ status: "Under Investigation" }),
      Criminal.countDocuments({ status: "Wanted" }),
      Criminal.countDocuments({ status: "Arrested" }),
      Criminal.find().sort({ createdAt: -1 }).limit(5),
      Case.find()
        .populate("criminal", "name status")
        .populate("assignedOfficer", "name badgeNumber")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    res.json({
      totalCriminals,
      totalCases,
      openCases,
      closedCases,
      underInvestigation,
      wantedCriminals,
      arrestedCriminals,
      recentCriminals,
      recentCases,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStats };
