export function StatCard({ label, value, sub, tone = "teal" }) {
  const tones = {
    teal: "border-l-teal from-teal/10 to-transparent",
    amber: "border-l-amber from-amber/10 to-transparent",
    brick: "border-l-brick from-brick/10 to-transparent",
    sage: "border-l-sage from-sage/10 to-transparent",
  };
  return (
    <div className={`glass-panel rounded-xl border border-l-4 ${tones[tone]} bg-gradient-to-br px-5 py-5 flex-1 min-w-[180px] shadow-card hover:-translate-y-1 hover:shadow-glow/5 transition-all duration-300`}>
      <div className="font-mono text-[10px] uppercase tracking-wider text-muted mb-2">{label}</div>
      <div className="font-display text-3xl font-bold text-ink">{value}</div>
      {sub && <div className="text-[12px] text-muted mt-1.5 font-medium">{sub}</div>}
    </div>
  );
}

export function Badge({ tone = "teal", children }) {
  const tones = {
    teal: "bg-teal-light border-teal/30 text-teal",
    amber: "bg-amber-light border-amber/30 text-amber",
    brick: "bg-brick-light border-brick/30 text-brick",
    sage: "bg-sage-light border-sage/30 text-sage",
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-lg border text-[10px] font-mono font-semibold tracking-wide ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const base = "px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-95 cursor-pointer shadow-sm";
  const variants = {
    primary: "bg-gradient-to-r from-teal to-teal-dark text-paper hover:shadow-md hover:brightness-105",
    ghost: "bg-transparent text-teal border border-teal/30 hover:bg-teal-light",
    danger: "bg-transparent text-brick border border-brick/30 hover:bg-brick-light",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-[12px] font-semibold text-muted uppercase tracking-wider">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "border border-line rounded-lg px-3.5 py-2.5 text-[13px] bg-white text-ink focus:border-teal focus:ring-2 focus:ring-teal/15 outline-none transition-all duration-200 placeholder:text-muted/40 shadow-sm";

