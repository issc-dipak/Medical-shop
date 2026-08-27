const express = require("express");
const Medicine = require("../models/Medicine");
const { auth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// GET /api/medicines?search=para
router.get("/", auth, async (req, res) => {
  try {
    const { search } = req.query;
    const filter = { tenantId: req.user.tenantId };
    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { category: new RegExp(search, "i") },
        { batch: new RegExp(search, "i") },
      ];
    }
    const medicines = await Medicine.find(filter).sort({ name: 1 });
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch medicines.", error: err.message });
  }
});

// POST /api/medicines  (Admin only)
router.post("/", auth, requireAdmin, async (req, res) => {
  try {
    const { name, category, batch, quantity, unit, price, purchasePrice, gst, expiry } = req.body;
    if (!name || quantity === undefined || price === undefined || !expiry) {
      return res.status(400).json({ message: "name, quantity, price and expiry are required." });
    }
    const medicine = await Medicine.create({
      name,
      category,
      batch,
      quantity,
      unit,
      price,
      purchasePrice: purchasePrice || 0,
      gst,
      expiry,
      tenantId: req.user.tenantId,
    });
    res.status(201).json(medicine);
  } catch (err) {
    res.status(500).json({ message: "Failed to add medicine.", error: err.message });
  }
});

// PUT /api/medicines/:id  (Admin only)
router.put("/:id", auth, requireAdmin, async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!medicine) return res.status(404).json({ message: "Medicine not found." });
    res.json(medicine);
  } catch (err) {
    res.status(500).json({ message: "Failed to update medicine.", error: err.message });
  }
});

// DELETE /api/medicines/:id  (Admin only)
router.delete("/:id", auth, requireAdmin, async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!medicine) return res.status(404).json({ message: "Medicine not found." });
    res.json({ message: "Medicine deleted.", id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete medicine.", error: err.message });
  }
});

module.exports = router;
