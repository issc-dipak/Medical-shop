"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { Button, Field, inputClass } from "@/components/Bits";
import { getStaff, createStaff, deleteStaff, getSession } from "@/lib/api";

const EMPTY_FORM = { name: "", email: "", mobile: "", password: "" };

export default function StaffPage() {
  const router = useRouter();
  const [staffList, setStaffList] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  async function fetchStaff() {
    try {
      const data = await getStaff();
      setStaffList(data);
    } catch (err) {
      setError(err.message || "Failed to load staff list.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const s = getSession();
    if (s) {
      if (s.role !== "Admin") {
        router.replace("/dashboard");
      } else {
        setCurrentUser(s);
        fetchStaff();
      }
    } else {
      router.replace("/login");
    }
  }, [router]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name || !form.email || !form.password) {
      setError("Name, email, and password are required.");
      return;
    }

    try {
      await createStaff({
        name: form.name.trim(),
        email: form.email.toLowerCase().trim(),
        mobile: form.mobile.trim(),
        password: form.password,
      });
      setSuccess(`Staff member "${form.name}" added successfully!`);
      setForm(EMPTY_FORM);
      await fetchStaff();
    } catch (err) {
      setError(err.message || "Failed to add staff member.");
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Are you sure you want to delete staff member "${name}"?`)) return;
    setError("");
    setSuccess("");
    try {
      await deleteStaff(id);
      setSuccess(`Staff member "${name}" deleted.`);
      await fetchStaff();
    } catch (err) {
      setError(err.message || "Failed to delete staff member.");
    }
  }

  return (
    <AppShell eyebrow="Admin Settings" title="Manage Staff Accounts">
      {error && <p className="text-brick text-sm mb-4">{error}</p>}
      {success && <p className="text-teal text-sm mb-4 font-medium">{success}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 items-start">
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="glass-panel rounded-md p-5 flex flex-col gap-3 sticky top-9 shadow-card">
          <h2 className="font-display text-lg font-semibold mb-1">Add Staff Account</h2>
          
          <Field label="Full Name *">
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g. Rahul Kumar"
              required
            />
          </Field>

          <Field label="Email Address *">
            <input
              type="email"
              className={inputClass}
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="rahul@example.com"
              required
            />
          </Field>

          <Field label="Mobile Number">
            <input
              type="tel"
              className={inputClass}
              value={form.mobile}
              onChange={(e) => handleChange("mobile", e.target.value)}
              placeholder="9876543222"
            />
          </Field>

          <Field label="Password *">
            <input
              type="password"
              className={inputClass}
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder="••••••••"
              required
            />
          </Field>

          <Button type="submit" className="w-full mt-2">
            Add Staff Member
          </Button>
        </form>

        {/* List Column */}
        <div>
          <div className="glass-panel rounded-md overflow-hidden overflow-x-auto shadow-card">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Role</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-8">
                      Loading staff accounts…
                    </td>
                  </tr>
                )}
                {!loading && staffList.map((member) => (
                  <tr key={member._id}>
                    <td>
                      <div className="font-medium">{member.name}</div>
                      {member._id === currentUser?.id && (
                        <div className="text-[10px] text-teal font-semibold font-mono uppercase mt-0.5">Logged In (You)</div>
                      )}
                    </td>
                    <td className="font-mono text-[13px]">{member.email}</td>
                    <td className="font-mono text-[13px]">{member.mobile || "—"}</td>
                    <td>
                      <span className={`inline-block px-2 py-0.5 text-[11px] font-bold rounded-sm ${
                        member.role === "Admin" ? "bg-teal-light text-teal font-semibold" : "bg-paper border border-line text-muted"
                      }`}>
                        {member.role}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2 justify-end">
                        {member._id !== currentUser?.id ? (
                          <button
                            className="text-[13px] text-brick font-medium hover:underline"
                            onClick={() => handleDelete(member._id, member.name)}
                          >
                            Delete
                          </button>
                        ) : (
                          <span className="text-[13px] text-muted italic">Owner</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && staffList.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-8">
                      No staff accounts found.
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
