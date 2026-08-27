const mongoose = require("mongoose");

const billItemSchema = new mongoose.Schema(
  {
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    purchasePrice: { type: Number, required: true, default: 0 },
    gst: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const billSchema = new mongoose.Schema(
  {
    billNumber: { type: String, required: true },
    customerName: { type: String, default: "Walk-in customer" },
    customerPhone: { type: String, default: "" },
    items: { type: [billItemSchema], required: true, validate: (v) => v.length > 0 },
    subtotal: { type: Number, required: true },
    gstTotal: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    paymentStatus: { type: String, enum: ["Paid", "Pending"], default: "Paid" },
    createdBy: { type: String, default: "" },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
  },
  { timestamps: true }
);

billSchema.index({ billNumber: 1, tenantId: 1 }, { unique: true });

module.exports = mongoose.model("Bill", billSchema);
