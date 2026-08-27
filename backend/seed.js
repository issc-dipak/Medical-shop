require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const User = require("./models/User");
const Medicine = require("./models/Medicine");
const Customer = require("./models/Customer");
const Bill = require("./models/Bill");
const Tenant = require("./models/Tenant");

function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function seed() {
  await connectDB();

  console.log("Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Medicine.deleteMany({}),
    Customer.deleteMany({}),
    Bill.deleteMany({}),
    Tenant.deleteMany({}),
  ]);

  console.log("Creating default tenant...");
  const tenant = await Tenant.create({ 
    name: "Shirpur Medical Store",
    phone: "9876543210",
    address: "Shirpur City",
    gstNumber: "27AAAAA1111A1Z1",
    drugLicenseNumber: "DL-12345/MH"
  });
  const tenantId = tenant._id;

  console.log("Creating users...");
  const users = [
    { username: "admin", password: "admin123", name: "Shop Admin", role: "Admin", email: "admin@example.com", mobile: "9876543210", tenantId },
    { username: "staff", password: "staff123", name: "Counter Staff", role: "Staff", email: "staff@example.com", mobile: "9876543211", tenantId },
  ];
  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await User.create({ username: u.username, passwordHash, name: u.name, role: u.role, email: u.email, mobile: u.mobile, tenantId: u.tenantId });
  }

  console.log("Creating sample medicines...");
  await Medicine.insertMany([
    { name: "Paracetamol 500mg", category: "Analgesic", batch: "PCM-22A", quantity: 240, unit: "Strip", price: 18, purchasePrice: 12, gst: 12, expiry: daysFromNow(420), tenantId },
    { name: "Amoxicillin 250mg", category: "Antibiotic", batch: "AMX-09B", quantity: 60, unit: "Strip", price: 65, purchasePrice: 45, gst: 12, expiry: daysFromNow(25), tenantId },
    { name: "Cetirizine 10mg", category: "Antihistamine", batch: "CTZ-14C", quantity: 8, unit: "Strip", price: 22, purchasePrice: 15, gst: 5, expiry: daysFromNow(300), tenantId },
    { name: "ORS Sachet", category: "Rehydration", batch: "ORS-03D", quantity: 150, unit: "Sachet", price: 12, purchasePrice: 8, gst: 5, expiry: daysFromNow(200), tenantId },
    { name: "Azithromycin 500mg", category: "Antibiotic", batch: "AZI-31E", quantity: 5, unit: "Strip", price: 110, purchasePrice: 80, gst: 12, expiry: daysFromNow(12), tenantId },
    { name: "Vitamin C 500mg", category: "Supplement", batch: "VTC-77F", quantity: 90, unit: "Bottle", price: 145, purchasePrice: 100, gst: 18, expiry: daysFromNow(500), tenantId },
    { name: "Pantoprazole 40mg", category: "Antacid", batch: "PAN-05G", quantity: 40, unit: "Strip", price: 48, purchasePrice: 32, gst: 12, expiry: daysFromNow(9), tenantId },
  ]);

  console.log("Creating sample customers...");
  await Customer.insertMany([
    { name: "Ramesh Deshmukh", phone: "9876543210", address: "Shirpur City", tenantId },
    { name: "Sunita Patil", phone: "9823456712", address: "Shirpur City", tenantId },
  ]);

  console.log("Seed complete.");
  console.log("Login with: admin / admin123  or  staff / staff123");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
