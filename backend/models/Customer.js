const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, default: "", trim: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
  },
  { timestamps: true }
);

customerSchema.index({ phone: 1, tenantId: 1 }, { unique: true });

module.exports = mongoose.model("Customer", customerSchema);
