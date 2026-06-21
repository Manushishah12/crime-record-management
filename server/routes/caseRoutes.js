const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { readOnly, authorize } = require("../middleware/roleMiddleware");
const {
  addCase,
  getCases,
  getCaseById,
  updateCase,
  deleteCase,
  addTimelineEntry,
  validateCase,
} = require("../controllers/caseController");

router.use(protect, readOnly);

router.get("/", getCases);
router.get("/:id", getCaseById);
router.post("/", authorize("Admin", "Officer"), validateCase, addCase);
router.put("/:id", authorize("Admin", "Officer"), validateCase, updateCase);
router.post("/:id/timeline", authorize("Admin", "Officer"), addTimelineEntry);
router.delete("/:id", authorize("Admin", "Officer"), deleteCase);

module.exports = router;
