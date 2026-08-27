const express = require("express");
const bcrypt = require("bcryptjs");
const Tenant = require("../models/Tenant");
const User = require("../models/User");
const { auth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// GET /api/tenant/settings
router.get("/settings", auth, async (req, res) => {
  try {
    let tenant = await Tenant.findById(req.user.tenantId);
    if (!tenant) {
      // Auto-create default tenant if it doesn't exist
      tenant = await Tenant.create({
        _id: req.user.tenantId,
        name: "My Medical Store",
        phone: "",
        address: "",
        gstNumber: "",
        drugLicenseNumber: ""
      });
    }
    res.json(tenant);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tenant settings.", error: err.message });
  }
});

// PUT /api/tenant/settings (Admin only)
router.put("/settings", auth, requireAdmin, async (req, res) => {
  try {
    const { name, phone, address, gstNumber, drugLicenseNumber } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Store name is required." });
    }

    let tenant = await Tenant.findByIdAndUpdate(
      req.user.tenantId,
      { name, phone, address, gstNumber, drugLicenseNumber },
      { new: true, runValidators: true }
    );

    if (!tenant) {
      tenant = await Tenant.create({
        _id: req.user.tenantId,
        name,
        phone,
        address,
        gstNumber,
        drugLicenseNumber
      });
    }

    res.json({ message: "Settings updated successfully.", tenant });
  } catch (err) {
    res.status(500).json({ message: "Failed to update tenant settings.", error: err.message });
  }
});

// PUT /api/tenant/password
router.put("/password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new passwords are required." });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password." });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to update password.", error: err.message });
  }
});

module.exports = router;
