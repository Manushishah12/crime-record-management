const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { readOnly, authorize } = require("../middleware/roleMiddleware");
const {
  addCriminal,
  getCriminals,
  getCriminalById,
  updateCriminal,
  deleteCriminal,
  validateCriminal,
} = require("../controllers/criminalController");

router.use(protect, readOnly);

router.get("/", getCriminals);
router.get("/:id", getCriminalById);
router.post("/", authorize("Admin", "Officer"), validateCriminal, addCriminal);
router.put("/:id", authorize("Admin", "Officer"), validateCriminal, updateCriminal);
router.delete("/:id", authorize("Admin"), deleteCriminal);

module.exports = router;
