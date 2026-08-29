"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { Button, Field, inputClass, Badge } from "@/components/Bits";
import { getMedicines, createBill, getBills, updateBillStatus, getCustomers, getTenantSettings } from "@/lib/api";

export default function BillingPage() {
  const [medicines, setMedicines] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]); // { id, name, price, gst, qty, maxQty }
  const [search, setSearch] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [lastBill, setLastBill] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Tab switching state
  const [activeTab, setActiveTab] = useState("new"); // "new" | "history"
  const [billsList, setBillsList] = useState([]);
  const [loadingBills, setLoadingBills] = useState(false);

  useEffect(() => {
    getMedicines().then(setMedicines).catch((err) => setError(err.message));
    getCustomers().then(setCustomers).catch((err) => setError(err.message));
  }, []);

  async function loadBillsList() {
    setLoadingBills(true);
    setError("");
    try {
      const list = await getBills();
      setBillsList(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingBills(false);
    }
  }

  async function handleUpdateStatus(id, newStatus) {
    setError("");
    try {
      await updateBillStatus(id, newStatus);
      await loadBillsList();
    } catch (err) {
      setError(err.message);
    }
  }

  const results = useMemo(() => {
    if (!search) return [];
    const q = search.toLowerCase();
    return medicines.filter((m) => m.name.toLowerCase().includes(q) && m.quantity > 0).slice(0, 6);
  }, [search, medicines]);

  const filteredCustomers = useMemo(() => {
    if (!customerPhone) return [];
    const q = customerPhone.toLowerCase();
    // Do not show matches if the search perfectly matches an existing customer already
    const exact = customers.find((c) => c.phone === q);
    if (exact) return [];

    return customers.filter(
      (c) => c.phone.includes(q) || c.name.toLowerCase().includes(q)
    ).slice(0, 4);
  }, [customerPhone, customers]);

  function addToCart(med) {
    setCart((c) => {
      const fontId = med._id;
      const existing = c.find((i) => i.id === fontId);
      if (existing) {
        return c.map((i) => (i.id === fontId ? { ...i, qty: Math.min(i.qty + 1, med.quantity) } : i));
      }
      return [...c, { id: med._id, name: med.name, price: med.price, gst: med.gst, qty: 1, maxQty: med.quantity }];
    });
    setSearch("");
  }

  function updateQty(id, qty) {
    setCart((c) => c.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(qty, i.maxQty)) } : i)));
  }

  function removeFromCart(id) {
    setCart((c) => c.filter((i) => i.id !== id));
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const gstTotal = cart.reduce((s, i) => s + (i.price * i.qty * i.gst) / 100, 0);
  const grandTotal = subtotal + gstTotal;

  async function handleGenerateBill() {
    if (cart.length === 0) return;
    setSubmitting(true);
    setError("");
    try {
      const bill = await createBill({
        items: cart.map((i) => ({ medicineId: i.id, qty: i.qty })),
        customerName: customerName || "Walk-in customer",
        customerPhone: customerPhone || "",
        paymentStatus,
      });
      setLastBill(bill);
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setPaymentStatus("Paid");
      getMedicines().then(setMedicines);
      getCustomers().then(setCustomers);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (lastBill) {
    return (
      <AppShell>
        <BillReceipt bill={lastBill} onNewBill={() => setLastBill(null)} />
      </AppShell>
    );
  }

  return (
    <AppShell eyebrow="Billing module" title="Generate a bill">
      {error && <p className="text-brick text-sm mb-4">{error}</p>}
      
      {/* Switcher Tab Header */}
      <div className="flex gap-4 border-b border-line pb-4 mb-6">
        <button
          onClick={() => setActiveTab("new")}
          className={`px-4 py-2 text-sm font-semibold rounded-sm transition-all cursor-pointer ${
            activeTab === "new" 
              ? "bg-teal-light text-teal border border-teal/30" 
              : "text-muted hover:text-ink"
          }`}
        >
          New Bill
        </button>
        <button
          onClick={() => { setActiveTab("history"); loadBillsList(); }}
          className={`px-4 py-2 text-sm font-semibold rounded-sm transition-all cursor-pointer ${
            activeTab === "history" 
              ? "bg-teal-light text-teal border border-teal/30" 
              : "text-muted hover:text-ink"
          }`}
        >
          Bill History & Credit
        </button>
      </div>

      {activeTab === "new" ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
          <div>
            <div className="relative mb-5">
              <input
                className={`${inputClass} w-full`}
                placeholder="Search medicine to add…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {results.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-line rounded-md mt-1.5 shadow-lg overflow-hidden">
                  {results.map((m) => (
                    <button
                      key={m._id}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-teal-light flex items-center justify-between text-ink border-b border-line/20 last:border-b-0 cursor-pointer"
                      onClick={() => addToCart(m)}
                    >
                      <span>{m.name}</span>
                      <span className="text-[12px] text-muted font-mono">₹{m.price} · {m.quantity} in stock</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-panel rounded-md overflow-hidden overflow-x-auto shadow-card">
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>GST</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((i) => (
                    <tr key={i.id}>
                      <td>{i.name}</td>
                      <td className="font-mono">₹{i.price.toFixed(2)}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          max={i.maxQty}
                          className="w-16 border border-line rounded-sm px-2.5 py-1 text-sm bg-panel/30 text-ink font-mono focus:border-teal outline-none"
                          value={i.qty}
                          onChange={(e) => updateQty(i.id, Number(e.target.value))}
                        />
                      </td>
                      <td className="font-mono">{i.gst}%</td>
                      <td className="font-mono">₹{(i.price * i.qty * (1 + i.gst / 100)).toFixed(2)}</td>
                      <td>
                        <button className="text-[13px] text-brick font-medium hover:underline cursor-pointer" onClick={() => removeFromCart(i.id)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {cart.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-8">
                        Search and add medicines to start a bill.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-panel rounded-md p-5 flex flex-col gap-3 sticky top-9 shadow-card">
            <h2 className="font-display text-lg font-semibold mb-1">Customer & Payment</h2>
            <Field label="Phone (optional)">
              <div className="relative">
                <input 
                  className={`${inputClass} w-full`} 
                  value={customerPhone} 
                  onChange={(e) => setCustomerPhone(e.target.value)} 
                  placeholder="For purchase history" 
                />
                {filteredCustomers.length > 0 && (
                  <div className="absolute z-20 w-full bg-white border border-line rounded-md mt-1.5 shadow-lg max-h-40 overflow-y-auto">
                    {filteredCustomers.map((c) => (
                      <button
                        key={c._id}
                        type="button"
                        className="w-full text-left px-3.5 py-2 text-sm hover:bg-teal-light flex items-center justify-between text-ink border-b border-line/10 last:border-0 cursor-pointer"
                        onClick={() => {
                          setCustomerPhone(c.phone);
                          setCustomerName(c.name);
                        }}
                      >
                        <div>
                          <div className="font-semibold text-[13px] text-ink">{c.name}</div>
                          <div className="text-[11px] text-muted font-mono">{c.phone}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Field>
            <Field label="Name (optional)">
              <input className={inputClass} value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Walk-in customer" />
            </Field>
            <Field label="Payment Status">
              <select className={inputClass} value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending (Credit)</option>
              </select>
            </Field>

            <div className="border-t border-line pt-3 mt-1 flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted">Subtotal</span><span className="font-mono">₹{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted">GST</span><span className="font-mono">₹{gstTotal.toFixed(2)}</span></div>
              <div className="flex justify-between font-semibold text-base pt-1 border-t border-line mt-1">
                <span>Grand total</span><span className="font-mono">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <Button className="mt-2" onClick={handleGenerateBill} disabled={cart.length === 0 || submitting}>
              {submitting ? "Generating…" : "Generate bill"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-md overflow-hidden overflow-x-auto shadow-card">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Bill No.</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Grand Total</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingBills && (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-8">
                    Loading history…
                  </td>
                </tr>
              )}
              {!loadingBills && billsList.map((b) => (
                <tr key={b._id}>
                  <td className="font-mono text-[13px] font-semibold text-teal">{b.billNumber}</td>
                  <td className="font-mono text-[13px] text-muted">{new Date(b.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="font-medium text-ink">{b.customerName}</div>
                    {b.customerPhone && <div className="text-[11px] font-mono text-muted">{b.customerPhone}</div>}
                  </td>
                  <td>
                    <Badge tone={b.paymentStatus === "Paid" ? "sage" : "brick"}>
                      {b.paymentStatus}
                    </Badge>
                  </td>
                  <td className="font-mono font-semibold text-ink">₹{b.grandTotal.toFixed(2)}</td>
                  <td>
                    <div className="flex gap-3 justify-end items-center">
                      {b.paymentStatus === "Pending" && (
                        <button
                          onClick={() => handleUpdateStatus(b._id, "Paid")}
                          className="text-[11px] bg-sage-light text-teal border border-teal/20 px-2 py-1 rounded font-semibold hover:bg-teal/20 transition-all cursor-pointer"
                        >
                          Mark Paid
                        </button>
                      )}
                      <button
                        onClick={() => setLastBill(b)}
                        className="text-[13px] text-teal font-semibold hover:underline cursor-pointer"
                      >
                        View Receipt
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loadingBills && billsList.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-8">
                    No bills found in history.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}

function BillReceipt({ bill, onNewBill }) {
  const [tenant, setTenant] = useState(null);

  useEffect(() => {
    getTenantSettings()
      .then(setTenant)
      .catch((err) => console.error("Failed to load settings in receipt", err));
  }, []);

  const date = new Date(bill.createdAt);

  const formatDate = (d) => {
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }) + " " + d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="max-w-[580px] w-full">
      <div className="bg-white border border-line rounded-lg p-6 shadow-md font-mono text-[13px] text-ink leading-relaxed" id="receipt">
        {/* Tax Invoice Header */}
        <div className="text-center border-b border-line pb-4 mb-4">
          <div className="inline-block border border-ink/40 px-3 py-0.5 text-[11px] font-bold tracking-wider uppercase mb-2.5">
            Tax Invoice / Cash Memo
          </div>
          <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-slate-800 leading-tight">
            {tenant ? tenant.name : "PharmaDesk Store"}
          </h2>
          {tenant?.address && (
            <p className="text-[11px] text-muted mt-1 leading-normal max-w-[320px] mx-auto">
              {tenant.address}
            </p>
          )}
          <div className="text-[11px] text-muted mt-1.5 flex flex-wrap justify-center gap-x-4 gap-y-1">
            {tenant?.phone && <span>Ph: {tenant.phone}</span>}
            {tenant?.gstNumber && <span className="font-semibold">GSTIN: {tenant.gstNumber}</span>}
            {tenant?.drugLicenseNumber && <span>D.L. No: {tenant.drugLicenseNumber}</span>}
          </div>
        </div>

        {/* Invoice Info / Customer Details */}
        <div className="grid grid-cols-2 gap-4 border-b border-line pb-4 mb-4 text-[12px]">
          <div className="flex flex-col gap-1">
            <div><span className="text-muted">Invoice No:</span> <span className="font-semibold text-teal">{bill.billNumber}</span></div>
            <div><span className="text-muted">Date & Time:</span> <span>{formatDate(date)}</span></div>
            <div><span className="text-muted">Status:</span> <span className={`font-semibold ${bill.paymentStatus === "Paid" ? "text-sage" : "text-brick"}`}>{bill.paymentStatus}</span></div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="font-semibold text-slate-700 uppercase tracking-wide text-[10px] text-muted">Billed To</div>
            <div className="font-semibold text-slate-800">{bill.customerName}</div>
            {bill.customerPhone && <div className="text-muted">Mob: {bill.customerPhone}</div>}
          </div>
        </div>

        {/* Medicines Table */}
        <table className="w-full text-left border-collapse mb-4">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wider text-muted font-bold">
              <th className="py-2 w-[40px]">S.No</th>
              <th className="py-2">Description</th>
              <th className="py-2 text-center w-[50px]">GST</th>
              <th className="py-2 text-center w-[50px]">Qty</th>
              <th className="py-2 text-right w-[80px]">Rate (₹)</th>
              <th className="py-2 text-right w-[90px]">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((i, idx) => {
              const basePrice = i.price;
              const lineTotal = i.price * i.qty * (1 + i.gst / 100);
              return (
                <tr key={idx} className="border-b border-line/40 text-[12px] align-top">
                  <td className="py-2 text-muted">{idx + 1}</td>
                  <td className="py-2 font-medium text-slate-800">{i.name}</td>
                  <td className="py-2 text-center font-mono">{i.gst}%</td>
                  <td className="py-2 text-center font-mono">{i.qty}</td>
                  <td className="py-2 text-right font-mono">₹{basePrice.toFixed(2)}</td>
                  <td className="py-2 text-right font-mono">₹{lineTotal.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Total Calculations with CGST/SGST breakdown */}
        <div className="flex justify-between gap-4 border-b border-line pb-4 mb-4">
          {/* Terms and Warning on Left */}
          <div className="text-[10px] text-muted/80 max-w-[240px] flex flex-col gap-1.5 leading-normal">
            <div>* Schedule H Drug Warning: To be sold by retail on the prescription of a Registered Medical Practitioner only.</div>
            <div>* Consult physician before administering medicines.</div>
            <div>* Thank you for your business!</div>
          </div>
          
          {/* Subtotal & CGST/SGST on Right */}
          <div className="flex-1 max-w-[220px] flex flex-col gap-1 text-[12px] text-slate-700 font-mono">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{bill.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-muted">
              <span>CGST (Avg):</span>
              <span>₹{(bill.gstTotal / 2).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-muted">
              <span>SGST (Avg):</span>
              <span>₹{(bill.gstTotal / 2).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-muted border-b border-line pb-1.5 mb-1">
              <span>Total Tax:</span>
              <span>₹{bill.gstTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-[15px] text-slate-900 pt-0.5">
              <span>Net Payable:</span>
              <span>₹{bill.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Invoice Footer Signature */}
        <div className="flex justify-between items-end pt-3 text-[11px] text-muted">
          <div>
            <div>Billed By: {bill.createdBy || "Admin"}</div>
            <div className="text-[9px] text-muted/70 mt-1">This is a computer generated invoice. No signature required.</div>
          </div>
          <div className="text-center w-[160px] border-t border-line pt-1 text-slate-600 font-semibold tracking-wide">
            Authorised Signatory
          </div>
        </div>
      </div>

      {/* Button Controls */}
      <div className="flex gap-3 mt-5 no-print">
        <Button onClick={() => window.print()}>Print Invoice</Button>
        <Button variant="ghost" onClick={onNewBill}>Start new bill</Button>
      </div>
    </div>
  );
}
