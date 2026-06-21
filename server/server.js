const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const criminalRoutes = require("./routes/criminalRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const caseRoutes = require("./routes/caseRoutes");
const officerRoutes = require("./routes/officerRoutes");
const evidenceRoutes = require("./routes/evidenceRoutes");
const reportRoutes = require("./routes/reportRoutes");
const searchRoutes = require("./routes/searchRoutes");

dotenv.config();
connectDB();

const app = express();
const aiRoutes = require("./routes/aiRoutes");
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Crime Record Management API Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/criminals", criminalRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/officers", officerRoutes);
app.use("/api/evidence", evidenceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/search", searchRoutes);

app.use((err, req, res, next) => {
  if (err.message?.includes("file") || err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: err.message || "Server error" });
});

app.use("/api/ai", aiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
