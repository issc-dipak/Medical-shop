"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { Badge } from "@/components/Bits";
import { getSummary, getLowStock, getExpiring, daysUntil, getSession, getTenantSettings } from "@/lib/api";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setSession(getSession());
    Promise.all([getSummary(), getLowStock(), getExpiring(), getTenantSettings()])
      .then(([summary, lowStock, expiring, tenant]) => setData({ summary, lowStock, expiring, tenant }))
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <AppShell eyebrow="Overview" title="Dashboard">
        <div className="p-4 bg-brick-light border border-brick/20 rounded-xl text-brick text-sm font-medium">
          Could not load dashboard: {error}
        </div>
      </AppShell>
    );
  }

  if (!data) {
    return (
      <AppShell>
        <div className="space-y-6 animate-pulse">
          <div className="h-10 bg-line w-1/4 rounded-md" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-28 bg-line rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-64 bg-line rounded-xl lg:col-span-2" />
            <div className="h-64 bg-line rounded-xl" />
          </div>
        </div>
      </AppShell>
    );
  }

  const { summary, lowStock, expiring, tenant } = data;
  const isAdmin = session?.role === "Admin";

  return (
    <AppShell>
      {/* Interactive Screen View */}
      <div className="print:hidden">
        {/* Dashboard Sub-Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-ink tracking-tight bg-gradient-to-r from-ink to-muted bg-clip-text text-transparent">
              {isAdmin ? "Shop Admin Dashboard" : "Staff Dashboard"}
            </h1>
            <p className="text-[13px] text-muted mt-1 font-medium">
              An overview of your pharmacy's sales, stock levels, and counter operations today.
            </p>
          </div>
          <div className="flex items-center gap-3.5 shrink-0 no-print">
            {/* Export Report */}
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 text-xs font-bold text-teal bg-teal-light hover:bg-teal/15 px-3.5 py-2.5 rounded-lg border border-teal/20 transition-all cursor-pointer shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Financial KPIs */}
        {isAdmin && (
          <div className="mb-8">
            <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-4">Financial Metrics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
              
              {/* Today's Sales */}
              <div className="bg-panel border border-line rounded-xl p-5 shadow-sm hover:shadow-card hover:-translate-y-1 transition-all duration-200 relative overflow-hidden group">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-start">
                  <span className="text-[12px] font-semibold text-muted">Today's Sales</span>
                  <span className="p-2 rounded-lg bg-teal-light text-teal group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                    </svg>
                  </span>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-extrabold text-ink tracking-tight">₹{summary.todaySales.total.toFixed(2)}</div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[10px] font-bold text-sage bg-sage-light px-1.5 py-0.5 rounded">+4.2%</span>
                    <span className="text-[11px] text-muted font-mono leading-none">{summary.todaySales.count} bills today</span>
                  </div>
                </div>
              </div>

              {/* Total Sales */}
              <div className="bg-panel border border-line rounded-xl p-5 shadow-sm hover:shadow-card hover:-translate-y-1 transition-all duration-200 relative overflow-hidden group">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-start">
                  <span className="text-[12px] font-semibold text-muted">Total Sales</span>
                  <span className="p-2 rounded-lg bg-teal-light text-teal group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-extrabold text-ink tracking-tight">₹{summary.totalSales.toFixed(2)}</div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[10px] font-bold text-teal bg-teal-light px-1.5 py-0.5 rounded">All-time</span>
                    <span className="text-[11px] text-muted leading-none">Gross sales volume</span>
                  </div>
                </div>
              </div>

              {/* Total Purchases */}
              <div className="bg-panel border border-line rounded-xl p-5 shadow-sm hover:shadow-card hover:-translate-y-1 transition-all duration-200 relative overflow-hidden group">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber to-amber-dark opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-start">
                  <span className="text-[12px] font-semibold text-muted">Total Purchases</span>
                  <span className="p-2 rounded-lg bg-amber-light text-warning group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                    </svg>
                  </span>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-extrabold text-ink tracking-tight">₹{summary.totalPurchases.toFixed(2)}</div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[10px] font-bold text-warning bg-amber-light px-1.5 py-0.5 rounded">Stock cost</span>
                    <span className="text-[11px] text-muted leading-none">Inventory asset value</span>
                  </div>
                </div>
              </div>

              {/* Profit / Loss */}
              <div className="bg-panel border border-line rounded-xl p-5 shadow-sm hover:shadow-card hover:-translate-y-1 transition-all duration-200 relative overflow-hidden group">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sage to-sage-dark opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-start">
                  <span className="text-[12px] font-semibold text-muted">Profit / Loss</span>
                  <span className={`p-2 rounded-lg ${summary.profitOrLoss >= 0 ? "bg-sage-light text-sage" : "bg-brick-light text-brick"} group-hover:scale-110 transition-transform`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </span>
                </div>
                <div className="mt-4">
                  <div className={`text-2xl font-extrabold tracking-tight ${summary.profitOrLoss >= 0 ? "text-sage" : "text-brick"}`}>
                    ₹{summary.profitOrLoss.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${summary.profitOrLoss >= 0 ? "bg-sage-light text-sage" : "bg-brick-light text-brick"}`}>
                      {summary.profitOrLoss >= 0 ? "Profit" : "Loss"}
                    </span>
                    <span className="text-[11px] text-muted leading-none">Net profit yield</span>
                  </div>
                </div>
              </div>

              {/* Pending Payments */}
              <div className="bg-panel border border-line rounded-xl p-5 shadow-sm hover:shadow-card hover:-translate-y-1 transition-all duration-200 relative overflow-hidden group">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brick to-brick-dark opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-start">
                  <span className="text-[12px] font-semibold text-muted">Pending Payments</span>
                  <span className="p-2 rounded-lg bg-brick-light text-brick group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                  </span>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-extrabold text-ink tracking-tight">₹{summary.pendingPayments.toFixed(2)}</div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[10px] font-bold text-brick bg-brick-light px-1.5 py-0.5 rounded">Credit</span>
                    <span className="text-[11px] text-muted leading-none">Outstanding bills</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Store Operations */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-4">Store Operations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <div className="bg-panel border border-line rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-card hover:-translate-y-1 transition-all duration-200 group">
              <span className="p-3 rounded-xl bg-teal-light text-teal group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z"/>
                </svg>
              </span>
              <div>
                <div className="text-[11px] font-bold text-muted uppercase tracking-wider">Total Medicines</div>
                <div className="text-xl font-black text-ink mt-1">{summary.medicineCount}</div>
              </div>
            </div>

            <div className="bg-panel border border-line rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-card hover:-translate-y-1 transition-all duration-200 group">
              <span className="p-3 rounded-xl bg-accent-light text-accent group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </span>
              <div>
                <div className="text-[11px] font-bold text-muted uppercase tracking-wider">Total Customers</div>
                <div className="text-xl font-black text-ink mt-1">{summary.totalCustomers || 0}</div>
              </div>
            </div>

            <div className="bg-panel border border-line rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-card hover:-translate-y-1 transition-all duration-200 group">
              <span className="p-3 rounded-xl bg-brick-light text-brick group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </span>
              <div>
                <div className="text-[11px] font-bold text-muted uppercase tracking-wider">Low Stock Alerts</div>
                <div className="text-xl font-black text-ink mt-1">{summary.lowStockCount}</div>
              </div>
            </div>

            <div className="bg-panel border border-line rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-card hover:-translate-y-1 transition-all duration-200 group">
              <span className="p-3 rounded-xl bg-amber-light text-warning group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </span>
              <div>
                <div className="text-[11px] font-bold text-muted uppercase tracking-wider">Expiring in 30 Days</div>
                <div className="text-xl font-black text-ink mt-1">{summary.expiringCount}</div>
              </div>
            </div>

          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Sales Overview Sparkline Chart */}
          <section className="bg-panel border border-line rounded-xl p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-ink">Sales Overview</h2>
                <p className="text-[11px] text-muted font-medium mt-0.5">Counter sales performance over the past hours</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 bg-teal rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Live Revenue Stream</span>
              </div>
            </div>
            
            <div className="w-full pt-2">
              <svg viewBox="0 0 500 120" className="w-full h-36 text-teal overflow-visible">
                <defs>
                  <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="20" x2="500" y2="20" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="0" y1="60" x2="500" y2="60" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="#F1F5F9" strokeWidth="1" />
                
                <path d="M 0 95 Q 50 80, 100 85 T 200 55 T 300 70 T 400 45 T 500 35 L 500 120 L 0 120 Z" fill="url(#chartGlow)" />
                <path d="M 0 95 Q 50 80, 100 85 T 200 55 T 300 70 T 400 45 T 500 35" fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
                
                <circle cx="200" cy="55" r="5" fill="#2563EB" stroke="white" strokeWidth="2" className="cursor-pointer" />
                <circle cx="400" cy="45" r="5" fill="#2563EB" stroke="white" strokeWidth="2" className="cursor-pointer" />
              </svg>
            </div>
          </section>

          {/* Quick Actions Panel */}
          <section className="bg-panel border border-line rounded-xl p-6 shadow-sm flex flex-col">
            <h2 className="text-base font-bold text-ink mb-2">Quick Actions</h2>
            <p className="text-[11px] text-muted mb-5">Access essential features with a single click</p>
            <div className="grid grid-cols-2 gap-4 flex-1">
              <Link href="/billing" className="group flex flex-col items-center justify-center p-4 border border-line rounded-xl bg-paper hover:border-teal/30 hover:bg-teal-light/20 hover:shadow-sm transition-all text-center">
                <span className="p-3 rounded-lg bg-teal-light text-teal group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                  </svg>
                </span>
                <span className="text-[12px] font-bold text-ink mt-2.5">New Bill</span>
              </Link>
              
              <Link href="/medicines" className="group flex flex-col items-center justify-center p-4 border border-line rounded-xl bg-paper hover:border-teal/30 hover:bg-teal-light/20 hover:shadow-sm transition-all text-center">
                <span className="p-3 rounded-lg bg-teal-light text-teal group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                  </svg>
                </span>
                <span className="text-[12px] font-bold text-ink mt-2.5">Add Medicine</span>
              </Link>

              <Link href="/customers" className="group flex flex-col items-center justify-center p-4 border border-line rounded-xl bg-paper hover:border-teal/30 hover:bg-teal-light/20 hover:shadow-sm transition-all text-center">
                <span className="p-3 rounded-lg bg-teal-light text-teal group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </span>
                <span className="text-[12px] font-bold text-ink mt-2.5">Add Customer</span>
              </Link>

              <Link href="/reports" className="group flex flex-col items-center justify-center p-4 border border-line rounded-xl bg-paper hover:border-teal/30 hover:bg-teal-light/20 hover:shadow-sm transition-all text-center">
                <span className="p-3 rounded-lg bg-teal-light text-teal group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </span>
                <span className="text-[12px] font-bold text-ink mt-2.5">View Reports</span>
              </Link>
            </div>
          </section>
          
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Low Stock Medicine Table */}
          <section className="bg-panel border border-line rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-ink">Low Stock Medicines</h2>
                <p className="text-[11px] text-muted mt-0.5">Medicines requiring replenishment</p>
              </div>
              <Link href="/medicines" className="text-xs text-teal font-bold hover:underline flex items-center gap-1">
                <span>Manage Stock</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th className="text-[10px] py-3.5 px-4 bg-paper/50">Medicine Name</th>
                    <th className="text-[10px] py-3.5 px-4 bg-paper/50">Current Stock</th>
                    <th className="text-[10px] py-3.5 px-4 bg-paper/50">Status</th>
                    <th className="text-[10px] py-3.5 px-4 bg-paper/50 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.slice(0, 4).map((m) => (
                    <tr key={m._id} className="hover:bg-paper/30 transition-colors">
                      <td className="py-3 px-4 font-semibold text-xs text-ink">{m.name}</td>
                      <td className="py-3 px-4 font-mono text-xs text-muted">{m.quantity} {m.unit || "unit"}(s)</td>
                      <td className="py-3 px-4">
                        <Badge tone="brick">{m.quantity === 0 ? "Out of Stock" : "Low Stock"}</Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link href="/medicines" className="text-xs text-teal font-bold hover:underline">
                          Order
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {lowStock.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center text-xs text-muted py-8">All medicines are healthy in stock.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Expiry Watch Table */}
          <section className="bg-panel border border-line rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-ink">Expiry Alerts</h2>
                <p className="text-[11px] text-muted mt-0.5">Batches expiring in the next 30 days</p>
              </div>
              <Link href="/reports" className="text-xs text-teal font-bold hover:underline flex items-center gap-1">
                <span>Full Report</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th className="text-[10px] py-3.5 px-4 bg-paper/50">Medicine Name</th>
                    <th className="text-[10px] py-3.5 px-4 bg-paper/50">Batch No</th>
                    <th className="text-[10px] py-3.5 px-4 bg-paper/50">Days Left</th>
                    <th className="text-[10px] py-3.5 px-4 bg-paper/50 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {expiring.slice(0, 4).map((m) => {
                    const d = daysUntil(m.expiry);
                    let tone = "sage";
                    if (d <= 0) tone = "brick";
                    else if (d <= 15) tone = "brick";
                    else tone = "amber";

                    return (
                      <tr key={m._id} className="hover:bg-paper/30 transition-colors">
                        <td className="py-3 px-4 font-semibold text-xs text-ink">{m.name}</td>
                        <td className="py-3 px-4 font-mono text-xs text-muted">{m.batch || "N/A"}</td>
                        <td className="py-3 px-4 font-mono text-xs">{d <= 0 ? "Expired" : `${d} days`}</td>
                        <td className="py-3 px-4 text-right">
                          <Badge tone={tone}>{d <= 0 ? "Critical" : d <= 15 ? "Urgent" : "Watch"}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                  {expiring.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center text-xs text-muted py-8">No batches expiring soon.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      {/* Printable Proper Report Format */}
      <div className="hidden print:block text-slate-800 bg-white font-sans max-w-4xl mx-auto p-4">
        {/* Report Header */}
        <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">{tenant?.name || "Medical Store"}</h1>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Daily Operations & Compliance Report</p>
          <div className="grid grid-cols-2 text-left text-xs mt-4 gap-x-8 gap-y-1 text-slate-600 max-w-2xl mx-auto border-t border-slate-100 pt-3">
            <div><span className="font-bold text-slate-700">Address:</span> {tenant?.address || "N/A"}</div>
            <div><span className="font-bold text-slate-700">Phone:</span> {tenant?.phone || "N/A"}</div>
            <div><span className="font-bold text-slate-700">GSTIN:</span> {tenant?.gstNumber || "N/A"}</div>
            <div><span className="font-bold text-slate-700">Drug License:</span> {tenant?.drugLicenseNumber || "N/A"}</div>
            <div><span className="font-bold text-slate-700">Report Date:</span> {new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}</div>
            <div><span className="font-bold text-slate-700">Generated By:</span> {session?.name} ({session?.role})</div>
          </div>
        </div>

        {/* Financial KPI Summary Table */}
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2.5">I. Financial Overview</h2>
          <table className="w-full text-left text-xs border border-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300">
                <th className="p-2 border-r border-slate-300 font-bold">Metric Type</th>
                <th className="p-2 border-r border-slate-300 font-bold">Total / Count</th>
                <th className="p-2 font-bold">Status Remarks</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="p-2 border-r border-slate-300 font-medium">Today's Revenue</td>
                <td className="p-2 border-r border-slate-300 font-mono">₹{summary.todaySales.total.toFixed(2)}</td>
                <td className="p-2 text-slate-500">{summary.todaySales.count} transactions completed today</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2 border-r border-slate-300 font-medium">Gross Cumulative Sales</td>
                <td className="p-2 border-r border-slate-300 font-mono">₹{summary.totalSales.toFixed(2)}</td>
                <td className="p-2 text-slate-500">All-time sales volume</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2 border-r border-slate-300 font-medium">Net Profit / Loss</td>
                <td className="p-2 border-r border-slate-300 font-mono font-bold text-slate-900">₹{summary.profitOrLoss.toFixed(2)}</td>
                <td className="p-2 text-slate-500">{summary.profitOrLoss >= 0 ? "Net Profit" : "Net Loss"} based on batch cost yields</td>
              </tr>
              <tr>
                <td className="p-2 border-r border-slate-300 font-medium">Outstanding Receivables (Credit)</td>
                <td className="p-2 border-r border-slate-300 font-mono">₹{summary.pendingPayments.toFixed(2)}</td>
                <td className="p-2 text-slate-500">Pending payment invoices</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Low Stock Section */}
        <div className="mb-6 page-break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2.5">II. Low Stock replenishment alerts</h2>
          <table className="w-full text-left text-xs border border-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300">
                <th className="p-2 border-r border-slate-300 font-bold">Medicine Name</th>
                <th className="p-2 border-r border-slate-300 font-bold">Category</th>
                <th className="p-2 border-r border-slate-300 font-bold">Batch</th>
                <th className="p-2 font-bold text-right">Remaining Stock</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map((m) => (
                <tr key={m._id} className="border-b border-slate-200">
                  <td className="p-2 border-r border-slate-300 font-medium">{m.name}</td>
                  <td className="p-2 border-r border-slate-300">{m.category || "N/A"}</td>
                  <td className="p-2 border-r border-slate-300 font-mono">{m.batch || "N/A"}</td>
                  <td className="p-2 font-mono text-right">{m.quantity} {m.unit || "unit"}(s)</td>
                </tr>
              ))}
              {lowStock.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-slate-500">All medicines have sufficient stock levels.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Expiry Section */}
        <div className="mb-8 page-break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2.5">III. Critical Expiry Watchlist (30 Days)</h2>
          <table className="w-full text-left text-xs border border-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300">
                <th className="p-2 border-r border-slate-300 font-bold">Medicine Name</th>
                <th className="p-2 border-r border-slate-300 font-bold">Batch Number</th>
                <th className="p-2 border-r border-slate-300 font-bold">Expiry Date</th>
                <th className="p-2 font-bold text-right">Status / Days Left</th>
              </tr>
            </thead>
            <tbody>
              {expiring.map((m) => {
                const d = daysUntil(m.expiry);
                return (
                  <tr key={m._id} className="border-b border-slate-200">
                    <td className="p-2 border-r border-slate-300 font-medium">{m.name}</td>
                    <td className="p-2 border-r border-slate-300 font-mono">{m.batch || "N/A"}</td>
                    <td className="p-2 border-r border-slate-300 font-mono">{new Date(m.expiry).toLocaleDateString()}</td>
                    <td className="p-2 text-right font-semibold font-mono">{d <= 0 ? "EXPIRED" : `${d} days left`}</td>
                  </tr>
                );
              })}
              {expiring.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-slate-500">No batches expiring in the next 30 days.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 text-center text-xs mt-12 pt-8 border-t border-slate-200 page-break-inside-avoid">
          <div>
            <div className="w-48 mx-auto border-b border-slate-400 pb-1 font-semibold text-slate-400">Signature Verification</div>
            <p className="text-slate-500 mt-2 font-semibold uppercase tracking-wider text-[10px]">Authorized Store Admin</p>
          </div>
          <div>
            <div className="w-48 mx-auto border-b border-slate-400 pb-1 font-semibold text-slate-400">Signature Verification</div>
            <p className="text-slate-500 mt-2 font-semibold uppercase tracking-wider text-[10px]">System Administrator</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
