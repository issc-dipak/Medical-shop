"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { Field, inputClass, Button } from "@/components/Bits";
import { getCustomers, createCustomer, getCustomerHistory } from "@/lib/api";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [error, setError] = useState("");

  function refresh() {
    getCustomers().then(setCustomers).catch((err) => setError(err.message));
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    try {
      await createCustomer(form);
      setForm({ name: "", phone: "", address: "" });
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSelect(c) {
    setSelected(c);
    try {
      const bills = await getCustomerHistory(c.phone);
      setHistory(bills);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AppShell eyebrow="Customer module" title="Customers & purchase history">
      {error && <p className="text-brick text-sm mb-4">{error}</p>}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_1fr] gap-6 items-start">
        <form onSubmit={handleSubmit} className="glass-panel rounded-md p-5 flex flex-col gap-3 shadow-card">
          <h2 className="font-display text-lg font-semibold mb-1">Add customer</h2>
          <Field label="Name">
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <Field label="Phone">
            <input className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </Field>
          <Field label="Address">
            <input className={inputClass} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </Field>
          <Button type="submit" className="mt-1">Save customer</Button>
        </form>

        <div className="glass-panel rounded-md overflow-hidden overflow-x-auto shadow-card">
          <table className="ledger-table">
            <thead>
              <tr><th>Name</th><th>Phone</th></tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c._id} className="cursor-pointer" onClick={() => handleSelect(c)}>
                  <td className={selected?._id === c._id ? "font-semibold text-teal" : ""}>{c.name}</td>
                  <td className="font-mono text-[13px]">{c.phone}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={2} className="text-center text-muted py-8">No customers yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="glass-panel rounded-md p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold mb-3">
            {selected ? `Purchase history — ${selected.name}` : "Select a customer"}
          </h2>
          {selected && history.length === 0 && (
            <p className="text-[13px] text-muted">No purchases recorded yet.</p>
          )}
          <ul className="flex flex-col gap-3">
            {history.map((b) => (
              <li key={b._id} className="border-b border-line pb-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-mono text-[12px] text-muted">{b.billNumber} · {new Date(b.createdAt).toLocaleDateString()}</span>
                  <span className="font-mono font-medium">₹{b.grandTotal.toFixed(2)}</span>
                </div>
                <div className="text-[12px] text-muted mt-0.5">
                  {b.items.map((i) => i.name).join(", ")}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
