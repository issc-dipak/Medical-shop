// Talks to the Node.js/Express + MongoDB backend (see /medshop-backend).
// Replaces the old localStorage-based lib/storage.js.

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const SESSION_KEY = "medledger_session"; // stores { token, user }

// ---------- Session (token stored client-side, data lives in MongoDB) ----------
export function getSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setSession(session) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function logout() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}

// ---------- Core fetch wrapper ----------
async function apiFetch(path, options = {}) {
  const session = getSession();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (session?.token) headers.Authorization = `Bearer ${session.token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    logout();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Session expired. Please sign in again.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

// ---------- Auth ----------
export async function login(username, password) {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  const session = { token: data.token, ...data.user };
  setSession(session);
  return session;
}

export async function register({ shopName, ownerName, email, mobile, address, gstNumber, drugLicenseNumber, password }) {
  const data = await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ shopName, ownerName, email, mobile, address, gstNumber, drugLicenseNumber, password }),
  });
  const session = { token: data.token, ...data.user };
  setSession(session);
  return session;
}

// ---------- Medicines ----------
export function getMedicines(search = "") {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiFetch(`/medicines${qs}`);
}

export function createMedicine(payload) {
  return apiFetch("/medicines", { method: "POST", body: JSON.stringify(payload) });
}

export function updateMedicine(id, payload) {
  return apiFetch(`/medicines/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function deleteMedicine(id) {
  return apiFetch(`/medicines/${id}`, { method: "DELETE" });
}

// ---------- Customers ----------
export function getCustomers() {
  return apiFetch("/customers");
}

export function createCustomer(payload) {
  return apiFetch("/customers", { method: "POST", body: JSON.stringify(payload) });
}

export function getCustomerHistory(phone) {
  return apiFetch(`/customers/${encodeURIComponent(phone)}/history`);
}

// ---------- Bills ----------
export function getBills() {
  return apiFetch("/bills");
}

export function createBill(payload) {
  return apiFetch("/bills", { method: "POST", body: JSON.stringify(payload) });
}

export function updateBillStatus(id, paymentStatus) {
  return apiFetch(`/bills/${id}/status`, { method: "PATCH", body: JSON.stringify({ paymentStatus }) });
}

// ---------- Reports ----------
export function getSummary() {
  return apiFetch("/reports/summary");
}

export function getLowStock(threshold = 10) {
  return apiFetch(`/reports/low-stock?threshold=${threshold}`);
}

export function getExpiring(days = 30) {
  return apiFetch(`/reports/expiring?days=${days}`);
}

export function getSales(date) {
  const qs = date ? `?date=${date}` : "";
  return apiFetch(`/reports/sales${qs}`);
}

// ---------- Staff (Admin settings) ----------
export function getStaff() {
  return apiFetch("/auth/staff");
}

export function createStaff(payload) {
  return apiFetch("/auth/staff", { method: "POST", body: JSON.stringify(payload) });
}

export function deleteStaff(id) {
  return apiFetch(`/auth/staff/${id}`, { method: "DELETE" });
}

// ---------- Tenant Settings & Security ----------
export function getTenantSettings() {
  return apiFetch("/tenant/settings");
}

export function updateTenantSettings(payload) {
  return apiFetch("/tenant/settings", { method: "PUT", body: JSON.stringify(payload) });
}

export function updateAdminPassword(payload) {
  return apiFetch("/tenant/password", { method: "PUT", body: JSON.stringify(payload) });
}

// ---------- Small helpers used across pages ----------
export function daysUntil(dateStr) {
  const diff = new Date(dateStr).getTime() - new Date().setHours(0, 0, 0, 0);
  return Math.round(diff / (1000 * 60 * 60 * 24));
}
