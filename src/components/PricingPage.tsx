import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { IoSettingsOutline } from "react-icons/io5";
import { ArrowRight, Check, X, ChevronDown } from "lucide-react";

interface PricingPlan {
  id: "free" | "creator" | "pro" | "lifetime";
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
  const [openPricingFaqIndex, setOpenPricingFaqIndex] = useState<number | null>(0);

  const plans: PricingPlan[] = [
    {
      id: "free",
      name: "Free Baseline",
      price: "$0",
      period: "/ forever",
      description: "Essential utilities for individuals and causal link sharing.",
      features: [
        "10 saved card designs",
        "25 custom QR codes / mo",
        "5 shortened links total",
        "10 Open Graph inspections / mo",
        "3 high-speed screenshots / mo",
        "1 customized Link Hub profile",
        "Standard community support"
      ],
      color: "bg-white hover:bg-[#F5F7F9] text-[#17191C] border border-[#E1E5E9] hover:border-[#B9C0C8] shadow-xs",
      bgColor: "bg-white",
      borderColor: "border-[#E1E5E9]",
      textColor: "text-[#17191C]",
      descColor: "text-[#626A73]"
    },
    {
      id: "creator",
      name: "Creator Tier",
      price: "$1.99",
      period: "/ month",
      description: "Perfect for active creators seeking extended limits.",
      badge: "Most Popular",
      features: [
        "100 saved card designs",
        "250 custom QR codes / mo",
        "50 shortened links total",
        "100 Open Graph inspections / mo",
        "25 high-speed screenshots / mo",
        "5 customized Link Hub profiles",
        "Watermark-free exports",
        "Direct email priority support"
      ],
      color: "bg-[#0145F2] hover:bg-[#0039D4] text-white shadow-md shadow-[#0145F2]/10 border-none",
      bgColor: "bg-white",
      borderColor: "border-[#0145F2] border-2",
      textColor: "text-[#17191C]",
      descColor: "text-[#626A73]"
    },
    {
      id: "pro",
      name: "Pro Professional",
      price: "$5.99",
      period: "/ month",
      description: "For marketers and agencies requiring absolute utility depth.",
      features: [
        "500 saved card designs",
        "1,000 custom QR codes / mo",
        "500 shortened links total",
        "500 Open Graph inspections / mo",
        "100 high-speed screenshots / mo",
        "20 customized Link Hub profiles",
        "Watermark-free + Custom branding",
        "Priority 24/7 client support"
      ],
      color: "bg-white hover:bg-[#F5F7F9] text-[#17191C] border border-[#E1E5E9] hover:border-[#B9C0C8] shadow-xs",
      bgColor: "bg-white",
      borderColor: "border-[#E1E5E9]",
      textColor: "text-[#17191C]",
      descColor: "text-[#626A73]"
    },
    {
      id: "lifetime",
      name: "Lifetime License",
      price: "$99.99",
      period: "one-time pay",
      description: "Access everything forever. No recurring subscription fees.",
      features: [
        "Unlimited saved card designs",
        "Unlimited custom QR codes",
        "Unlimited shortened links",
        "Unlimited Open Graph inspections",
        "Unlimited high-speed screenshots",
        "Unlimited Link Hub profiles",
        "Custom branding & domains",
        "Dedicated elite support channels"
      ],
      color: "bg-white hover:bg-[#F5F7F9] text-[#17191C] border border-[#E1E5E9] hover:border-[#B9C0C8] shadow-xs",
      bgColor: "bg-white",
      borderColor: "border-[#E1E5E9]",
      textColor: "text-[#17191C]",
      descColor: "text-[#626A73]"
    }
  ];

  const handleCheckout = async (planId: "free" | "creator" | "pro" | "lifetime") => {
    if (planId === "free") {
      window.location.href = "/dashboard";
      return;
    }

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
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem("sb-access-token") || ""}`
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
    <div id="pricing-page" className="min-h-screen bg-[#F5F7F9] py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-100/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-indigo-100/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1200px] mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[10px] font-extrabold tracking-widest text-[#0145F2] uppercase bg-[#E8EEFF] px-3.5 py-1.5 rounded-full inline-block mb-4">
            Pricing Plans
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#17191C] tracking-tight leading-[1.1] mb-5">
            Sleek utilities. Simple, fair pricing.
          </h1>
          <p className="text-[#626A73] text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Design pristine social cards, generate short URLs, configure link hubs, and print premium QR codes. Choose a plan tailored to your scale.
          </p>

          {profile && currentPlan !== "free" && (
            <div className="mt-8 inline-flex flex-col sm:flex-row items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-[#E1E5E9] shadow-xs">
              <span className="text-xs font-semibold text-gray-700">
                Active Plan: <strong className="text-[#0145F2] capitalize">{currentPlan}</strong> (Status: <span className="text-emerald-600 font-bold">{profile.subscription_status || "Active"}</span>)
              </span>
              <span className="hidden sm:inline text-gray-300">|</span>
              <button
                onClick={handlePortal}
                disabled={portalLoading}
                className="text-xs font-bold text-[#0145F2] hover:text-[#0039D4] inline-flex items-center gap-1.5 disabled:opacity-50 transition-colors bg-transparent border-none cursor-pointer"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch mb-24">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            const isLoading = loadingPlan === plan.id;

            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className={`rounded-2xl border ${plan.borderColor} ${plan.bgColor} p-6 flex flex-col justify-between relative shadow-xs hover:shadow-sm transition-all`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-[9px] font-extrabold bg-[#0145F2] text-white uppercase tracking-wider shadow-xs">
                    {plan.badge}
                  </span>
                )}

                <div>
                  <div className="mb-4">
                    <h2 className={`text-base font-extrabold tracking-tight ${plan.textColor}`}>{plan.name}</h2>
                    <p className={`text-[11px] mt-1 leading-relaxed ${plan.descColor} min-h-[34px]`}>
                      {plan.description}
                    </p>
                  </div>

                  <div className="flex items-baseline mb-5 border-b border-gray-100 pb-5">
                    <span className={`text-3xl font-extrabold tracking-tight ${plan.textColor}`}>{plan.price}</span>
                    <span className="text-[10px] font-bold ml-1 uppercase text-[#626A73]">{plan.period}</span>
                  </div>

                  {/* NO ICONS USED IN THE LIST BELOW TO CONFORM TO USER DIRECTIVE */}
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-1 text-[11px] leading-relaxed">
                        <span className="mr-1 font-bold text-[#0145F2]">—</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-3 px-4 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-[11px] flex items-center justify-center gap-1 border border-emerald-100"
                    >
                      Active Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCheckout(plan.id)}
                      disabled={loadingPlan !== null}
                      className={`w-full py-3 px-4 rounded-lg ${plan.color} font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer`}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {plan.id === "free" ? "Get Started" : `Choose ${plan.name}`}
                          <ArrowRight className="w-3 h-3 shrink-0" />
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
        <div className="bg-white rounded-2xl border border-[#E1E5E9] p-6 sm:p-8 mb-20 shadow-xs">
          <div className="text-center sm:text-left mb-6 max-w-xl">
            <h2 className="text-xl font-extrabold text-[#17191C] tracking-tight mb-2">Compare feature limits</h2>
            <p className="text-[#626A73] text-xs">
              Take an in-depth look at our technical limits, utility capabilities, and priority services across plans.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs min-w-[750px]">
              <thead>
                <tr className="border-b border-[#E1E5E9]">
                  <th className="py-3 font-bold text-gray-500 w-[28%] px-2">Utilities & Quotas</th>
                  <th className="py-3 font-bold text-gray-500 text-center w-[18%]">Free Baseline</th>
                  <th className="py-3 font-bold text-[#0145F2] text-center w-[18%] bg-blue-50/20">Creator Plan</th>
                  <th className="py-3 font-bold text-gray-800 text-center w-[18%]">Pro Tier</th>
                  <th className="py-3 font-bold text-gray-800 text-center w-[18%]">Lifetime</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* Visual Studio group */}
                <tr>
                  <td colSpan={5} className="py-3 font-bold text-gray-400 uppercase tracking-widest text-[9px] bg-gray-50/40 px-2">Social Card Studio</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-[#17191C] px-2">Saved Layout Cards</td>
                  <td className="py-3 text-center text-[#626A73]">Up to 10 cards</td>
                  <td className="py-3 text-center text-[#17191C] font-semibold bg-blue-50/20">Up to 100 cards</td>
                  <td className="py-3 text-center text-[#17191C]">Up to 500 cards</td>
                  <td className="py-3 text-center text-[#17191C] font-semibold">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-[#17191C] px-2">Premium Editor Backgrounds</td>
                  <td className="py-3 text-center text-[#626A73]">Standard selection</td>
                  <td className="py-3 text-center text-[#17191C] font-semibold bg-blue-50/20">Full Selection</td>
                  <td className="py-3 text-center text-[#17191C]">Custom patterns</td>
                  <td className="py-3 text-center text-[#17191C] font-semibold">Custom + Updates</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-[#17191C] px-2">Watermark Removal</td>
                  <td className="py-3 text-center text-gray-400"><X className="w-3.5 h-3.5 text-gray-300 mx-auto" /></td>
                  <td className="py-3 text-center bg-blue-50/20"><Check className="w-3.5 h-3.5 text-[#0145F2] mx-auto" /></td>
                  <td className="py-3 text-center"><Check className="w-3.5 h-3.5 text-[#0145F2] mx-auto" /></td>
                  <td className="py-3 text-center"><Check className="w-3.5 h-3.5 text-[#0145F2] mx-auto" /></td>
                </tr>

                {/* Tracking tools group */}
                <tr>
                  <td colSpan={5} className="py-3 font-bold text-gray-400 uppercase tracking-widest text-[9px] bg-gray-50/40 px-2">Short Links & Workspace Tools</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-[#17191C] px-2">Shortened Redirect URLs</td>
                  <td className="py-3 text-center text-[#626A73]">Up to 5 links</td>
                  <td className="py-3 text-center text-[#17191C] font-semibold bg-blue-50/20">Up to 50 links</td>
                  <td className="py-3 text-center text-[#17191C]">Up to 500 links</td>
                  <td className="py-3 text-center text-[#17191C] font-semibold">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-[#17191C] px-2">Custom QR Codes</td>
                  <td className="py-3 text-center text-[#626A73]">25 / month</td>
                  <td className="py-3 text-center text-[#17191C] font-semibold bg-blue-50/20">250 / month</td>
                  <td className="py-3 text-center text-[#17191C]">1,000 / month</td>
                  <td className="py-3 text-center text-[#17191C] font-semibold">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-[#17191C] px-2">Link Hub Workspace Profiles</td>
                  <td className="py-3 text-center text-[#626A73]">1 active hub</td>
                  <td className="py-3 text-center text-[#17191C] font-semibold bg-blue-50/20">5 active hubs</td>
                  <td className="py-3 text-center text-[#17191C]">20 active hubs</td>
                  <td className="py-3 text-center text-[#17191C] font-semibold">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-[#17191C] px-2">Open Graph tag inspections</td>
                  <td className="py-3 text-center text-[#626A73]">10 / month</td>
                  <td className="py-3 text-center text-[#17191C] font-semibold bg-blue-50/20">100 / month</td>
                  <td className="py-3 text-center text-[#17191C]">500 / month</td>
                  <td className="py-3 text-center text-[#17191C] font-semibold">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-[#17191C] px-2">Web screenshots generated</td>
                  <td className="py-3 text-center text-[#626A73]">3 / month</td>
                  <td className="py-3 text-center text-[#17191C] font-semibold bg-blue-50/20">25 / month</td>
                  <td className="py-3 text-center text-[#17191C]">100 / month</td>
                  <td className="py-3 text-center text-[#17191C] font-semibold">Unlimited</td>
                </tr>

                {/* Support group */}
                <tr>
                  <td colSpan={5} className="py-3 font-bold text-gray-400 uppercase tracking-widest text-[9px] bg-gray-50/40 px-2">Support & Updates</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-[#17191C] px-2">Support SLA</td>
                  <td className="py-3 text-center text-[#626A73]">Self-serve / Community</td>
                  <td className="py-3 text-center text-[#17191C] font-semibold bg-blue-50/20">Email Standard</td>
                  <td className="py-3 text-center text-[#17191C]">Priority (24h)</td>
                  <td className="py-3 text-center text-[#17191C] font-semibold">Dedicated Slack/Chat</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto border-t border-[#E1E5E9] pt-16 text-left">
          <div className="text-center mb-10">
            <span className="text-[11px] font-extrabold tracking-widest text-[#0145F2] uppercase bg-[#E8EEFF] px-3.5 py-1.5 rounded-full inline-block mb-3">
              BILLING FAQ
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17191C] tracking-tight mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-[#626A73] text-sm leading-relaxed">
              Find instant answers to common questions about billing, subscriptions, downgrades, and payment safety.
            </p>
          </div>

          <div className="bg-white border border-[#E1E5E9] rounded-2xl overflow-hidden shadow-xs divide-y divide-[#ECEEF1]">
            {[
              {
                q: "Can I cancel my subscription?",
                a: "Yes, absolutely. You can cancel your subscription at any time instantly through your self-service customer billing portal. You will retain access until the end of your billing cycle."
              },
              {
                q: "Is there a refund policy?",
                a: "We offer a 14-day money-back guarantee for all subscription plans if you are unsatisfied with the features. Just drop us an email via support."
              },
              {
                q: "What happens to my assets if I downgrade?",
                a: "Your existing saved cards, shortened links, and link hubs will remain completely active and operational. However, you will only be able to create new assets once your totals fall below your downgraded plan limits."
              },
              {
                q: "Is payment processing secure?",
                a: "Extremely secure. All payments are processed through Dodo Payments, a premier global Merchant of Record. We never store or handle your credit card credentials directly."
              }
            ].map((faq, index) => {
              const isOpen = openPricingFaqIndex === index;
              return (
                <div key={index} className="group">
                  <button
                    type="button"
                    onClick={() => setOpenPricingFaqIndex(isOpen ? null : index)}
                    className="w-full py-4.5 px-6 sm:px-8 flex items-center justify-between text-[#17191C] hover:text-[#0145F2] font-bold text-sm sm:text-base transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 shrink-0 text-[#8D959F] transition-transform duration-200 ${isOpen ? "rotate-180 text-[#0145F2]" : ""}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pb-5 px-6 sm:px-8 text-xs sm:text-sm text-[#626A73] leading-relaxed font-normal whitespace-pre-line">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
