const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getOpenCasesReport,
  getClosedCasesReport,
  getCriminalReport,
  getOfficerReport,
} = require("../controllers/reportController");

router.use(protect);

router.get("/open-cases", getOpenCasesReport);
router.get("/closed-cases", getClosedCasesReport);
router.get("/criminals", getCriminalReport);
router.get("/officers", getOfficerReport);

module.exports = router;
