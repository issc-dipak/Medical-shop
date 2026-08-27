"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { login, register, getSession } from "@/lib/api";
import { Button, inputClass } from "@/components/Bits";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  
  // Login fields
  const [loginId, setLoginId] = useState(""); // Email or Username
  const [loginPassword, setLoginPassword] = useState("");

  // Registration fields
  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [drugLicenseNumber, setDrugLicenseNumber] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getSession()) router.replace("/dashboard");
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await login(loginId.trim(), loginPassword);
      } else {
        await register({
          shopName: shopName.trim(),
          ownerName: ownerName.trim(),
          email: email.trim(),
          mobile: mobile.trim(),
          address: address.trim(),
          gstNumber: gstNumber.trim(),
          drugLicenseNumber: drugLicenseNumber.trim(),
          password: registerPassword,
        });
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || (isLogin ? "Incorrect username/email or password." : "Registration failed."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-[#070A13] flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Background Neon Blobs */}
      <div className="glow-blob w-[350px] h-[350px] bg-[#6366F1] top-12 left-12 opacity-30" style={{ filter: "blur(120px)" }} />
      <div className="glow-blob w-[300px] h-[300px] bg-[#00F5D4] bottom-12 right-12 opacity-20" style={{ filter: "blur(100px)" }} />

      <div className="w-full max-w-[440px] relative z-10 animate-fade-in-up">
        <div className="flex flex-col items-center gap-3 mb-8 justify-center">
          <div className="bg-gradient-to-tr from-teal to-accent p-3.5 rounded-xl shadow-glow">
            <svg width="28" height="28" viewBox="0 0 30 30" aria-hidden="true">
              <rect x="12" y="3" width="6" height="24" fill="#070A13" />
              <rect x="3" y="12" width="24" height="6" fill="#070A13" />
            </svg>
          </div>
          <div className="text-center mt-2">
            <div className="font-display font-bold text-3xl tracking-tight leading-none bg-gradient-to-r from-ink via-ink to-muted bg-clip-text text-transparent">MedLedger</div>
            <div className="text-[11px] tracking-widest text-muted font-bold uppercase mt-1.5">Enterprise Shop Manager</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel rounded-lg p-8 flex flex-col gap-4 shadow-card">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink tracking-tight">
              {isLogin ? "Sign In" : "Register Store"}
            </h1>
            <p className="text-[13px] text-muted mt-1.5 leading-relaxed">
              {isLogin ? "Access your unified store workspace." : "Configure your tenant credentials and owner profile."}
            </p>
          </div>

          {isLogin ? (
            <>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Email or Username</span>
                <input
                  className={inputClass}
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  autoFocus
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Password</span>
                <input
                  type="password"
                  className={inputClass}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </label>
            </>
          ) : (
            <div className="flex flex-col gap-4 max-h-[380px] overflow-y-auto pr-1">
              <div className="text-[10px] font-bold tracking-wider uppercase text-teal border-b border-line pb-1">
                Shop Details
              </div>
              
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Shop Name *</span>
                <input
                  className={inputClass}
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. Sunrise Pharmacy"
                  required
                  autoFocus
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Address</span>
                <textarea
                  className={`${inputClass} min-h-[60px] py-1.5`}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Shop address..."
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">GST Number</span>
                  <input
                    className={inputClass}
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="27AAAAA1111A1Z1"
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Drug License No.</span>
                  <input
                    className={inputClass}
                    value={drugLicenseNumber}
                    onChange={(e) => setDrugLicenseNumber(e.target.value)}
                    placeholder="DL-12345/MH"
                  />
                </label>
              </div>

              <div className="text-[10px] font-bold tracking-wider uppercase text-teal border-b border-line pb-1 mt-2">
                Owner Details
              </div>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Owner Name *</span>
                <input
                  className={inputClass}
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Email *</span>
                <input
                  type="email"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@example.com"
                  required
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Mobile</span>
                <input
                  type="tel"
                  className={inputClass}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="9876543210"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Password *</span>
                <input
                  type="password"
                  className={inputClass}
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </label>
            </div>
          )}

          {error && <div className="text-[13px] text-brick font-semibold">{error}</div>}

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? (isLogin ? "Signing in…" : "Registering…") : (isLogin ? "Sign In" : "Register Store")}
          </Button>
          
          <div className="text-[13px] text-center mt-2 text-muted">
            {isLogin ? "Want to register a new shop? " : "Already have an account? "}
            <button
              type="button"
              className="text-teal font-semibold hover:underline cursor-pointer"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
