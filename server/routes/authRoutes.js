const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { readOnly } = require("../middleware/roleMiddleware");
const {
  registerUser,
  loginUser,
  getMe,
  validateRegister,
  validateLogin,
} = require("../controllers/authController");

router.post("/register", validateRegister, registerUser);
router.post("/login", validateLogin, loginUser);
router.get("/me", protect, getMe);

module.exports = router;
