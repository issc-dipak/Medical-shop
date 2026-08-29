"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/api";

const NAV = [
  { 
    href: "/dashboard", 
    label: "Dashboard", 
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
      </svg>
    )
  },
  { 
    href: "/medicines", 
    label: "Medicines", 
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z"/>
      </svg>
    )
  },
  { 
    href: "/billing", 
    label: "Billing", 
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
      </svg>
    )
  },
  { 
    href: "/customers", 
    label: "Customers", 
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
      </svg>
    )
  },
  { 
    href: "/reports", 
    label: "Reports", 
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2zm5-18v18m5-12v12"/>
      </svg>
    )
  },
];

export default function Sidebar({ session, isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const navItems = [...NAV];
  if (session?.role === "Admin") {
    navItems.push({ 
      href: "/staff", 
      label: "Manage Staff", 
      icon: (
        <svg className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
        </svg>
      )
    });
    navItems.push({ 
      href: "/settings", 
      label: "Settings", 
      icon: (
        <svg className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      )
    });
  }

  return (
    <aside className={`no-print w-[240px] shrink-0 bg-panel border-r border-line text-ink flex flex-col h-screen fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 md:translate-x-0 ${
      isOpen ? "translate-x-0" : "-translate-x-full"
    }`}>
      <div className="px-6 pt-7 pb-5 border-b border-line flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="bg-accent p-1.5 rounded-lg text-white shadow-sm flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 10.5V20a2 2 0 01-2 2H7a2 2 0 01-2-2v-9.5M12 3v10M8 7h8"/>
            </svg>
          </div>
          <div>
            <div className="font-display font-bold text-[18px] tracking-tight leading-none text-ink">PharmaDesk</div>
            <div className="text-[10px] tracking-wider text-muted font-bold uppercase mt-1">SaaS Platform</div>
          </div>
        </div>
        {/* Mobile Close Button */}
        <button onClick={onClose} className="md:hidden text-muted hover:text-ink cursor-pointer">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 px-3 py-5 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map((item, idx) => {
          const active = pathname === item.href;
          if (item.disabled) {
            return (
              <div
                key={idx}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted/40 cursor-not-allowed"
                title="Coming Soon"
              >
                {item.icon}
                <span className="font-medium text-muted/65">{item.label}</span>
              </div>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                active 
                  ? "bg-accent/8 text-accent font-semibold border-l-2 border-accent" 
                  : "text-muted hover:text-ink hover:bg-paper"
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Profile Card at Sidebar Bottom */}
      <div className="p-4 border-t border-line bg-paper flex items-center justify-between gap-3 mt-auto">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="h-9 w-9 rounded-full bg-accent-light text-accent flex items-center justify-center font-bold text-sm shadow-sm border border-accent/20 shrink-0">
            {session?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="text-left overflow-hidden">
            <div className="text-[13px] font-semibold text-ink truncate leading-snug">{session?.name}</div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted leading-none mt-0.5">{session?.role}</div>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="p-2 rounded-lg text-muted hover:text-brick hover:bg-brick-light border border-line/65 hover:border-brick/20 transition-all cursor-pointer shrink-0 bg-white shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
