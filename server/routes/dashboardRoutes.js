const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getStats } = require("../controllers/dashboardController");

router.use(protect);
router.get("/stats", getStats);

module.exports = router;
