import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion } from "motion/react";
import { IoCheckmarkCircle, IoArrowForward, IoSettingsOutline } from "react-icons/io5";
import { Check, X, ArrowRight, Sparkles, Shield, Zap, Globe, LifeBuoy } from "lucide-react";

interface PricingPlan {
  id: "creator" | "pro" | "lifetime";
  name: string;
  price: string;
  period: string;
  description: string;
  badge?: string;
  features: string[];
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  descColor: string;
}

export const PricingPage: React.FC = () => {
  const { user, profile, isConfigured, refreshProfile } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState<boolean>(false);

  const plans: PricingPlan[] = [
    {
      id: "creator",
      name: "Creator Tier",
      price: "$9",
      period: "/ month",
      description: "Perfect for active content creators seeking beautiful design options.",
      features: [
        "Up to 20 saved cards",
        "Unlimited shortened links",
        "Full access to 10+ premium backgrounds",
        "Custom font pairings & sizes",
        "High-resolution PNG/SVG export",
        "Watermark removal",
        "Standard support"
      ],
      color: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs",
      bgColor: "bg-white",
      borderColor: "border-[#E1E5E9]",
      textColor: "text-[#17191C]",
      descColor: "text-[#626A73]"
    },
    {
      id: "pro",
      name: "Pro Professional",
      price: "$19",
      period: "/ month",
      description: "For agencies and power builders requiring absolute, limit-free creation.",
      badge: "Most Popular",
      features: [
        "Unlimited saved cards",
        "Unlimited shortened links",
        "Advanced customizable backgrounds & patterns",
        "Dynamic custom QR codes with branding",
        "Advanced link hub workspaces (2 hubs)",
        "Watermark removal & custom branding",
        "Priority 24/7 client support"
      ],
      // Let's make the most popular card a gorgeous, sleek SaaS dark obsidian color to look ultra-premium!
      color: "bg-[#0145F2] hover:bg-[#0039D4] text-white shadow-md shadow-[#0145F2]/10",
      bgColor: "bg-[#0F172A] text-white",
      borderColor: "border-[#1E293B]",
      textColor: "text-white",
      descColor: "text-slate-400"
    },
    {
      id: "lifetime",
      name: "Lifetime License",
      price: "$99",
      period: "one-time",
      description: "Pay once. Access everything forever. No recurring subscription fees.",
      badge: "Best Value",
      features: [
        "Lifetime Pro updates guaranteed",
        "Unlimited saved cards & link shorteners",
        "Unlimited link hub workspaces",
        "Custom domain branding",
        "All current and future premium features",
        "No subscription fees ever",
        "Dedicated elite support"
      ],
      color: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs",
      bgColor: "bg-white",
      borderColor: "border-[#E1E5E9]",
      textColor: "text-[#17191C]",
      descColor: "text-[#626A73]"
    }
  ];

  const handleCheckout = async (planId: "creator" | "pro" | "lifetime") => {
    if (!user) {
      setError("Please sign in or create an account to subscribe.");
      const loginBtn = document.getElementById("auth-nav-btn") || document.getElementById("mobile-auth-btn");
      if (loginBtn) {
        loginBtn.click();
      }
      return;
    }

    setLoadingPlan(planId);
    setError(null);

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem("sb-access-token") || ""}`
        },
        body: JSON.stringify({ plan: planId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session.");
      }

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error("No checkout URL returned from payment server.");
      }
    } catch (err: any) {
      console.error("Checkout redirect error:", err);
      setError(err.message || "An error occurred while connecting to Dodo Payments.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to open customer portal.");
      }

      if (data.portal_url) {
        window.location.href = data.portal_url;
      } else {
        throw new Error("No portal URL returned from billing server.");
      }
    } catch (err: any) {
      console.error("Portal redirect error:", err);
      setError(err.message || "An error occurred while opening the customer portal.");
    } finally {
      setPortalLoading(false);
    }
  };

  const currentPlan = profile?.plan || "free";

  return (
    <div id="pricing-page" className="min-h-screen bg-[#F5F7F9] py-20 px-4 sm:px-6 lg:px-8">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-indigo-100/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1100px] mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[11px] font-extrabold tracking-widest text-[#0145F2] uppercase bg-[#E8EEFF] px-3.5 py-1.5 rounded-full inline-block mb-4">
            PRICING PLANS
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#17191C] tracking-tight leading-[1.1] mb-5">
            Fair, simple pricing. Built for growth.
          </h1>
          <p className="text-[#626A73] text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Design beautiful social cards, generate tracked short URLs, and build interactive QR codes. Choose the perfect tier for your workflow.
          </p>

          {profile && currentPlan !== "free" && (
            <div className="mt-8 inline-flex flex-col sm:flex-row items-center gap-4 bg-white px-6 py-3.5 rounded-2xl border border-[#E1E5E9] shadow-xs">
              <span className="text-xs font-semibold text-gray-700">
                Active Plan: <strong className="text-[#0145F2] capitalize">{currentPlan}</strong> (Status: <span className="text-emerald-600 font-bold">{profile.subscription_status || "Active"}</span>)
              </span>
              <span className="hidden sm:inline text-gray-300">|</span>
              <button
                onClick={handlePortal}
                disabled={portalLoading}
                className="text-xs font-bold text-[#0145F2] hover:text-[#0039D4] inline-flex items-center gap-1.5 disabled:opacity-50 transition-colors"
              >
                <IoSettingsOutline className={`w-3.5 h-3.5 ${portalLoading ? 'animate-spin' : ''}`} />
                {portalLoading ? "Opening Portal..." : "Manage Billing & Portal"}
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-10 max-w-md mx-auto bg-rose-50 border border-rose-100 rounded-2xl p-4 text-center">
            <p className="text-xs font-bold text-rose-700">{error}</p>
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-24">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            const isLoading = loadingPlan === plan.id;
            const isDark = plan.bgColor.includes("bg-[#0F172A]");

            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                className={`rounded-3xl border ${plan.borderColor} ${plan.bgColor} p-8 flex flex-col justify-between relative shadow-sm hover:shadow-md transition-all`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3.5 py-1 rounded-full text-[10px] font-extrabold bg-[#0145F2] text-white uppercase tracking-wider shadow-xs">
                    {plan.badge}
                  </span>
                )}

                <div>
                  <div className="mb-5">
                    <h2 className={`text-xl font-extrabold tracking-tight ${plan.textColor}`}>{plan.name}</h2>
                    <p className={`text-xs mt-2 leading-relaxed ${plan.descColor} min-h-[40px]`}>
                      {plan.description}
                    </p>
                  </div>

                  <div className="flex items-baseline mb-6 border-b border-gray-100 dark:border-slate-800/60 pb-6">
                    <span className={`text-5xl font-extrabold tracking-tight ${plan.textColor}`}>{plan.price}</span>
                    <span className={`text-xs font-semibold ml-1.5 uppercase ${isDark ? 'text-slate-400' : 'text-[#626A73]'}`}>{plan.period}</span>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs leading-relaxed">
                        <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isDark ? 'text-emerald-400' : 'text-[#0145F2]'}`} />
                        <span className={isDark ? "text-slate-300" : "text-gray-700"}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-4 px-4 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center gap-2 border border-emerald-100"
                    >
                      Active Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCheckout(plan.id)}
                      disabled={loadingPlan !== null}
                      className={`w-full py-4 px-4 rounded-xl ${plan.color} font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer`}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Choose {plan.name}
                          <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Dynamic Comparison Matrix Section */}
        <div className="bg-white rounded-3xl border border-[#E1E5E9] p-6 sm:p-10 mb-20 shadow-xs">
          <div className="text-center sm:text-left mb-8 max-w-xl">
            <h2 className="text-2xl font-extrabold text-[#17191C] tracking-tight mb-2">Compare feature limits</h2>
            <p className="text-[#626A73] text-xs">
              Take an in-depth look at our technical features, support capabilities, and workspace variables.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs min-w-[750px]">
              <thead>
                <tr className="border-b border-[#E1E5E9]">
                  <th className="py-4 font-bold text-gray-500 w-[30%]">FEATURES & SERVICES</th>
                  <th className="py-4 font-bold text-gray-500 text-center w-[17.5%]">FREE TIER</th>
                  <th className="py-4 font-bold text-[#0145F2] text-center w-[17.5%] bg-blue-50/20">CREATOR</th>
                  <th className="py-4 font-bold text-gray-800 text-center w-[17.5%] bg-blue-50/50">PRO TIER</th>
                  <th className="py-4 font-bold text-purple-600 text-center w-[17.5%]">LIFETIME</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* Visual Studio group */}
                <tr>
                  <td colSpan={5} className="py-4.5 font-bold text-gray-400 uppercase tracking-widest text-[9px] bg-gray-50/40 px-2">Social Card Studio</td>
                </tr>
                <tr>
                  <td className="py-3.5 font-semibold text-[#17191C] px-2">Saved Layout Cards</td>
                  <td className="py-3.5 text-center text-[#626A73]">Up to 3 cards</td>
                  <td className="py-3.5 text-center text-[#17191C] font-semibold bg-blue-50/20">Up to 20 cards</td>
                  <td className="py-3.5 text-center text-[#17191C] font-semibold bg-blue-50/50">Unlimited</td>
                  <td className="py-3.5 text-center text-purple-700 font-semibold">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3.5 font-semibold text-[#17191C] px-2">Premium Editor Backgrounds</td>
                  <td className="py-3.5 text-center text-[#626A73]">Standard selection</td>
                  <td className="py-3.5 text-center text-[#17191C] font-semibold bg-blue-50/20">10+ Premium</td>
                  <td className="py-3.5 text-center text-[#17191C] font-semibold bg-blue-50/50">Full custom patterns</td>
                  <td className="py-3.5 text-center text-purple-700 font-semibold">Full custom + Updates</td>
                </tr>
                <tr>
                  <td className="py-3.5 font-semibold text-[#17191C] px-2">Watermark Removal</td>
                  <td className="py-3.5 text-center text-gray-400 flex items-center justify-center py-4"><X className="w-4 h-4 text-gray-300" /></td>
                  <td className="py-3.5 text-center bg-blue-50/20"><Check className="w-4 h-4 text-indigo-500 mx-auto" /></td>
                  <td className="py-3.5 text-center bg-blue-50/50"><Check className="w-4 h-4 text-[#0145F2] mx-auto" /></td>
                  <td className="py-3.5 text-center"><Check className="w-4 h-4 text-purple-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-3.5 font-semibold text-[#17191C] px-2">High-Res Vector Exports (SVG)</td>
                  <td className="py-3.5 text-center text-[#626A73]">PNG Only</td>
                  <td className="py-3.5 text-center bg-blue-50/20"><Check className="w-4 h-4 text-indigo-500 mx-auto" /></td>
                  <td className="py-3.5 text-center bg-blue-50/50"><Check className="w-4 h-4 text-[#0145F2] mx-auto" /></td>
                  <td className="py-3.5 text-center bg-purple-50/20"><Check className="w-4 h-4 text-purple-500 mx-auto" /></td>
                </tr>

                {/* Tracking tools group */}
                <tr>
                  <td colSpan={5} className="py-4.5 font-bold text-gray-400 uppercase tracking-widest text-[9px] bg-gray-50/40 px-2">Short Links & Workspace Tools</td>
                </tr>
                <tr>
                  <td className="py-3.5 font-semibold text-[#17191C] px-2">Shortened Redirect URLs</td>
                  <td className="py-3.5 text-center text-[#626A73]">Unlimited</td>
                  <td className="py-3.5 text-center bg-blue-50/20"><Check className="w-4 h-4 text-indigo-500 mx-auto" /></td>
                  <td className="py-3.5 text-center bg-blue-50/50"><Check className="w-4 h-4 text-[#0145F2] mx-auto" /></td>
                  <td className="py-3.5 text-center"><Check className="w-4 h-4 text-purple-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-3.5 font-semibold text-[#17191C] px-2">Link Hub Workspace Profiles</td>
                  <td className="py-3.5 text-center text-[#626A73]">1 active hub</td>
                  <td className="py-3.5 text-center text-[#17191C] font-semibold bg-blue-50/20">1 active hub</td>
                  <td className="py-3.5 text-center text-[#17191C] font-semibold bg-blue-50/50">2 active hubs</td>
                  <td className="py-3.5 text-center text-purple-700 font-semibold">Unlimited hubs</td>
                </tr>
                <tr>
                  <td className="py-3.5 font-semibold text-[#17191C] px-2">Custom Branded QR Codes</td>
                  <td className="py-3.5 text-center text-[#626A73]">Standard QR</td>
                  <td className="py-3.5 text-center text-[#626A73] bg-blue-50/20">Standard QR</td>
                  <td className="py-3.5 text-center bg-blue-50/50"><Check className="w-4 h-4 text-[#0145F2] mx-auto" /></td>
                  <td className="py-3.5 text-center"><Check className="w-4 h-4 text-purple-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-3.5 font-semibold text-[#17191C] px-2">Custom Branding Domain</td>
                  <td className="py-3.5 text-center text-gray-300"><X className="w-4 h-4 text-gray-300 mx-auto" /></td>
                  <td className="py-3.5 text-center text-gray-300 bg-blue-50/20"><X className="w-4 h-4 text-gray-300 mx-auto" /></td>
                  <td className="py-3.5 text-center text-[#0145F2] font-semibold bg-blue-50/50">Priority Support Addon</td>
                  <td className="py-3.5 text-center text-purple-700 font-semibold">Included</td>
                </tr>

                {/* Infrastructure group */}
                <tr>
                  <td colSpan={5} className="py-4.5 font-bold text-gray-400 uppercase tracking-widest text-[9px] bg-gray-50/40 px-2">Support & Guarantees</td>
                </tr>
                <tr>
                  <td className="py-3.5 font-semibold text-[#17191C] px-2">Support S.L.A.</td>
                  <td className="py-3.5 text-center text-[#626A73]">Self-serve / Community</td>
                  <td className="py-3.5 text-center text-[#17191C] font-semibold bg-blue-50/20">Email Standard</td>
                  <td className="py-3.5 text-center text-[#17191C] font-semibold bg-blue-50/50">Priority (24h SLA)</td>
                  <td className="py-3.5 text-center text-purple-700 font-semibold">Elite Dedicated Chat</td>
                </tr>
                <tr>
                  <td className="py-3.5 font-semibold text-[#17191C] px-2">Platform Upgrades</td>
                  <td className="py-3.5 text-center text-[#626A73]">Standard</td>
                  <td className="py-3.5 text-center bg-blue-50/20"><Check className="w-4 h-4 text-indigo-500 mx-auto" /></td>
                  <td className="py-3.5 text-center bg-blue-50/50"><Check className="w-4 h-4 text-[#0145F2] mx-auto" /></td>
                  <td className="py-3.5 text-center"><Check className="w-4 h-4 text-purple-500 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto border-t border-[#E1E5E9] pt-16">
          <h2 className="text-2xl font-bold text-[#17191C] text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-sm text-[#17191C] mb-2">Can I cancel my subscription?</h3>
              <p className="text-xs text-[#626A73] leading-relaxed">
                Yes, absolutely. You can cancel your subscription at any time instantly through your self-service customer billing portal. You will retain access until the end of your billing cycle.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#17191C] mb-2">Is there a refund policy?</h3>
              <p className="text-xs text-[#626A73] leading-relaxed">
                We offer a 14-day money-back guarantee for all subscription plans if you are unsatisfied with the features. Just drop us an email via support.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#17191C] mb-2">What happens to my cards if I downgrade?</h3>
              <p className="text-xs text-[#626A73] leading-relaxed">
                Your existing saved cards and short links will remain completely intact. However, you will only be able to create new ones once your active card count falls below your new plan's limit.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#17191C] mb-2">Is payment processing secure?</h3>
              <p className="text-xs text-[#626A73] leading-relaxed">
                Extremely secure. All payments are processed through Dodo Payments, a premier global Merchant of Record. We never store or handle your credit card credentials directly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
