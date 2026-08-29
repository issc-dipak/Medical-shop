const express = require("express");
const Medicine = require("../models/Medicine");
const Customer = require("../models/Customer");
const Bill = require("../models/Bill");
const { auth } = require("../middleware/auth");

const router = express.Router();

async function generateBillNumber(tenantId) {
  const lastBill = await Bill.findOne({ tenantId }).sort({ billNumber: -1 });
  if (!lastBill) {
    return "BILL-0001";
  }
  const match = lastBill.billNumber.match(/BILL-(\d+)/);
  const nextNum = match ? parseInt(match[1], 10) + 1 : 1;
  return `BILL-${String(nextNum).padStart(4, "0")}`;
}

// GET /api/bills
router.get("/", auth, async (req, res) => {
  try {
    const filter = { tenantId: req.user.tenantId };
    if (req.user.role !== "Admin") {
      filter.createdBy = req.user.username;
    }
    const bills = await Bill.find(filter).sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bills.", error: err.message });
  }
});

// POST /api/bills
// body: { items: [{ medicineId, qty }], customerName, customerPhone, paymentStatus }
router.post("/", auth, async (req, res) => {
  try {
    const { items, customerName, customerPhone, paymentStatus } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "At least one item is required." });
    }

    // Load medicines and verify stock availability first
    const medicineIds = items.map((i) => i.medicineId);
    const medicines = await Medicine.find({ _id: { $in: medicineIds }, tenantId: req.user.tenantId });
    const medicineMap = new Map(medicines.map((m) => [String(m._id), m]));

    const billItems = [];
    for (const item of items) {
      const med = medicineMap.get(String(item.medicineId));
      if (!med) return res.status(404).json({ message: `Medicine ${item.medicineId} not found.` });
      if (item.qty < 1) return res.status(400).json({ message: `Invalid quantity for ${med.name}.` });
      if (med.quantity < item.qty) {
        return res.status(400).json({ message: `Insufficient stock for ${med.name}. Available: ${med.quantity}.` });
      }
      billItems.push({ 
        medicine: med._id, 
        name: med.name, 
        price: med.price, 
        purchasePrice: med.purchasePrice || 0, // Store cost price at time of sale
        gst: med.gst, 
        qty: item.qty 
      });
    }

    const subtotal = billItems.reduce((s, i) => s + i.price * i.qty, 0);
    const gstTotal = billItems.reduce((s, i) => s + (i.price * i.qty * i.gst) / 100, 0);
    const grandTotal = subtotal + gstTotal;

    // Upsert customer if phone provided
    let customer = null;
    if (customerPhone) {
      customer = await Customer.findOneAndUpdate(
        { phone: customerPhone, tenantId: req.user.tenantId },
        { $setOnInsert: { name: customerName || "Walk-in customer", phone: customerPhone, address: "", tenantId: req.user.tenantId } },
        { upsert: true, new: true }
      );
    }

    let bill;
    let retries = 3;
    while (retries > 0) {
      try {
        const billNumber = await generateBillNumber(req.user.tenantId);
        bill = await Bill.create({
          billNumber,
          customerName: customer ? customer.name : customerName || "Walk-in customer",
          customerPhone: customerPhone || "",
          items: billItems,
          subtotal,
          gstTotal,
          grandTotal,
          paymentStatus: paymentStatus || "Paid",
          createdBy: req.user?.username || "",
          tenantId: req.user.tenantId,
        });
        break;
      } catch (err) {
        if (err.code === 11000 && (err.message.includes("billNumber") || JSON.stringify(err.keyValue || {}).includes("billNumber"))) {
          retries--;
          if (retries === 0) throw err;
          await new Promise((resolve) => setTimeout(resolve, Math.random() * 50 + 10));
        } else {
          throw err;
        }
      }
    }

    // Deduct stock for each item.
    await Promise.all(
      billItems.map((i) => Medicine.findOneAndUpdate({ _id: i.medicine, tenantId: req.user.tenantId }, { $inc: { quantity: -i.qty } }))
    );

    res.status(201).json(bill);
  } catch (err) {
    res.status(500).json({ message: "Failed to generate bill.", error: err.message });
  }
});

// PATCH /api/bills/:id/status (Update bill payment status)
router.patch("/:id/status", auth, async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    if (!["Paid", "Pending"].includes(paymentStatus)) {
      return res.status(400).json({ message: "Invalid payment status. Must be Paid or Pending." });
    }

    const filter = { _id: req.params.id, tenantId: req.user.tenantId };
    if (req.user.role !== "Admin") {
      filter.createdBy = req.user.username;
    }

    const bill = await Bill.findOneAndUpdate(
      filter,
      { paymentStatus },
      { new: true }
    );

    if (!bill) {
      return res.status(404).json({ message: "Bill not found or access denied." });
    }

    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: "Failed to update bill payment status.", error: err.message });
  }
});

module.exports = router;
