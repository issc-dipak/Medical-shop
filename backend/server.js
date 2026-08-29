require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const medicineRoutes = require("./routes/medicines");
const customerRoutes = require("./routes/customers");
const billRoutes = require("./routes/bills");
const reportRoutes = require("./routes/reports");
const tenantRoutes = require("./routes/tenant");

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001,https://medical-shop-two.vercel.app").split(",");
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "pharmadesk-backend" }));

app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/tenant", tenantRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Route not found." }));

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Unexpected server error.", error: err.message });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`PharmaDesk API running on http://localhost:${PORT}`));
});
