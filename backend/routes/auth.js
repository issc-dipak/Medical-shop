const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Tenant = require("../models/Tenant");
const { auth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { shopName, ownerName, email, mobile, address, gstNumber, drugLicenseNumber, password } = req.body;
    if (!shopName || !ownerName || !email || !password) {
      return res.status(400).json({ message: "Shop Name, Owner Name, Email, and Password are required." });
    }

    const emailTrimmed = email.toLowerCase().trim();
    const existingUser = await User.findOne({ 
      $or: [
        { username: emailTrimmed },
        { email: emailTrimmed }
      ]
    });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists." });
    }

    // 1. Create a new Tenant (medical store)
    const tenant = new Tenant({ 
      name: shopName, 
      address, 
      phone: mobile,
      gstNumber,
      drugLicenseNumber
    });
    await tenant.save();

    // 2. Create the Admin User for this Tenant
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      username: emailTrimmed, // Keep username identical to email for compatibility
      email: emailTrimmed,
      mobile,
      passwordHash,
      name: ownerName,
      role: "Admin", // Default to Admin for the creator of the store
      tenantId: tenant._id,
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, username: newUser.username, role: newUser.role, name: newUser.name, tenantId: newUser.tenantId },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.status(201).json({
      token,
      user: { id: newUser._id, username: newUser.username, role: newUser.role, name: newUser.name, tenantId: newUser.tenantId },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error during registration.", error: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username/Email and password are required." });
    }

    const loginId = username.toLowerCase().trim();
    const user = await User.findOne({
      $or: [
        { username: loginId },
        { email: loginId }
      ]
    });
    if (!user) {
      return res.status(401).json({ message: "Incorrect username/email or password." });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: "Incorrect username/email or password." });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role, name: user.name, tenantId: user.tenantId },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({
      token,
      user: { id: user._id, username: user.username, role: user.role, name: user.name, tenantId: user.tenantId },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error during login.", error: err.message });
  }
});

// GET /api/auth/me
router.get("/me", auth, (req, res) => {
  res.json({ user: req.user });
});

// GET /api/auth/staff (Get all staff members for the tenant)
router.get("/staff", auth, async (req, res) => {
  try {
    const staff = await User.find({ tenantId: req.user.tenantId }).select("-passwordHash").sort({ name: 1 });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch staff members.", error: err.message });
  }
});

// POST /api/auth/staff (Add a new staff member - Admin only)
router.post("/staff", auth, requireAdmin, async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    const emailTrimmed = email.toLowerCase().trim();
    const existing = await User.findOne({ 
      $or: [
        { username: emailTrimmed },
        { email: emailTrimmed }
      ]
    });
    if (existing) {
      return res.status(400).json({ message: "A user with this email/username already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newStaff = new User({
      username: emailTrimmed,
      email: emailTrimmed,
      mobile,
      name,
      passwordHash,
      role: "Staff", // Explicitly enforce Staff role
      tenantId: req.user.tenantId
    });

    await newStaff.save();
    
    // Return staff info without password hash
    const responseStaff = { ...newStaff._doc };
    delete responseStaff.passwordHash;

    res.status(201).json(responseStaff);
  } catch (err) {
    res.status(500).json({ message: "Failed to add staff member.", error: err.message });
  }
});

// DELETE /api/auth/staff/:id (Delete staff member - Admin only)
router.delete("/staff/:id", auth, requireAdmin, async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "You cannot delete your own account." });
    }

    const user = await User.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!user) {
      return res.status(404).json({ message: "Staff member not found or access denied." });
    }

    res.json({ message: "Staff member deleted.", id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete staff member.", error: err.message });
  }
});

module.exports = router;
