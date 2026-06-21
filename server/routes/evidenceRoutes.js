const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { readOnly, authorize } = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  addEvidence,
  getEvidence,
  deleteEvidence,
  validateEvidence,
} = require("../controllers/evidenceController");

router.use(protect, readOnly);

router.get("/", getEvidence);
router.post(
  "/",
  authorize("Admin", "Officer"),
  upload.single("file"),
  validateEvidence,
  addEvidence
);
router.delete("/:id", authorize("Admin", "Officer"), deleteEvidence);

module.exports = router;
