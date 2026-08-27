const express = require("express");
const Medicine = require("../models/Medicine");
const Bill = require("../models/Bill");
const Customer = require("../models/Customer");
const { auth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// GET /api/reports/low-stock?threshold=10
router.get("/low-stock", auth, async (req, res) => {
  try {
    const threshold = Number(req.query.threshold) || 10;
    const medicines = await Medicine.find({ quantity: { $lte: threshold }, tenantId: req.user.tenantId }).sort({ quantity: 1 });
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch low stock report.", error: err.message });
  }
});

// GET /api/reports/expiring?days=30
router.get("/expiring", auth, async (req, res) => {
  try {
    const days = Number(req.query.days) || 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);
    const medicines = await Medicine.find({ expiry: { $lte: cutoff }, tenantId: req.user.tenantId }).sort({ expiry: 1 });
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch expiry report.", error: err.message });
  }
});

// GET /api/reports/sales?date=YYYY-MM-DD  (defaults to today, Admin only)
router.get("/sales", auth, requireAdmin, async (req, res) => {
  try {
    const dateStr = req.query.date || new Date().toISOString().slice(0, 10);
    const start = new Date(`${dateStr}T00:00:00.000Z`);
    const end = new Date(`${dateStr}T23:59:59.999Z`);
    const bills = await Bill.find({ createdAt: { $gte: start, $lte: end }, tenantId: req.user.tenantId }).sort({ createdAt: -1 });
    const total = bills.reduce((s, b) => s + b.grandTotal, 0);
    res.json({ date: dateStr, count: bills.length, total, bills });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch sales report.", error: err.message });
  }
});

// GET /api/reports/summary  (for the dashboard)
router.get("/summary", auth, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const isAdmin = req.user.role === "Admin";

    const promises = [
      Medicine.countDocuments({ tenantId }),
      Medicine.countDocuments({ quantity: { $lte: 10 }, tenantId }),
      Medicine.countDocuments({ expiry: { $lte: new Date(Date.now() + 30 * 86400000) }, tenantId }),
      (async () => {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const bills = await Bill.find({ createdAt: { $gte: start }, tenantId });
        return { count: bills.length, total: bills.reduce((s, b) => s + b.grandTotal, 0) };
      })(),
    ];

    if (isAdmin) {
      promises.push(
        Bill.find({ tenantId }),
        Medicine.find({ tenantId }),
        Customer.countDocuments({ tenantId })
      );
    }

    const results = await Promise.all(promises);
    const medicineCount = results[0];
    const lowStock = results[1];
    const expiring = results[2];
    const todaySales = results[3];

    let totalSales = 0;
    let totalPurchases = 0;
    let pendingPayments = 0;
    let profitOrLoss = 0;
    let totalCustomers = 0;

    if (isAdmin) {
      const allBills = results[4];
      const allMedicines = results[5];
      totalCustomers = results[6];

      totalSales = allBills.reduce((s, b) => s + b.grandTotal, 0);
      totalPurchases = allMedicines.reduce((s, m) => s + (m.purchasePrice * m.quantity), 0);
      pendingPayments = allBills
        .filter((b) => b.paymentStatus === "Pending")
        .reduce((s, b) => s + b.grandTotal, 0);

      profitOrLoss = allBills.reduce((acc, bill) => {
        const billCost = bill.items.reduce((s, item) => s + (item.purchasePrice * item.qty), 0);
        return acc + (bill.subtotal - billCost);
      }, 0);
    }

    res.json({
      medicineCount,
      lowStockCount: lowStock,
      expiringCount: expiring,
      todaySales,
      totalSales,
      totalPurchases,
      totalCustomers,
      pendingPayments,
      profitOrLoss,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to build dashboard summary.", error: err.message });
  }
});

module.exports = router;
