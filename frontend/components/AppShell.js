"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getSession, getMedicines, daysUntil, logout } from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import { Badge } from "@/components/Bits";

export default function AppShell({ children, title, eyebrow }) {
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/login");
  }
  const [session, setSession] = useState(undefined);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search and Modal states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedMed, setSelectedMed] = useState(null);

  const searchRef = useRef(null);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/login");
    } else {
      setSession(s);
    }
  }, [router]);

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch search results on query change
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const meds = await getMedicines(searchQuery);
        setSearchResults(meds);
        setShowDropdown(true);
      } catch (err) {
        console.error("Search failed:", err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  if (session === undefined) {
    return <div className="min-h-screen bg-[#0B0F19]" />;
  }
  if (session === null) {
    return null;
  }

  const isAdmin = session?.role === "Admin";

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-paper">
      {/* Mobile Sticky Header */}
      <div className="md:hidden flex items-center justify-between bg-panel border-b border-line px-5 py-4 sticky top-0 z-30 no-print">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-teal to-accent p-1.5 rounded-md shadow-glow">
            <svg width="16" height="16" viewBox="0 0 30 30" aria-hidden="true">
              <rect x="12" y="3" width="6" height="24" fill="#0B0F19" />
              <rect x="3" y="12" width="24" height="6" fill="#0B0F19" />
            </svg>
          </div>
          <span className="font-display font-bold text-lg text-ink">PharmaDesk</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-ink focus:outline-none p-1 cursor-pointer"
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {sidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Backdrop overlay for mobile menu drawer */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar session={session} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 md:ml-[240px] px-4 py-6 md:px-10 md:py-9 w-full animate-fade-in-up">
        {/* Top Header */}
        <div className="hidden md:flex items-center justify-between border-b border-line pb-5 mb-8 no-print">
          <div>
            <h4 className="text-[12px] text-muted font-bold uppercase tracking-wider leading-none">Welcome Back</h4>
            <h2 className="text-xl font-bold text-ink mt-1.5">Good Morning, {session?.name?.split(" ")[0] || "Dipak"}</h2>
          </div>
          <div className="flex items-center gap-4">

            {/* Global Search */}
            <div ref={searchRef} className="relative w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length >= 2 && setShowDropdown(true)}
                placeholder="Search medicines..."
                className="w-full pl-9 pr-4 py-1.5 bg-white border border-line rounded-lg text-[13px] text-ink placeholder:text-muted/40 focus:border-accent focus:ring-2 focus:ring-accent/15 outline-none transition-all shadow-sm"
              />

              {/* Floating Dropdown Results */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-1.5 bg-panel border border-line rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto py-1">
                  {searchResults.map((med) => (
                    <button
                      key={med._id}
                      onClick={() => {
                        setSelectedMed(med);
                        setShowDropdown(false);
                        setSearchQuery("");
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-paper flex justify-between items-center transition-colors cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-ink">{med.name}</span>
                        <span className="text-[10px] text-muted font-mono">Batch: {med.batch || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted">₹{med.price}</span>
                        <Badge tone={med.quantity === 0 ? "brick" : med.quantity <= 10 ? "amber" : "sage"}>
                          {med.quantity} unit(s)
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {showDropdown && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
                <div className="absolute left-0 right-0 mt-1.5 bg-panel border border-line rounded-xl shadow-lg z-50 p-4 text-center text-xs text-muted">
                  No medicines found.
                </div>
              )}
            </div>

            {/* Date Display */}
            <div className="flex items-center gap-2.5 text-xs text-muted bg-white border border-line px-3.5 py-1.5 rounded-lg shadow-sm">
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-semibold font-mono text-[11px]">{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </div>

            {/* Notification Bell */}
            <button className="relative p-1.5 text-muted hover:text-ink bg-white border border-line rounded-lg shadow-sm hover:border-muted/30 cursor-pointer transition-all">
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-brick rounded-full" />
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            {/* Divider */}
            <div className="h-6 w-px bg-line/80" />

            {/* Profile & Sign Out */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-8.5 w-8.5 rounded-full bg-accent-light text-accent flex items-center justify-center font-bold text-xs shadow-sm border border-accent/20 shrink-0">
                  {session?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-[12px] font-semibold text-ink leading-tight">{session?.name}</div>
                  <div className="text-[9px] font-mono uppercase tracking-wider text-muted mt-0.5 leading-none">{session?.role}</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-muted hover:text-brick bg-white border border-line rounded-lg shadow-sm hover:bg-brick-light hover:border-brick/20 transition-all cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {(title || eyebrow) && (
          <header className="mb-8">
            {eyebrow && (
              <div className="font-mono text-[10px] tracking-wider uppercase text-muted mb-1 font-semibold">{eyebrow}</div>
            )}
            {title && <h1 className="font-display text-[26px] md:text-[28px] font-bold text-ink tracking-tight">{title}</h1>}
          </header>
        )}
        {children}
      </main>

      {/* Medicine Details Modal */}
      {selectedMed && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-panel border border-line rounded-xl w-full max-w-md shadow-lg overflow-hidden animate-fade-in-up">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal to-accent px-5 py-4 flex justify-between items-center text-white">
              <div>
                <h3 className="text-base font-bold">{selectedMed.name}</h3>
                <span className="text-[10px] tracking-wider uppercase font-semibold text-white/80">{selectedMed.category || "General"}</span>
              </div>
              <button
                onClick={() => setSelectedMed(null)}
                className="text-white hover:text-white/80 transition-colors p-1 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-muted uppercase font-bold tracking-wider block">Stock Quantity</span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-xl font-extrabold text-ink">{selectedMed.quantity}</span>
                    <span className="text-xs text-muted font-medium">{selectedMed.unit || "unit"}(s)</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-muted uppercase font-bold tracking-wider block">Retail Price (MRP)</span>
                  <div className="mt-1">
                    <span className="text-xl font-extrabold text-ink">₹{selectedMed.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Purchase Price only for Admin */}
              {isAdmin && (
                <div className="grid grid-cols-2 gap-4 border-t border-line pt-3">
                  <div>
                    <span className="text-[10px] text-muted uppercase font-bold tracking-wider block">Purchase Cost</span>
                    <div className="mt-1">
                      <span className="text-sm font-bold text-ink">₹{selectedMed.purchasePrice ? selectedMed.purchasePrice.toFixed(2) : "N/A"}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted uppercase font-bold tracking-wider block">GST Tax Rate</span>
                    <div className="mt-1">
                      <span className="text-sm font-bold text-ink">{selectedMed.gst || 0}%</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 border-t border-line pt-3">
                <div>
                  <span className="text-[10px] text-muted uppercase font-bold tracking-wider block">Batch Number</span>
                  <div className="mt-1 font-mono text-xs text-ink font-semibold">{selectedMed.batch || "N/A"}</div>
                </div>
                <div>
                  <span className="text-[10px] text-muted uppercase font-bold tracking-wider block">Expiry Details</span>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-ink">{new Date(selectedMed.expiry).toLocaleDateString()}</span>
                    {(() => {
                      const d = daysUntil(selectedMed.expiry);
                      return (
                        <Badge tone={d <= 0 ? "brick" : d <= 15 ? "brick" : d <= 30 ? "amber" : "sage"}>
                          {d <= 0 ? "Expired" : `${d}d left`}
                        </Badge>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-paper border-t border-line px-5 py-3 flex justify-end gap-2.5">
              <button
                onClick={() => setSelectedMed(null)}
                className="text-xs font-bold text-muted hover:text-ink px-4 py-2 border border-line rounded-lg bg-panel hover:bg-paper transition-all cursor-pointer"
              >
                Close View
              </button>
              <button
                onClick={() => {
                  setSelectedMed(null);
                  router.push("/medicines");
                }}
                className="text-xs font-bold text-white bg-teal hover:bg-teal-dark px-4 py-2 rounded-lg transition-all cursor-pointer"
              >
                Manage Stock
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
