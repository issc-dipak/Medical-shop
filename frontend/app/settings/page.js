"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { Button, Field, inputClass } from "@/components/Bits";
import { getTenantSettings, updateTenantSettings, updateAdminPassword, getSession } from "@/lib/api";

export default function SettingsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  
  // Store Settings state
  const [tenant, setTenant] = useState({
    name: "",
    phone: "",
    address: "",
    gstNumber: "",
    drugLicenseNumber: ""
  });
  
  // Security/Password state
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    const s = getSession();
    if (s) {
      if (s.role !== "Admin") {
        router.replace("/dashboard");
      } else {
        setCurrentUser(s);
        fetchSettings();
      }
    } else {
      router.replace("/login");
    }
  }, [router]);

  async function fetchSettings() {
    try {
      const data = await getTenantSettings();
      setTenant({
        name: data.name || "",
        phone: data.phone || "",
        address: data.address || "",
        gstNumber: data.gstNumber || "",
        drugLicenseNumber: data.drugLicenseNumber || ""
      });
    } catch (err) {
      setError(err.message || "Failed to load settings.");
    } finally {
      setLoading(false);
    }
  }

  function handleTenantChange(field, value) {
    setTenant((prev) => ({ ...prev, [field]: value }));
  }

  function handleSecurityChange(field, value) {
    setSecurity((prev) => ({ ...prev, [field]: value }));
  }

  async function handleTenantSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!tenant.name) {
      setError("Store name is required.");
      return;
    }

    try {
      const res = await updateTenantSettings(tenant);
      setSuccess(res.message || "Store settings updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to update store settings.");
    }
  }

  async function handleSecuritySubmit(e) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!security.currentPassword || !security.newPassword) {
      setPasswordError("All password fields are required.");
      return;
    }

    if (security.newPassword !== security.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      const res = await updateAdminPassword({
        currentPassword: security.currentPassword,
        newPassword: security.newPassword
      });
      setPasswordSuccess(res.message || "Password updated successfully.");
      setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordError(err.message || "Failed to update password.");
    }
  }

  if (loading) {
    return (
      <AppShell eyebrow="Admin Dashboard" title="Settings">
        <div className="flex justify-center items-center py-20">
          <p className="text-muted text-sm font-medium animate-pulse">Loading settings...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell eyebrow="Admin Dashboard" title="System Settings">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Store Profile Section */}
        <div className="glass-panel rounded-md p-6 shadow-card">
          <h2 className="font-display text-lg font-bold text-ink mb-1">Pharmacy Profile</h2>
          <p className="text-[13px] text-muted mb-5">
            Configure identity and legal compliance details shown on your invoices.
          </p>

          {error && <p className="text-brick text-sm mb-4 font-medium">{error}</p>}
          {success && <p className="text-sage text-sm mb-4 font-medium">{success}</p>}

          <form onSubmit={handleTenantSubmit} className="flex flex-col gap-4">
            <Field label="Pharmacy / Store Name *">
              <input
                className={inputClass}
                value={tenant.name}
                onChange={(e) => handleTenantChange("name", e.target.value)}
                placeholder="e.g. Shirpur Medical Store"
                required
              />
            </Field>

            <Field label="Contact Phone">
              <input
                className={inputClass}
                value={tenant.phone}
                onChange={(e) => handleTenantChange("phone", e.target.value)}
                placeholder="e.g. 9876543210"
              />
            </Field>

            <Field label="Physical Store Address">
              <textarea
                className={`${inputClass} min-h-[80px] resize-y py-2.5`}
                value={tenant.address}
                onChange={(e) => handleTenantChange("address", e.target.value)}
                placeholder="e.g. Shirpur City, Landmark Area"
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="GSTIN Number">
                <input
                  className={inputClass}
                  value={tenant.gstNumber}
                  onChange={(e) => handleTenantChange("gstNumber", e.target.value)}
                  placeholder="e.g. 27AAAAA1111A1Z1"
                />
              </Field>

              <Field label="Drug License Number">
                <input
                  className={inputClass}
                  value={tenant.drugLicenseNumber}
                  onChange={(e) => handleTenantChange("drugLicenseNumber", e.target.value)}
                  placeholder="e.g. DL-12345/MH"
                />
              </Field>
            </div>

            <Button type="submit" className="w-full mt-4">
              Save Profile Changes
            </Button>
          </form>
        </div>

        {/* Password and Security Section */}
        <div className="glass-panel rounded-md p-6 shadow-card">
          <h2 className="font-display text-lg font-bold text-ink mb-1">Security & Password</h2>
          <p className="text-[13px] text-muted mb-5">
            Change your administrator account login password regularly to protect store records.
          </p>

          {passwordError && <p className="text-brick text-sm mb-4 font-medium">{passwordError}</p>}
          {passwordSuccess && <p className="text-sage text-sm mb-4 font-medium">{passwordSuccess}</p>}

          <form onSubmit={handleSecuritySubmit} className="flex flex-col gap-4">
            <Field label="Current Password">
              <input
                type="password"
                className={inputClass}
                value={security.currentPassword}
                onChange={(e) => handleSecurityChange("currentPassword", e.target.value)}
                placeholder="Enter current password"
                required
              />
            </Field>

            <Field label="New Password">
              <input
                type="password"
                className={inputClass}
                value={security.newPassword}
                onChange={(e) => handleSecurityChange("newPassword", e.target.value)}
                placeholder="Enter new password"
                required
              />
            </Field>

            <Field label="Confirm New Password">
              <input
                type="password"
                className={inputClass}
                value={security.confirmPassword}
                onChange={(e) => handleSecurityChange("confirmPassword", e.target.value)}
                placeholder="Re-enter new password"
                required
              />
            </Field>

            <Button type="submit" className="w-full mt-4">
              Update Password
            </Button>
          </form>
        </div>

      </div>
    </AppShell>
  );
}
