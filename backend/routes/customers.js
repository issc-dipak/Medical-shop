const express = require("express");
const Customer = require("../models/Customer");
const Bill = require("../models/Bill");
const { auth } = require("../middleware/auth");

const router = express.Router();

// GET /api/customers
router.get("/", auth, async (req, res) => {
  try {
    const customers = await Customer.find({ tenantId: req.user.tenantId }).sort({ name: 1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch customers.", error: err.message });
  }
});

// POST /api/customers
router.post("/", auth, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ message: "name and phone are required." });
    }

    const existing = await Customer.findOne({ phone, tenantId: req.user.tenantId });
    if (existing) return res.json(existing);

    const customer = await Customer.create({ name, phone, address, tenantId: req.user.tenantId });
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ message: "Failed to add customer.", error: err.message });
  }
});

// GET /api/customers/:phone/history
router.get("/:phone/history", auth, async (req, res) => {
  try {
    const bills = await Bill.find({ customerPhone: req.params.phone, tenantId: req.user.tenantId }).sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch purchase history.", error: err.message });
  }
});

module.exports = router;
