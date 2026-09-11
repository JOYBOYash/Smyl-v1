import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "motion/react";
import { IoCheckmarkCircle, IoAlertCircle, IoSparklesOutline } from "react-icons/io5";

export const BillingCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshProfile, user } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [purchasedPlan, setPurchasedPlan] = useState<string>("");
  const verifiedRef = useRef(false);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    
    if (!sessionId) {
      setStatus("error");
      setErrorMsg("Missing billing session identifier in the callback URL.");
      return;
    }

    if (verifiedRef.current) return;
    verifiedRef.current = true;

    const verifySession = async () => {
      try {
        const response = await fetch(`/api/billing/session-info/${sessionId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to verify payment details.");
        }

        // Checkout was successful! Let's get the purchased plan details
        const plan = data.metadata?.plan || "paid";
        setPurchasedPlan(plan);
        
        // Refresh the profile so the entire app context gets the updated tier instantly
        await refreshProfile();
        
        setStatus("success");
      } catch (err: any) {
        console.error("Session verification failed:", err);
        setStatus("error");
        setErrorMsg(err.message || "An unexpected error occurred while verifying your subscription.");
      }
    };

    verifySession();
  }, [searchParams, refreshProfile]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-[#F8FAFC]">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 p-8 text-center shadow-lg shadow-gray-100/50 relative overflow-hidden">
        {/* Subtle decorative background sparkles */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-50 rounded-full blur-2xl" />

        {status === "loading" && (
          <div className="flex flex-col items-center py-8">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
              <IoSparklesOutline className="w-6 h-6 text-indigo-500 absolute top-5 left-5 animate-pulse" />
            </div>
            <h1 className="text-xl font-bold text-[#111418] mb-2">Verifying Payment...</h1>
            <p className="text-xs text-[#626A73] leading-relaxed max-w-xs">
              Confirming your subscription details securely with Dodo Payments. This will only take a moment.
            </p>
          </div>
        )}

        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-4"
          >
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-6 relative">
              <IoCheckmarkCircle className="w-14 h-14" />
              <div className="absolute -inset-1 rounded-full border border-emerald-500/20 animate-ping pointer-events-none" style={{ animationDuration: '2s' }} />
            </div>
            
            <h1 className="text-2xl font-extrabold text-[#111418] tracking-tight mb-2">Subscription Activated! 🎉</h1>
            <p className="text-xs text-[#626A73] leading-relaxed max-w-xs mb-8">
              Thank you for upgrading! Your <strong className="text-indigo-600 capitalize">{purchasedPlan || "paid"} plan</strong> is now fully active. Enjoy premium features, expanded limits, and zero watermarks.
            </p>

            <button
              onClick={() => navigate("/tools/post-card-studio")}
              className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 transition-all cursor-pointer"
            >
              Enter Post Card Studio
            </button>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-4"
          >
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-6">
              <IoAlertCircle className="w-10 h-10" />
            </div>
            
            <h1 className="text-xl font-bold text-[#111418] mb-2">Verification Failed</h1>
            <p className="text-xs text-rose-600 leading-relaxed max-w-xs mb-8 bg-rose-50/50 border border-rose-100/30 p-3 rounded-2xl">
              {errorMsg || "An unexpected error occurred during subscription activation."}
            </p>

            <div className="flex flex-col w-full gap-3">
              <button
                onClick={() => navigate("/pricing")}
                className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                Return to Pricing
              </button>
              <button
                onClick={() => navigate("/tools/post-card-studio")}
                className="w-full py-3.5 px-6 rounded-2xl bg-white border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-all cursor-pointer"
              >
                Go to Studio
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
