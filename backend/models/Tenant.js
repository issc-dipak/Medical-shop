const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    gstNumber: { type: String, trim: true },
    drugLicenseNumber: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    plan: { type: String, enum: ["Free", "Pro"], default: "Free" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tenant", tenantSchema);
