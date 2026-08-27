const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, default: "General", trim: true },
    batch: { type: String, default: "—", trim: true },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    unit: { type: String, enum: ["Strip", "Bottle", "Sachet", "Box", "Tube"], default: "Strip" },
    price: { type: Number, required: true, min: 0 },
    purchasePrice: { type: Number, required: true, min: 0, default: 0 },
    gst: { type: Number, enum: [5, 12, 18], default: 12 },
    expiry: { type: Date, required: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
  },
  { timestamps: true }
);

medicineSchema.index({ name: "text", category: "text", batch: "text" });

module.exports = mongoose.model("Medicine", medicineSchema);
