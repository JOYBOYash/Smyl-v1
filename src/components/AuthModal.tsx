import React, { useState } from "react";
import {
  IoClose,
  IoLogoGoogle,
  IoMail,
  IoLockClosed,
  IoPerson,
  IoAlertCircle,
  IoCheckmarkCircle,
} from "react-icons/io5";
import { useAuth } from "../context/AuthContext";
import { SmylLogo } from "./SmylLogo";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signin" | "signup";
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = "signin",
  onSuccess,
}) => {
  const { signInWithGoogle, signInWithPassword, signUpWithPassword, isConfigured } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    const { error } = await signInWithGoogle();
    setIsLoading(false);
    if (error) {
      setErrorMsg(error.message || "Failed to sign in with Google.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please enter your email and password.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    if (mode === "signin") {
      const { error } = await signInWithPassword(email, password);
      setIsLoading(false);
      if (error) {
        setErrorMsg(error.message || "Invalid credentials or sign in error.");
      } else {
        setSuccessMsg("Signed in successfully!");
        onSuccess?.();
        setTimeout(() => onClose(), 600);
      }
    } else {
      const { error } = await signUpWithPassword(email, password, displayName);
      setIsLoading(false);
      if (error) {
        setErrorMsg(error.message || "Failed to create account.");
      } else {
        setSuccessMsg("Account created! Check your email to confirm if verification is enabled.");
        onSuccess?.();
        setTimeout(() => onClose(), 1200);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm bg-white rounded-2xl border border-[#E1E5E9] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-[#ECEEF1] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SmylLogo className="h-5 w-auto" />
            <span className="text-xs font-bold text-[#8D959F] uppercase tracking-wider">Account</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-[#626A73] hover:bg-[#F5F7F9] hover:text-[#17191C] flex items-center justify-center transition-colors cursor-pointer"
          >
            <IoClose className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-bold text-[#17191C] text-lg tracking-tight">
              {mode === "signin" ? "Welcome back" : "Create your Smyl account"}
            </h3>
            <p className="text-xs text-[#626A73] mt-0.5">
              Sync your card designs, custom avatars, and exports seamlessly.
            </p>
          </div>

          {!isConfigured && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2">
              <IoAlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Local Storage Resilient Mode</p>
                <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                  Supabase environment credentials are not yet set. Cards and avatars will save locally in your browser.
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
              <IoAlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
              <IoCheckmarkCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full h-10 px-4 rounded-xl border border-[#D0D7DE] bg-white hover:bg-[#F8FAFC] text-[#17191C] font-semibold text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <IoLogoGoogle className="w-4 h-4 text-[#EA4335]" />
            <span>Continue with Google</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#ECEEF1]"></div>
            <span className="flex-shrink mx-3 text-[10px] font-bold text-[#8D959F] uppercase tracking-wider">
              Or with email
            </span>
            <div className="flex-grow border-t border-[#ECEEF1]"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <div className="relative">
                <IoPerson className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D959F]" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Display name"
                  className="w-full h-9.5 pl-9 pr-3 text-xs rounded-xl border border-[#D0D7DE] bg-white text-[#17191C] placeholder-[#8D959F] focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                />
              </div>
            )}

            <div className="relative">
              <IoMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D959F]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@work.com"
                className="w-full h-9.5 pl-9 pr-3 text-xs rounded-xl border border-[#D0D7DE] bg-white text-[#17191C] placeholder-[#8D959F] focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              />
            </div>

            <div className="relative">
              <IoLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D959F]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password (min 6 characters)"
                className="w-full h-9.5 pl-9 pr-3 text-xs rounded-xl border border-[#D0D7DE] bg-white text-[#17191C] placeholder-[#8D959F] focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 rounded-xl bg-brand-primary text-white font-semibold text-xs flex items-center justify-center gap-2 hover:bg-brand-hover active:bg-brand-pressed transition-colors disabled:opacity-50 cursor-pointer shadow-xs mt-2"
            >
              <span>{isLoading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}</span>
            </button>
          </form>

          {/* Switch Mode */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-xs text-[#626A73] hover:text-brand-primary font-medium cursor-pointer"
            >
              {mode === "signin" ? (
                <>Don't have an account? <span className="font-bold text-brand-primary">Sign up</span></>
              ) : (
                <>Already have an account? <span className="font-bold text-brand-primary">Sign in</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
