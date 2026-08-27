"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { Badge } from "@/components/Bits";
import { getBills, getLowStock, getExpiring, daysUntil, getSession } from "@/lib/api";

export default function ReportsPage() {
  const [bills, setBills] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setSession(getSession());
    Promise.all([getBills(), getLowStock(), getExpiring()])
      .then(([b, l, e]) => {
        setBills(b);
        setLowStock(l);
        setExpiring(e);
      })
      .catch((err) => setError(err.message));
  }, []);

  const totalRevenue = bills.reduce((s, b) => s + b.grandTotal, 0);
  const isAdmin = session?.role === "Admin";

  return (
    <AppShell eyebrow="Report module" title={isAdmin ? "Sales, stock & expiry reports" : "Stock alerts & sales history"}>
      {error && <p className="text-brick text-sm mb-4">{error}</p>}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-semibold">{isAdmin ? "Sales report" : "Your counter sales history"}</h2>
          <span className="font-mono text-sm text-muted">
            {bills.length} bills · ₹{totalRevenue.toFixed(2)} total
          </span>
        </div>
        <div className="glass-panel rounded-md overflow-hidden overflow-x-auto shadow-card">
          <table className="ledger-table">
            <thead>
              <tr><th>Bill</th><th>Date</th><th>Customer</th><th>Items</th><th>Total</th></tr>
            </thead>
            <tbody>
              {bills.map((b) => (
                <tr key={b._id}>
                  <td className="font-mono text-[13px]">{b.billNumber}</td>
                  <td className="font-mono text-[13px]">{new Date(b.createdAt).toLocaleDateString()}</td>
                  <td>{b.customerName}</td>
                  <td className="text-[13px] text-muted">{b.items.length} item(s)</td>
                  <td className="font-mono">₹{b.grandTotal.toFixed(2)}</td>
                </tr>
              ))}
              {bills.length === 0 && (
                <tr><td colSpan={5} className="text-center text-muted py-8">No bills generated yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section>
          <h2 className="font-display text-lg font-semibold mb-3">Low stock alert</h2>
          <div className="glass-panel rounded-md overflow-hidden overflow-x-auto shadow-card">
            <table className="ledger-table">
              <thead><tr><th>Medicine</th><th>Stock</th></tr></thead>
              <tbody>
                {lowStock.map((m) => (
                  <tr key={m._id}>
                    <td>{m.name}</td>
                    <td><Badge tone="brick">{m.quantity} {m.unit}s</Badge></td>
                  </tr>
                ))}
                {lowStock.length === 0 && (
                  <tr><td colSpan={2} className="text-center text-muted py-6">All stocked up.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold mb-3">Expiry report</h2>
          <div className="glass-panel rounded-md overflow-hidden overflow-x-auto shadow-card">
            <table className="ledger-table">
              <thead><tr><th>Medicine</th><th>Batch</th><th>Status</th></tr></thead>
              <tbody>
                {expiring.map((m) => {
                  const d = daysUntil(m.expiry);
                  return (
                    <tr key={m._id}>
                      <td>{m.name}</td>
                      <td className="font-mono text-[13px]">{m.batch}</td>
                      <td><Badge tone={d <= 15 ? "brick" : "amber"}>{d <= 0 ? "Expired" : `${d}d left`}</Badge></td>
                    </tr>
                  );
                })}
                {expiring.length === 0 && (
                  <tr><td colSpan={3} className="text-center text-muted py-6">Nothing expiring soon.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
