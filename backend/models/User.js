const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    mobile: { type: String, trim: true },
    role: { type: String, enum: ["Admin", "Staff"], default: "Staff" },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
