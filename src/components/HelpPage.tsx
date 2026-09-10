import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, HelpCircle, ChevronDown, ChevronUp, BookOpen, Settings, Shield, Laptop } from "lucide-react";

interface HelpArticle {
  q: string;
  a: string;
  category: "general" | "customization" | "sharing" | "account";
}

export const HelpPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "general" | "customization" | "sharing" | "account">("all");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const articles: HelpArticle[] = [
    {
      q: "What is Smyl?",
      a: "Smyl is an editorial-first single workspace built for the link-sharing and social-sharing tasks you do every week. Create gorgeous visual cards, shorten URLs, generate QR codes, preview links, debug metadata, build UTMs, and capture webpages from one unified, watermark-free hub.",
      category: "general"
    },
    {
      q: "Do I need design skills to use Smyl?",
      a: "None at all. Smyl handles layout, contrast, font pairings, and safe-padding mathematically and automatically. Every visual asset you export looks clean, precise, and completely customized, even if you have zero design background.",
      category: "general"
    },
    {
      q: "Can I customize the visual cards?",
      a: "Yes! In the Post Card Studio, you can toggle between light and dark modes, choose premium background gradients (like our signature Ocean Blue), switch between editorial font styles, customize the content directly on the card, and toggle engagement stats on or off.",
      category: "customization"
    },
    {
      q: "How does the link shortener work?",
      a: "When you shorten a link inside Smyl, we build a beautiful short URL that tracks performance analytics securely. You can see live clicks and geographic metrics directly inside your dashboard without any complex trackers or third-party cookies.",
      category: "sharing"
    },
    {
      q: "Are there watermarks or hidden costs?",
      a: "None. All tools inside Smyl are completely free to use, and all exported cards and files are 100% watermark-free. We believe in providing premium white-label tools without locking features behind a paywall.",
      category: "general"
    },
    {
      q: "What are the benefits of creating a free account?",
      a: "A free account unlocks the capability to 'keep what you create'. All your customized post cards, shortened tracking links, generated QR vector codes, and Link Hub configurations are saved securely so you can edit, view, or export them anytime from any device.",
      category: "account"
    },
    {
      q: "How secure is my data in Smyl?",
      a: "We adhere strictly to industry-standard security protocols. Your private account details, saved templates, and custom links are securely isolated and encrypted. We do not sell user data to advertising networks.",
      category: "account"
    },
    {
      q: "Can I batch export multiple cards?",
      a: "Yes! Smyl features a Batch Export modal in the Studio that allows you to configure, queue, and download multiple personalized visual cards in one single action to save you time.",
      category: "customization"
    }
  ];

  const filteredArticles = articles.filter((art) => {
    const matchesSearch =
      art.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.a.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || art.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="help-page" className="bg-[#EDF1F5] min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8 text-left">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Back link */}
        <div id="help-back-nav">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#626A73] hover:text-[#0145F2] font-semibold text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Hero Header & Search */}
        <div id="help-hero-section" className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#17191C] tracking-[-0.03em] leading-tight">
              Smyl Help Center
            </h1>
            <p className="text-lg text-[#626A73] leading-relaxed max-w-2xl">
              Answers to common questions, technical tutorials, and resources to help you master social share visual design.
            </p>
          </div>

          {/* Interactive Search Bar */}
          <div id="help-search-wrapper" className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8D959F]" />
            <input
              type="text"
              placeholder="Search help questions, features, or tutorials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white border border-[#E1E5E9] rounded-2xl shadow-xs text-sm font-semibold text-[#17191C] placeholder-[#8D959F] focus:outline-hidden focus:border-[#0145F2] focus:ring-1 focus:ring-[#0145F2] transition-all"
            />
          </div>
        </div>

        {/* Categories Tab Bar */}
        <div id="help-categories-tabs" className="flex flex-wrap gap-2 border-b border-[#E1E5E9]/60 pb-4">
          {[
            { id: "all", label: "All Questions", icon: HelpCircle },
            { id: "general", label: "Getting Started", icon: BookOpen },
            { id: "customization", label: "Design & Customization", icon: Settings },
            { id: "sharing", label: "Short URLs & QR", icon: Laptop },
            { id: "account", label: "Security & Account", icon: Shield }
          ].map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id as any);
                  setOpenIndex(null);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#0145F2] text-white shadow-xs"
                    : "bg-white text-[#626A73] hover:text-[#17191C] border border-[#E1E5E9]/60 hover:bg-[#F5F7F9]"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Collapsible Accordion List */}
        <div id="help-articles-accordion" className="bg-white border border-[#E1E5E9] rounded-3xl overflow-hidden shadow-xs divide-y divide-[#ECEEF1]">
          {filteredArticles.length > 0 ? (
            filteredArticles.map((art, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={index} id={`help-item-${index}`} className="group">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-[#FCFDFE] transition-colors cursor-pointer"
                  >
                    <span className="font-extrabold text-[#17191C] text-base group-hover:text-[#0145F2] transition-colors tracking-tight">
                      {art.q}
                    </span>
                    <span className="text-[#8D959F] group-hover:text-[#0145F2] transition-colors shrink-0">
                      {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 text-sm sm:text-[15px] text-[#626A73] leading-relaxed font-medium bg-[#FAFCFD]">
                      {art.a}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-[#8D959F] font-semibold text-sm">
              No help articles found matching your criteria. Try adjusting your search query!
            </div>
          )}
        </div>

        {/* Still Need Help Box */}
        <div
          id="help-footer-card"
          className="bg-[#E8EEFF]/40 border border-[#0145F2]/10 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="font-extrabold text-[#17191C] text-lg">Still need assistance?</h3>
            <p className="text-sm text-[#626A73] font-medium max-w-md">
              Our support engineers and design advisors are available 24/7 to help you resolve any issues or create custom integrations.
            </p>
          </div>
          <a
            href="mailto:support@smyl.co"
            className="h-11 px-6 rounded-xl bg-[#0145F2] hover:bg-[#0039D4] text-white font-bold text-xs flex items-center gap-2 transition-all shrink-0 shadow-xs"
          >
            <span>Contact Support</span>
          </a>
        </div>

      </div>
    </div>
  );
};
