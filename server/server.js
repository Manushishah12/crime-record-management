
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
const aiRoutes = require("./routes/aiRoutes");

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  "https://crime-record-management-ebon.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Crime Record Management API Running");
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/criminals", criminalRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/officers", officerRoutes);
app.use("/api/evidence", evidenceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/ai", aiRoutes);

// Error handler - keep this after all API routes
app.use((err, req, res, next) => {
  if (err.message?.includes("file") || err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: err.message });
  }

  res.status(500).json({
    message: err.message || "Server error"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
