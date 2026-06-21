const Criminal = require("../models/criminal");
const Case = require("../models/case");
const Officer = require("../models/officer");

const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.json({ criminals: [], cases: [], officers: [] });
    }

    const search = q.trim();

    const [criminals, cases, officers] = await Promise.all([
      Criminal.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { address: { $regex: search, $options: "i" } },
        ],
      })
        .select("name status age gender")
        .limit(10),
      Case.find({
        $or: [
          { caseNumber: { $regex: search, $options: "i" } },
          { crimeType: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
        ],
      })
        .populate("criminal", "name")
        .populate("assignedOfficer", "name")
        .select("caseNumber crimeType status location")
        .limit(10),
      Officer.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { badgeNumber: { $regex: search, $options: "i" } },
          { rank: { $regex: search, $options: "i" } },
        ],
      })
        .select("name badgeNumber rank email")
        .limit(10),
    ]);

    res.json({ criminals, cases, officers, query: search });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { globalSearch };
