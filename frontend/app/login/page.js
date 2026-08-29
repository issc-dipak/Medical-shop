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
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  
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
        // Client-side validations
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          setError("Please enter a valid email address.");
          setLoading(false);
          return;
        }
        if (mobile && mobile.length !== 10) {
          setError("Mobile number must be exactly 10 digits.");
          setLoading(false);
          return;
        }
        if (gstNumber && gstNumber.length !== 15) {
          setError("GSTIN must be exactly 15 alphanumeric characters.");
          setLoading(false);
          return;
        }
        if (registerPassword.length < 6) {
          setError("Password must be at least 6 characters long.");
          setLoading(false);
          return;
        }

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
    <div className="relative min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12 overflow-hidden">

      <div className="w-full max-w-[900px] relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 animate-fade-in-up">
        {/* Left Side: Logo & Branding */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4 max-w-[380px]">
          <div className="bg-gradient-to-tr from-teal to-accent p-4 rounded-2xl shadow-lg w-fit">
            <svg width="36" height="36" viewBox="0 0 30 30" aria-hidden="true">
              <rect x="12" y="3" width="6" height="24" fill="#FFFFFF" />
              <rect x="3" y="12" width="24" height="6" fill="#FFFFFF" />
            </svg>
          </div>
          <div className="mt-2">
            <div className="font-display font-extrabold text-4xl tracking-tight leading-none text-slate-800 md:text-5xl">PharmaDesk</div>
            <div className="text-[12px] tracking-widest text-slate-400 font-bold uppercase mt-2.5">Enterprise Shop Manager</div>
            <p className="text-sm text-slate-500 mt-4 hidden md:block leading-relaxed">
              A comprehensive system for billing, inventory management, customer records, and real-time reports.
            </p>
          </div>
        </div>

        {/* Right Side: Form Card */}
        <div className="w-full max-w-[440px]">
          <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-8 flex flex-col gap-4 shadow-xl border border-white/60 bg-white/90">
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
                    placeholder="Enter your email or username"
                    required
                    autoFocus
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Password</span>
                  <div className="relative flex items-center">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      className={`${inputClass} w-full pr-10`}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 text-muted hover:text-ink focus:outline-none transition-colors"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                    >
                      {showLoginPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </label>
              </>
            ) : (
              <div className="flex flex-col gap-4 max-h-[380px] overflow-y-auto pr-3 pb-2">
                <div className="text-[10px] font-bold tracking-wider uppercase text-teal border-b border-line pb-1">
                  Shop Details
                </div>
                
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Shop Name *</span>
                  <input
                    className={inputClass}
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="Enter shop name"
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
                    placeholder="Enter shop address"
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">GSTIN</span>
                    <input
                      className={inputClass}
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15))}
                      placeholder="Optional"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Drug Lic. No.</span>
                    <input
                      className={inputClass}
                      value={drugLicenseNumber}
                      onChange={(e) => setDrugLicenseNumber(e.target.value)}
                      placeholder="Optional"
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
                    onChange={(e) => setOwnerName(e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                    placeholder="Enter owner name"
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
                    placeholder="Enter owner email"
                    required
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Mobile</span>
                  <input
                    type="tel"
                    className={inputClass}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="Enter mobile number"
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Password *</span>
                  <div className="relative flex items-center">
                    <input
                      type={showRegisterPassword ? "text" : "password"}
                      className={`${inputClass} w-full pr-10`}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="Create password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 text-muted hover:text-ink focus:outline-none transition-colors"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    >
                      {showRegisterPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
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
    </div>
  );
}
