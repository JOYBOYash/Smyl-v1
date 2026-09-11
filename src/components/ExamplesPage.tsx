import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Eye, Copy, Award, ShieldAlert, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PresetExample {
  id: string;
  name: string;
  category: string;
  bgClass: string;
  theme: "light" | "dark";
  fontFamily: "sans" | "serif" | "mono";
  author: string;
  handle: string;
  avatar: string;
  content: string;
  date: string;
  engagement: {
    likes: string;
    reposts: string;
    replies: string;
  };
}

export const ExamplesPage: React.FC = () => {
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openExamplesFaqIndex, setOpenExamplesFaqIndex] = useState<number | null>(0);

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const examples: PresetExample[] = [
    {
      id: "preset-ocean",
      name: "Oceanic Brand Builder",
      category: "Professional / Corporate",
      bgClass: "bg-gradient-to-tr from-[#1E3A8A] via-[#3B82F6] to-[#60A5FA]",
      theme: "light",
      fontFamily: "sans",
      author: "Sarah Jenkins",
      handle: "sarah_growth",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80",
      content: "The single best marketing strategy is simple: deliver extreme value. Create content that answers specific user pain points, make it visually digestible, and distribute it where your customers already hang out. 📈",
      date: "Sep 10, 2026",
      engagement: { likes: "1,242", reposts: "148", replies: "56" }
    },
    {
      id: "preset-sunset",
      name: "Vibrant Creator Card",
      category: "Social Media / Creator",
      bgClass: "bg-gradient-to-tr from-[#ff7e5f] to-[#ec4899]",
      theme: "light",
      fontFamily: "serif",
      author: "Julien Mercer",
      handle: "julien_writes",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80",
      content: "Writing online isn't about finding your voice. It's about letting your voice find you. The more consistently you publish, the clearer your unique perspective becomes. Start small, write daily, be human.",
      date: "Sep 09, 2026",
      engagement: { likes: "892", reposts: "94", replies: "24" }
    },
    {
      id: "preset-cyber",
      name: "Midnight Developer Glow",
      category: "Technical / Engineering",
      bgClass: "bg-gradient-to-tr from-[#111827] via-[#311042] to-[#4c1d95]",
      theme: "dark",
      fontFamily: "mono",
      author: "Devon Ramirez",
      handle: "devon_codes",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&h=120&q=80",
      content: "const optimizeReach = (post) => {\n  const cleanVisual = post.renderWithSmyl();\n  const watermark = null;\n  return shareOnline(cleanVisual);\n};\n\n// 10x engagement boost loaded successfully",
      date: "Sep 08, 2026",
      engagement: { likes: "3,110", reposts: "412", replies: "82" }
    },
    {
      id: "preset-royal",
      name: "Royal Editorial Statement",
      category: "Blogging / Journalism",
      bgClass: "bg-gradient-to-tr from-[#1E1B4B] via-[#4338CA] to-[#818CF8]",
      theme: "dark",
      fontFamily: "serif",
      author: "Eleanor Vance",
      handle: "eleanor_v",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&h=120&q=80",
      content: "True craftsmanship means executing with absolute focus. No bloated sidebars, no unsolicited distractions. Visual clarity speaks volumes in an era of persistent sensory overload.",
      date: "Sep 07, 2026",
      engagement: { likes: "2,056", reposts: "311", replies: "99" }
    }
  ];

  const handleCopyPresetName = (preset: PresetExample) => {
    navigator.clipboard.writeText(preset.name);
    setCopiedId(preset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUsePreset = (preset: PresetExample) => {
    // Navigate to studio with parameters
    navigate("/tools/post-card-studio", {
      state: {
        presetAuthor: preset.author,
        presetHandle: preset.handle,
        presetAvatar: preset.avatar,
        presetContent: preset.content,
        presetBg: preset.id.replace("preset-", "gradient-"),
        presetTheme: preset.theme,
        presetFont: preset.fontFamily,
      }
    });
  };

  return (
    <div id="examples-page" className="bg-[#EDF1F5] min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8 text-left">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Back navigation */}
        <div id="examples-back-nav">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#626A73] hover:text-[#0145F2] font-semibold text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Hero Header */}
        <div id="examples-hero-header" className="space-y-4">
          <div className="flex items-center gap-2 text-[#0145F2]">
            <Award className="w-5 h-5 animate-pulse" />
            <span className="text-xs uppercase font-extrabold tracking-widest">Premium Gallery</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#17191C] tracking-[-0.03em] leading-tight">
            Design Showcase
          </h1>
          <p className="text-lg text-[#626A73] max-w-3xl leading-relaxed">
            Browse visually striking cards crafted inside Smyl. Explore how different fonts, themes, and background templates pair up to create absolute feed-stopping assets. Click any template to load it instantly in the Studio.
          </p>
        </div>

        {/* Grid of Examples */}
        <div id="examples-cards-grid" className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {examples.map((ex) => (
            <div
              key={ex.id}
              id={`examples-container-${ex.id}`}
              className="bg-white border border-[#E1E5E9] rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              {/* Actual Visual Card Preview Box */}
              <div className={`p-8 sm:p-10 ${ex.bgClass} flex items-center justify-center relative min-h-[360px]`}>
                {/* Simulated Social Post Card matching the real application */}
                <div
                  className={`w-full max-w-md rounded-2xl p-5 shadow-2xl border ${
                    ex.theme === "light"
                      ? "bg-white text-[#17191C] border-[#ECEEF1]/80"
                      : "bg-[#17191C] text-[#F3F4F6] border-[#31353F]/40"
                  }`}
                  style={{
                    fontFamily:
                      ex.fontFamily === "serif"
                        ? "'Playfair Display', Georgia, serif"
                        : ex.fontFamily === "mono"
                        ? "'Fira Code', monospace"
                        : "inherit",
                  }}
                >
                  {/* Header Row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={ex.avatar}
                        alt={ex.author}
                        className="w-9 h-9 rounded-full object-cover border border-[#E1E5E9]/50"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-left">
                        <p className="font-bold text-xs sm:text-sm leading-tight">{ex.author}</p>
                        <p className={`text-[10px] leading-tight ${ex.theme === "light" ? "text-[#626A73]" : "text-[#8D959F]"}`}>
                          @{ex.handle}
                        </p>
                      </div>
                    </div>
                    {/* Platform logo mock */}
                    <div className="shrink-0">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${ex.theme === "light" ? "bg-[#E8EEFF] text-[#0145F2]" : "bg-[#1F2937] text-[#3B82F6]"}`}>
                        {ex.handle.includes("codes") ? "X" : "In"}
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="text-xs sm:text-sm text-left leading-relaxed font-normal whitespace-pre-wrap mb-4">
                    {ex.content}
                  </div>

                  {/* Metadata & Stats Divider */}
                  <div className={`border-t pt-3 flex items-center justify-between text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                    ex.theme === "light" ? "border-[#ECEEF1] text-[#8D959F]" : "border-[#31353F]/40 text-[#626A73]"
                  }`}>
                    <div className="flex gap-4">
                      <span>{ex.engagement.likes} Likes</span>
                      <span>{ex.engagement.reposts} Reposts</span>
                    </div>
                    <span>{ex.date}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Controls */}
              <div className="p-6 border-t border-[#E1E5E9]/80 bg-[#FAFCFD] flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-[#17191C] text-sm">{ex.name}</p>
                  <p className="text-xs text-[#626A73] font-semibold">{ex.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyPresetName(ex)}
                    className="p-2.5 rounded-xl border border-[#D0D7DE] hover:bg-white text-[#626A73] hover:text-[#17191C] transition-all flex items-center justify-center shrink-0"
                    title="Copy design name"
                  >
                    {copiedId === ex.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUsePreset(ex)}
                    className="h-10 px-4 rounded-xl bg-[#0145F2] hover:bg-[#0039D4] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <span>Use Template</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* EXAMPLES / TEMPLATE FAQ SECTION */}
        <div className="mt-20 max-w-3xl mx-auto text-left">
          <div className="text-center mb-10">
            <span className="text-[11px] font-extrabold tracking-widest text-[#0145F2] uppercase bg-[#E8EEFF] px-3.5 py-1.5 rounded-full inline-block mb-3">
              TEMPLATE GUIDES
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17191C] tracking-tight mb-3">
              Design & Preset Templates FAQ
            </h2>
            <p className="text-[#626A73] text-sm leading-relaxed">
              Have questions about using, customizing, or saving these social sharing layout templates? We have answers.
            </p>
          </div>

          <div className="bg-white border border-[#E1E5E9] rounded-2xl overflow-hidden shadow-xs divide-y divide-[#ECEEF1]">
            {[
              {
                q: "How do I load one of these templates into the workspace?",
                a: "Simply click the 'Use Template' button on any card. This will instantly import the exact layout configuration, font families, custom colors, backgrounds, and sample structure into the primary generator, ready for your custom text."
              },
              {
                q: "Can I customize a template after importing it?",
                a: "Yes, absolutely! Templates act as creative launching pads. Once imported, you can modify the text content, switch themes, choose different fonts, adjust canvas backdrops, edit engagement metrics, or toggle verification status at any time."
              },
              {
                q: "Are the avatars and handles in the templates real profiles?",
                a: "No. The handles, names, and images displayed in the templates are premium placeholders designed to showcase how different aesthetic layouts accommodate various types of text length, line breaks, and formatting options."
              },
              {
                q: "Is it possible to save my own customized templates?",
                a: "Yes. If you are signed in, any card design you customize and export is automatically stored in your personal design library, allowing you to quickly reuse and iterate on your templates in future sessions."
              }
            ].map((faq, index) => {
              const isOpen = openExamplesFaqIndex === index;
              return (
                <div key={index} className="group">
                  <button
                    type="button"
                    onClick={() => setOpenExamplesFaqIndex(isOpen ? null : index)}
                    className="w-full py-4.5 px-6 sm:px-8 flex items-center justify-between text-left text-[#17191C] hover:text-[#0145F2] font-bold text-sm sm:text-base transition-colors cursor-pointer"
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
