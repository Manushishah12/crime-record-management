const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { readOnly, authorize } = require("../middleware/roleMiddleware");
const {
  addOfficer,
  getOfficers,
  getOfficerById,
  updateOfficer,
  deleteOfficer,
  validateOfficer,
} = require("../controllers/officerController");

router.use(protect, readOnly);

router.get("/", getOfficers);
router.get("/:id", getOfficerById);
router.post("/", authorize("Admin"), validateOfficer, addOfficer);
router.put("/:id", authorize("Admin"), validateOfficer, updateOfficer);
router.delete("/:id", authorize("Admin"), deleteOfficer);

module.exports = router;
