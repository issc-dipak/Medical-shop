"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { Button, Field, inputClass, Badge } from "@/components/Bits";
import {
  getMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  daysUntil,
  getSession,
} from "@/lib/api";

const EMPTY = { name: "", category: "", batch: "", quantity: "", unit: "Strip", price: "", purchasePrice: "", gst: "12", expiry: "" };

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [session, setSession] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const data = await getMedicines();
      setMedicines(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setSession(getSession());
    refresh();
  }, []);

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.quantity || !form.price || !form.expiry) return;

    const payload = {
      name: form.name,
      category: form.category || "General",
      batch: form.batch || "—",
      quantity: Number(form.quantity),
      unit: form.unit,
      price: Number(form.price),
      purchasePrice: Number(form.purchasePrice || 0),
      gst: Number(form.gst),
      expiry: form.expiry,
    };

    try {
      if (editingId) {
        await updateMedicine(editingId, payload);
      } else {
        await createMedicine(payload);
      }
      await refresh();
      setForm(EMPTY);
      setEditingId(null);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  function handleEdit(m) {
    setEditingId(m._id);
    setForm({
      name: m.name,
      category: m.category,
      batch: m.batch,
      quantity: String(m.quantity),
      unit: m.unit,
      price: String(m.price),
      purchasePrice: String(m.purchasePrice || 0),
      gst: String(m.gst),
      expiry: m.expiry.slice(0, 10),
    });
  }

  async function handleDelete(id) {
    if (editingId === id) {
      setEditingId(null);
      setForm(EMPTY);
    }
    try {
      await deleteMedicine(id);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleCancel() {
    setEditingId(null);
    setForm(EMPTY);
  }

  const filtered = medicines.filter((m) =>
    `${m.name} ${m.category} ${m.batch}`.toLowerCase().includes(query.toLowerCase())
  );

  const isAdmin = session?.role === "Admin";

  return (
    <AppShell eyebrow={isAdmin ? "Admin module" : "Stock View"} title="Medicines & stock">
      {error && <p className="text-brick text-sm mb-4">{error}</p>}
      <div className={isAdmin ? "grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 items-start" : "w-full"}>
        {isAdmin && (
          <form onSubmit={handleSubmit} className="glass-panel rounded-xl p-6 flex flex-col gap-3.5 sticky top-9 shadow-lg border border-white/60 bg-white/95">
            <h2 className="font-display text-lg font-bold mb-1 text-slate-800 border-b border-line pb-1.5">
              {editingId ? "Edit medicine" : "Add medicine"}
            </h2>

            <Field label="Name">
              <input className={inputClass} value={form.name} onChange={(e) => handleChange("name", e.target.value)} required />
            </Field>
            <Field label="Category">
              <input className={inputClass} value={form.category} onChange={(e) => handleChange("category", e.target.value)} placeholder="Analgesic, Antibiotic…" />
            </Field>
            <Field label="Batch number">
              <input className={inputClass} value={form.batch} onChange={(e) => handleChange("batch", e.target.value)} placeholder="e.g. PCM-22A" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Quantity">
                <input type="number" min="0" className={inputClass} value={form.quantity} onChange={(e) => handleChange("quantity", e.target.value)} required />
              </Field>
              <Field label="Unit">
                <select className={inputClass} value={form.unit} onChange={(e) => handleChange("unit", e.target.value)}>
                  <option>Strip</option>
                  <option>Bottle</option>
                  <option>Sachet</option>
                  <option>Box</option>
                  <option>Tube</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Purchase (₹)">
                <input type="number" min="0" step="0.01" className={inputClass} value={form.purchasePrice} onChange={(e) => handleChange("purchasePrice", e.target.value)} required />
              </Field>
              <Field label="Selling (₹)">
                <input type="number" min="0" step="0.01" className={inputClass} value={form.price} onChange={(e) => handleChange("price", e.target.value)} required />
              </Field>
            </div>
            <Field label="GST %">
              <select className={inputClass} value={form.gst} onChange={(e) => handleChange("gst", e.target.value)}>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
              </select>
            </Field>
            <Field label="Expiry date">
              <input type="date" className={inputClass} value={form.expiry} onChange={(e) => handleChange("expiry", e.target.value)} required />
            </Field>

            <div className="flex gap-2 mt-2">
              <Button type="submit" className="flex-1">
                {editingId ? "Save changes" : "Add medicine"}
              </Button>
              {editingId && (
                <Button type="button" variant="ghost" onClick={handleCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        )}

        <div>
          <input
            className={`${inputClass} w-full mb-4`}
            placeholder="Search by name, category, or batch…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <div className="glass-panel rounded-md overflow-hidden overflow-x-auto shadow-card">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Batch</th>
                  <th>Stock</th>
                  <th>Price</th>
                  <th>Expiry</th>
                  {isAdmin && <th></th>}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={isAdmin ? 6 : 5} className="text-center text-muted py-8">Loading…</td></tr>
                )}
                {!loading && filtered.map((m) => {
                  const d = daysUntil(m.expiry);
                  return (
                    <tr key={m._id}>
                      <td>
                        <div className="font-medium">{m.name}</div>
                        <div className="text-[12px] text-muted">{m.category}</div>
                      </td>
                      <td className="font-mono text-[13px]">{m.batch}</td>
                      <td>
                        {m.quantity} {m.unit}s{" "}
                        {m.quantity <= 10 && <Badge tone="brick">Low</Badge>}
                      </td>
                      <td className="font-mono">₹{m.price.toFixed(2)}</td>
                      <td>
                        <div className="font-mono text-[13px]">{m.expiry.slice(0, 10)}</div>
                        {d <= 30 && <Badge tone={d <= 15 ? "brick" : "amber"}>{d <= 0 ? "Expired" : `${d}d`}</Badge>}
                      </td>
                      {isAdmin && (
                        <td>
                          <div className="flex gap-2 justify-end">
                            <button className="text-[13px] text-teal font-medium hover:underline" onClick={() => handleEdit(m)}>
                              Edit
                            </button>
                            <button className="text-[13px] text-brick font-medium hover:underline" onClick={() => handleDelete(m._id)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-8">
                      No medicines match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
