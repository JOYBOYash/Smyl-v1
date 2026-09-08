import React, { useState, useRef } from "react";
import { ParsedPost, CardCustomization, FontFamily, CardTheme, CanvasBackground } from "../types";
import { PLACEHOLDER_IMAGES } from "../constants/images";
import { PostCard } from "./PostCard";
import { CanvasWrapper } from "./CanvasWrapper";
import { SmylLogo, SmylTextLogo, SmylIcon, SmylHeaderLogo, SmylFooterLogo } from "./SmylLogo";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowRight, 
  Link as LinkIcon, 
  QrCode, 
  Eye, 
  Bug, 
  Compass, 
  Image as ImageIcon, 
  Settings, 
  FileText, 
  CheckCircle, 
  HelpCircle, 
  ChevronDown, 
  Check, 
  MousePointerClick,
  Info,
  Layers,
  Sparkles as DummySparkles
} from "lucide-react";
import { IoSunny, IoMoon, IoTerminal } from "react-icons/io5";

interface LandingPageProps {
  onOpenGenerator: (samplePost?: ParsedPost, customization?: Partial<CardCustomization>) => void;
  onBecomeUser: () => void;
  onTabChange?: (tab: string) => void;
}

const INITIAL_DEMO_X_POST: ParsedPost = {
  platform: "x",
  author: {
    name: "Alex Rivera",
    username: "@alexrivera",
    isVerified: true,
    avatarColor: "#0145F2",
    avatarText: "AR",
  },
  content: {
    text: "The best product design doesn't feel like design at all.\n\nIt feels like an obvious solution you wonder why nobody built before.\n\nSimple, focused, fast.",
    hashtags: ["design", "product"],
    mentions: [],
    links: [],
  },
  timestamp: "9:41 AM · Aug 24, 2026",
  engagement: {
    likes: 3840,
    comments: 215,
    reposts: 640,
    views: 128000,
  },
};

const INITIAL_DEMO_LINKEDIN_POST: ParsedPost = {
  platform: "linkedin",
  author: {
    name: "Elena Rostova",
    username: "VP of Product Strategy | Ex-Stripe",
    isVerified: true,
    avatarColor: "#0077B5",
    avatarText: "ER",
  },
  content: {
    text: "We analyzed 10,000 top-performing technical newsletters.\n\nThe #1 factor driving reader retention? Visual social proof.\n\nEmbedding raw text posts had 34% lower engagement compared to high-DPI styled post cards.",
    hashtags: ["productstrategy", "newsletters"],
    mentions: [],
    links: [],
  },
  timestamp: "3h ago",
  engagement: {
    likes: 1890,
    comments: 142,
    reposts: 88,
  },
};

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenGenerator, onBecomeUser, onTabChange }) => {
  // Interactive mini-demo state
  const [selectedPlatform, setSelectedPlatform] = useState<"x" | "linkedin">("x");
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>("light");
  const [selectedFont, setSelectedFont] = useState<FontFamily>("sans");
  const [selectedBg, setSelectedBg] = useState<CanvasBackground>("gradient-sunset");
  const [isDirectEdit, setIsDirectEdit] = useState(false);
  const [isHeroBgDropdownOpen, setIsHeroBgDropdownOpen] = useState(false);

  // Mouse tracking state for sleek responsive background blur
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDemoHovered, setIsDemoHovered] = useState(false);
  const demoContainerRef = useRef<HTMLDivElement>(null);

  const handleDemoMouseMove = (e: React.MouseEvent) => {
    if (!demoContainerRef.current) return;
    const rect = demoContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
  };

  // Editable post data
  const [xPostData, setXPostData] = useState<ParsedPost>(INITIAL_DEMO_X_POST);
  const [linkedInPostData, setLinkedInPostData] = useState<ParsedPost>(INITIAL_DEMO_LINKEDIN_POST);

  // Slider Position for Comparison (0 to 100)
  const [sliderPosition, setSliderPosition] = useState(50);
  const isDraggingRef = useRef(false);

  // Accordion FAQ states
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const currentPost = selectedPlatform === "x" ? xPostData : linkedInPostData;

  const handleUpdateCurrentPost = (updated: Partial<ParsedPost>) => {
    if (selectedPlatform === "x") {
      setXPostData((prev) => ({ ...prev, ...updated }));
    } else {
      setLinkedInPostData((prev) => ({ ...prev, ...updated }));
    }
  };

  const demoCustomization: CardCustomization = {
    platform: selectedPlatform,
    theme: selectedTheme,
    fontFamily: selectedFont,
    orientation: "auto",
    canvasBackground: selectedBg,
    canvasPadding: "32",
    showEngagement: true,
    showPlatformIcon: true,
    isEditable: isDirectEdit,
    borderRadius: "lg",
    shadowSize: "md",
  };

  const handleSliderMove = (clientX: number, rect: DOMRect) => {
    const x = clientX - rect.left;
    const percentage = Math.max(4, Math.min(96, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="w-full text-[#17191C] overflow-hidden bg-[#EDF1F5] font-sans antialiased">
      
      {/* SECTION 02 — HERO */}
      <section className="pt-16 pb-20 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          {/* Eyebrow - Pure Text tracking-wider, no pill badge */}
          <p className="text-brand-primary font-bold tracking-[0.15em] text-xs uppercase mb-3">
            SHARE BETTER
          </p>

          {/* Headline - Editorial Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#17191C] tracking-tight leading-[1.1] max-w-3xl mx-auto">
            Turn your links and content into something worth sharing.
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg md:text-xl text-[#626A73] font-normal leading-relaxed max-w-2xl mx-auto">
            Create polished shareable visuals, short links, QR codes and more — without switching between tools.
          </p>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto sm:max-w-none">
            <button
              type="button"
              onClick={() => onOpenGenerator()}
              className="w-full sm:w-auto h-12 px-8 rounded-xl bg-brand-primary text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-brand-hover active:bg-brand-pressed transition-all duration-150 cursor-pointer shadow-md shadow-brand-primary/15"
            >
              <span>Create with Smyl</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("how-it-works")}
              className="w-full sm:w-auto h-12 px-8 rounded-xl bg-white text-[#17191C] border border-[#E1E5E9] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#F5F7F9] hover:border-[#B9C0C8] active:bg-[#EEF1F4] transition-all duration-150 cursor-pointer shadow-xs"
            >
              <span>See how it works</span>
            </button>
          </div>

          {/* Security & Promise Indicators */}
          <div className="pt-2 text-[11px] font-semibold text-[#8D959F] flex flex-wrap items-center justify-center gap-2.5">
            <span>Free forever</span>
            <span className="text-[#C2C9D1]">•</span>
            <span>No watermark</span>
            <span className="text-[#C2C9D1]">•</span>
            <span>No credit card required</span>
          </div>
        </div>

        {/* HERO VISUAL: ACTUAL Smyl product UI interactive workspace */}
        <div className="mt-16 lg:mt-20 max-w-5xl mx-auto">
          <div className="text-center space-y-1 mb-6">
            <p className="text-xs font-bold text-[#8D959F] uppercase tracking-wider">Live Preview Workspace</p>
            <p className="text-xs text-[#626A73]">Click anything below to customize your actual output card</p>
          </div>
          
          <motion.div
            ref={demoContainerRef}
            onMouseMove={handleDemoMouseMove}
            onMouseEnter={() => setIsDemoHovered(true)}
            onMouseLeave={() => setIsDemoHovered(false)}
            className="relative overflow-hidden rounded-2xl border border-[#E1E5E9] shadow-lg bg-white p-4 sm:p-6 md:p-8"
          >
            {/* Interactive Controller Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#ECEEF1]">
              <div className="flex items-center gap-2.5 flex-wrap w-full justify-between sm:justify-start">
                
                {/* 1. Mode Selector */}
                <div className="flex items-center gap-1 bg-[#EDF1F5] p-1 rounded-xl relative">
                  <button
                    type="button"
                    onClick={() => setIsDirectEdit(false)}
                    className={`relative z-10 p-2 rounded-lg transition-colors cursor-pointer ${
                      !isDirectEdit ? "text-brand-primary font-bold" : "text-[#626A73] hover:text-[#17191C]"
                    }`}
                    title="Live Preview Mode"
                  >
                    {!isDirectEdit && (
                      <motion.div
                        layoutId="demo-mode-pill"
                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                        className="absolute inset-0 bg-white rounded-lg shadow-xs -z-10"
                      />
                    )}
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDirectEdit(true)}
                    className={`relative z-10 p-2 rounded-lg transition-colors cursor-pointer ${
                      isDirectEdit ? "text-brand-primary font-bold" : "text-[#626A73] hover:text-[#17191C]"
                    }`}
                    title="Direct Edit Mode"
                  >
                    {isDirectEdit && (
                      <motion.div
                        layoutId="demo-mode-pill"
                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                        className="absolute inset-0 bg-white rounded-lg shadow-xs -z-10"
                      />
                    )}
                    <FileText className="w-4 h-4" />
                  </button>
                </div>

                <div className="hidden sm:block h-6 w-[1px] bg-[#ECEEF1]" />

                {/* 2. Platform Selector */}
                <div className="flex items-center gap-1 bg-[#EDF1F5] p-1 rounded-xl relative">
                  <button
                    type="button"
                    onClick={() => setSelectedPlatform("x")}
                    className={`relative z-10 p-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      selectedPlatform === "x" ? "text-brand-primary" : "text-[#626A73]"
                    }`}
                  >
                    {selectedPlatform === "x" && (
                      <motion.div
                        layoutId="demo-platform-pill"
                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                        className="absolute inset-0 bg-white rounded-lg shadow-xs -z-10"
                      />
                    )}
                    X (Twitter)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPlatform("linkedin")}
                    className={`relative z-10 p-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      selectedPlatform === "linkedin" ? "text-brand-primary" : "text-[#626A73]"
                    }`}
                  >
                    {selectedPlatform === "linkedin" && (
                      <motion.div
                        layoutId="demo-platform-pill"
                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                        className="absolute inset-0 bg-white rounded-lg shadow-xs -z-10"
                      />
                    )}
                    LinkedIn
                  </button>
                </div>

                <div className="hidden sm:block h-6 w-[1px] bg-[#ECEEF1]" />

                {/* 3. Theme Selector */}
                <div className="flex items-center gap-1 bg-[#EDF1F5] p-1 rounded-xl relative">
                  <button
                    type="button"
                    onClick={() => setSelectedTheme("light")}
                    className={`relative z-10 p-2 rounded-lg transition-colors cursor-pointer ${
                      selectedTheme === "light" ? "text-brand-primary" : "text-[#626A73] hover:text-[#17191C]"
                    }`}
                    title="Light Theme"
                  >
                    {selectedTheme === "light" && (
                      <motion.div
                        layoutId="demo-theme-pill"
                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                        className="absolute inset-0 bg-white rounded-lg shadow-xs -z-10"
                      />
                    )}
                    <IoSunny className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTheme("dark")}
                    className={`relative z-10 p-2 rounded-lg transition-colors cursor-pointer ${
                      selectedTheme === "dark" ? "text-white" : "text-[#626A73] hover:text-[#17191C]"
                    }`}
                    title="Dark Theme"
                  >
                    {selectedTheme === "dark" && (
                      <motion.div
                        layoutId="demo-theme-pill"
                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                        className="absolute inset-0 bg-[#0A0D12] rounded-lg shadow-xs -z-10"
                      />
                    )}
                    <IoMoon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTheme("retro")}
                    className={`relative z-10 p-2 rounded-lg transition-colors cursor-pointer ${
                      selectedTheme === "retro" ? "text-cyan-300" : "text-[#626A73] hover:text-[#17191C]"
                    }`}
                    title="Retro Theme"
                  >
                    {selectedTheme === "retro" && (
                      <motion.div
                        layoutId="demo-theme-pill"
                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                        className="absolute inset-0 bg-[#0B0F19] ring-1 ring-cyan-400/50 rounded-lg shadow-xs -z-10"
                      />
                    )}
                    <IoTerminal className="w-4 h-4" />
                  </button>
                </div>

                <div className="hidden sm:block h-6 w-[1px] bg-[#ECEEF1]" />

                {/* 4. Font Selector */}
                <div className="relative">
                  <select
                    value={selectedFont}
                    onChange={(e) => setSelectedFont(e.target.value as FontFamily)}
                    className="h-8 pl-2.5 pr-6 text-xs font-semibold rounded-lg border border-[#E1E5E9] bg-white text-[#17191C] hover:bg-[#F8FAFC] focus:outline-none focus:border-brand-primary cursor-pointer appearance-none shadow-xs transition-colors"
                  >
                    <option value="sans">DM Sans</option>
                    <option value="inter">Inter</option>
                    <option value="display">Plus Jakarta</option>
                    <option value="serif">Lora Serif</option>
                    <option value="mono">JetBrains Mono</option>
                    <option value="space">Space Grotesk</option>
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-[#8D959F] flex items-center">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="hidden sm:block h-6 w-[1px] bg-[#ECEEF1]" />

                {/* 5. Backdrop Swatches */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsHeroBgDropdownOpen(!isHeroBgDropdownOpen)}
                    className="h-8 pl-2.5 pr-2 rounded-lg border border-[#E1E5E9] bg-white hover:bg-[#F8FAFC] flex items-center gap-1.5 shadow-xs cursor-pointer text-[#17191C] font-semibold text-xs transition-colors"
                  >
                    <div className={`w-3.5 h-3.5 rounded-full border border-black/10 flex-shrink-0 ${
                      selectedBg === "solid-white" ? "bg-white" :
                      selectedBg === "solid-dark" ? "bg-[#111418]" :
                      selectedBg === "gradient-sunset" ? "bg-gradient-to-tr from-[#ff7e5f] to-[#ec4899]" :
                      selectedBg === "gradient-ocean" ? "bg-gradient-to-tr from-[#00c6ff] to-[#3b82f6]" :
                      selectedBg === "gradient-twilight" ? "bg-gradient-to-tr from-[#0f172a] to-[#581c87]" :
                      selectedBg === "gradient-emerald" ? "bg-gradient-to-tr from-[#11998e] to-[#38ef7d]" : "bg-transparent border-dashed"
                    }`} />
                    <span className="hidden sm:inline">Backdrop</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#8D959F] flex-shrink-0" />
                  </button>

                  <AnimatePresence>
                    {isHeroBgDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsHeroBgDropdownOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -4 }}
                          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute right-0 mt-1.5 bg-white border border-[#E1E5E9] rounded-xl shadow-lg p-2.5 z-50 grid grid-cols-4 gap-2 w-48"
                        >
                          {[
                            { id: "none", color: "bg-transparent border border-dashed border-gray-300", label: "None" },
                            { id: "solid-white", color: "bg-white border border-[#E1E5E9]", label: "White" },
                            { id: "solid-dark", color: "bg-[#111418]", label: "Dark" },
                            { id: "gradient-sunset", color: "bg-gradient-to-tr from-[#ff7e5f] to-[#ec4899]", label: "Sunset" },
                            { id: "gradient-ocean", color: "bg-gradient-to-tr from-[#00c6ff] to-[#3b82f6]", label: "Ocean" },
                            { id: "gradient-twilight", color: "bg-gradient-to-tr from-[#0f172a] to-[#581c87]", label: "Twilight" },
                            { id: "gradient-emerald", color: "bg-gradient-to-tr from-[#11998e] to-[#38ef7d]", label: "Emerald" },
                          ].map((bg) => {
                            const isSel = selectedBg === bg.id;
                            return (
                              <button
                                key={bg.id}
                                type="button"
                                onClick={() => {
                                  setSelectedBg(bg.id as CanvasBackground);
                                  setIsHeroBgDropdownOpen(false);
                                }}
                                className={`w-8 h-8 rounded-full ${bg.color} transition-transform duration-200 hover:scale-110 active:scale-95 relative flex items-center justify-center cursor-pointer ${
                                  isSel ? "ring-2 ring-brand-primary ring-offset-2" : "opacity-90"
                                }`}
                                title={bg.label}
                              >
                                {isSel && <Check className="text-brand-primary bg-white rounded-full w-3.5 h-3.5 p-0.5" />}
                              </button>
                            );
                          })}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* In-Card Canvas */}
            <div className="p-3 sm:p-5 md:p-8 bg-[#EDF1F5] rounded-xl flex items-center justify-center min-h-[420px] overflow-hidden w-full transition-all duration-300 mt-4 relative">
              <CanvasWrapper background={demoCustomization.canvasBackground} padding={demoCustomization.canvasPadding}>
                <PostCard
                  post={currentPost}
                  customization={demoCustomization}
                  onUpdatePost={handleUpdateCurrentPost}
                />
              </CanvasWrapper>
            </div>

            {/* Action Bar Below Canvas */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#ECEEF1] mt-4">
              <div className="text-xs text-[#626A73] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse shrink-0" />
                <span>{isDirectEdit ? "Direct Edit Active: Type directly inside the card to modify." : "Live Customization: Customize typography and background colors instantly."}</span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-xs font-bold text-[#8D959F] hidden sm:inline">No limits • Safe download</span>
                <button
                  type="button"
                  onClick={() => onOpenGenerator(currentPost, demoCustomization)}
                  className="w-full sm:w-auto h-11 px-6 rounded-xl bg-brand-primary text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-brand-hover active:bg-brand-pressed transition-all duration-150 cursor-pointer shadow-xs shrink-0"
                >
                  <span>Open in Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 03 — HOW SMYL WORKS */}
      <section id="how-it-works" className="py-20 sm:py-24 bg-white border-y border-[#E1E5E9]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Headers - Clean centered, no category badges */}
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17191C] tracking-tight">
              How Smyl Works
            </h2>
            <p className="text-base text-[#626A73]">
              From your original content to something ready to share.
            </p>
          </div>

          {/* Three horizontal cards layout with subtle lifts and real simplified UI preview elements */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            
            {/* Step 1 */}
            <div className="bg-[#EDF1F5]/50 border border-[#E1E5E9]/60 rounded-2xl p-6 md:p-8 flex flex-col justify-between hover:shadow-md hover:border-brand-primary/20 transition-all duration-200 group">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-brand-primary text-white font-bold flex items-center justify-center text-sm">
                  01
                </div>
                <h3 className="font-bold text-lg text-[#17191C] group-hover:text-brand-primary transition-colors">Add your content</h3>
                <p className="text-sm text-[#626A73] leading-relaxed">
                  Paste a link, post or piece of content into Smyl.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#E1E5E9]/40">
                {/* Real UI Mockup Preview */}
                <div className="w-full bg-white rounded-xl p-3 border border-[#E1E5E9] text-left pointer-events-none shadow-xs">
                  <div className="h-2 w-1/3 bg-[#B0B6BD] rounded mb-2.5" />
                  <div className="bg-[#EDF1F5] rounded-lg p-2.5 border border-[#ECEEF1] text-[10px] text-[#626A73] flex items-center gap-1.5 font-mono truncate">
                    <LinkIcon className="w-3 h-3 text-brand-primary shrink-0" />
                    <span>https://x.com/design/status/184...</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#EDF1F5]/50 border border-[#E1E5E9]/60 rounded-2xl p-6 md:p-8 flex flex-col justify-between hover:shadow-md hover:border-brand-primary/20 transition-all duration-200 group">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-brand-primary text-white font-bold flex items-center justify-center text-sm">
                  02
                </div>
                <h3 className="font-bold text-lg text-[#17191C] group-hover:text-brand-primary transition-colors">Make it yours</h3>
                <p className="text-sm text-[#626A73] leading-relaxed">
                  Choose the format and customize how it looks.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#E1E5E9]/40">
                {/* Real UI Mockup Preview */}
                <div className="w-full bg-white rounded-xl p-3 border border-[#E1E5E9] pointer-events-none flex flex-col gap-2.5 shadow-xs">
                  <div className="flex gap-1 justify-center">
                    <span className="px-2 py-0.5 text-[9px] bg-brand-soft border border-brand-primary/20 font-bold rounded text-brand-primary">Light</span>
                    <span className="px-2 py-0.5 text-[9px] bg-[#111418] text-white font-semibold rounded">Dark</span>
                    <span className="px-2 py-0.5 text-[9px] bg-[#0B0F19] border border-cyan-400/20 text-cyan-400 font-semibold rounded">Retro</span>
                  </div>
                  <div className="flex gap-1.5 justify-center">
                    <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-[#ff7e5f] to-[#ec4899]" />
                    <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-[#00c6ff] to-[#3b82f6]" />
                    <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-[#0f172a] to-[#581c87]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#EDF1F5]/50 border border-[#E1E5E9]/60 rounded-2xl p-6 md:p-8 flex flex-col justify-between hover:shadow-md hover:border-brand-primary/20 transition-all duration-200 group">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-brand-primary text-white font-bold flex items-center justify-center text-sm">
                  03
                </div>
                <h3 className="font-bold text-lg text-[#17191C] group-hover:text-brand-primary transition-colors">Share it</h3>
                <p className="text-sm text-[#626A73] leading-relaxed">
                  Export, copy or share your finished result.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#E1E5E9]/40">
                {/* Real UI Mockup Preview */}
                <div className="w-full bg-white rounded-xl p-3 border border-[#E1E5E9] pointer-events-none flex flex-col gap-2 shadow-xs">
                  <div className="bg-[#EDF1F5] rounded-lg p-2 border border-[#ECEEF1] flex items-center justify-between text-[10px] font-bold text-[#17191C]">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-brand-primary" /> PNG Complete
                    </span>
                    <span className="text-[9px] text-[#626A73] bg-white border border-[#E1E5E9] px-1.5 py-0.5 rounded">Saved</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 04 — UTILITY INTRODUCTION */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="max-w-3xl mx-auto space-y-4">
          <p className="text-brand-primary font-bold tracking-[0.15em] text-xs uppercase mb-1">
            UTILITIES
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#17191C] tracking-tight">
            Everything you need to share a link better.
          </h2>
          <p className="text-base sm:text-lg text-[#626A73] leading-relaxed max-w-2xl mx-auto font-normal">
            Shorten it. Track it. Preview it. Turn it into a QR code. Build a shareable destination. Smyl keeps the tools you need in one place.
          </p>
        </div>
      </section>

      {/* SECTION 05 — UTILITY SHOWCASE (Alternating Left/Right Feature Sections) */}
      <section id="utilities-showcase" className="w-full bg-white border-y border-[#E1E5E9]/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 sm:space-y-32 lg:space-y-40 my-16">
          
          {/* UTILITY 01 — Link Shortener */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Visual on Left */}
            <div className="lg:col-span-6 w-full bg-[#EDF1F5] rounded-2xl p-6 sm:p-10 border border-[#E1E5E9]/70 flex items-center justify-center min-h-[300px]">
              <div className="w-full max-w-md bg-white border border-[#E1E5E9] rounded-2xl p-5 shadow-sm space-y-4 pointer-events-none">
                <div className="flex gap-2">
                  <div className="bg-[#EDF1F5] text-[10px] font-mono px-3 py-2 rounded-lg border border-[#ECEEF1] truncate flex-grow">
                    https://mywebsite.com/products/summer-sale?utm_source=newsletter
                  </div>
                  <span className="px-3.5 py-2 bg-brand-primary text-white text-[10px] font-bold rounded-lg flex items-center shrink-0">Shorten</span>
                </div>
                <div className="pt-3 border-t border-[#ECEEF1] flex items-center justify-between">
                  <span className="font-bold text-xs text-brand-primary font-mono">smyl.co/summer-sale</span>
                  <span className="text-[9px] bg-brand-soft text-brand-primary font-bold px-2 py-1 rounded-lg border border-brand-primary/10">Copy Link</span>
                </div>
              </div>
            </div>
            {/* Text on Right */}
            <div className="lg:col-span-6 space-y-4 lg:pl-6 text-left">
              <p className="text-xs font-bold text-brand-primary tracking-widest uppercase">Utility 01</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#17191C] leading-tight">Make long links easier to share.</h3>
              <p className="text-sm sm:text-base text-[#626A73] leading-relaxed">
                Turn long URLs into clean, memorable Smyl links.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onTabChange?.("shortener")}
                  className="h-10 px-5 rounded-lg bg-[#EDF1F5] text-brand-primary font-bold text-xs hover:bg-[#E8EEFF] transition-all duration-150 inline-flex items-center gap-1.5 cursor-pointer border border-[#E1E5E9]/60"
                >
                  <span>Shorten a link</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* UTILITY 02 — QR Generator (Alternating) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Text on Left */}
            <div className="grid order-2 lg:order-1 lg:col-span-6 space-y-4 lg:pr-6 text-left">
              <p className="text-xs font-bold text-brand-primary tracking-widest uppercase">Utility 02</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#17191C] leading-tight">Turn any link into a QR code.</h3>
              <p className="text-sm sm:text-base text-[#626A73] leading-relaxed">
                Create a clean QR code ready for digital or physical sharing.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onTabChange?.("qr")}
                  className="h-10 px-5 rounded-lg bg-[#EDF1F5] text-brand-primary font-bold text-xs hover:bg-[#E8EEFF] transition-all duration-150 inline-flex items-center gap-1.5 cursor-pointer border border-[#E1E5E9]/60"
                >
                  <span>Create a QR code</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {/* Visual on Right */}
            <div className="order-1 lg:order-2 lg:col-span-6 w-full bg-[#EDF1F5] rounded-2xl p-6 sm:p-10 border border-[#E1E5E9]/70 flex items-center justify-center min-h-[300px]">
              <div className="w-36 h-36 bg-white border border-[#E1E5E9] rounded-2xl p-4 shadow-sm flex items-center justify-center relative pointer-events-none">
                {/* Simplified Crisp QR representation with clean dots */}
                <div className="w-full h-full border border-[#E1E5E9] rounded-lg p-2 bg-[#EDF1F5]/30 flex flex-col justify-between">
                  <div className="flex justify-between">
                    <span className="w-5 h-5 border-2 border-brand-primary rounded" />
                    <span className="w-5 h-5 border-2 border-brand-primary rounded" />
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="w-5 h-5 border-2 border-brand-primary rounded" />
                    <span className="w-4 h-4 bg-brand-primary rounded-xs" />
                  </div>
                </div>
                <span className="absolute bottom-[-10px] right-3 bg-[#E8EEFF] border border-brand-primary/20 text-brand-primary text-[8px] font-bold px-2 py-0.5 rounded-full">HQ Vector SVG</span>
              </div>
            </div>
          </div>

          {/* UTILITY 03 — Link Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Visual on Left */}
            <div className="lg:col-span-6 w-full bg-[#EDF1F5] rounded-2xl p-6 sm:p-10 border border-[#E1E5E9]/70 flex items-center justify-center min-h-[300px]">
              <div className="w-full max-w-md bg-white border border-[#E1E5E9] rounded-xl overflow-hidden shadow-sm pointer-events-none">
                <div className="h-28 w-full bg-[#17191C]/5 flex items-center justify-center text-[#B0B6BD] border-b border-[#E1E5E9]">
                  <ImageIcon className="w-8 h-8 opacity-40" />
                </div>
                <div className="p-4 space-y-1.5 text-left">
                  <span className="text-[10px] font-bold text-brand-primary tracking-wide">SMYL.CO</span>
                  <h4 className="font-bold text-xs text-[#17191C] truncate">Announcing Smyl v1.2 — High performance sharing tools</h4>
                  <p className="text-[10px] text-[#626A73] line-clamp-2 leading-relaxed">Customize presentation metadata in real time without making updates inside the database.</p>
                </div>
              </div>
            </div>
            {/* Text on Right */}
            <div className="lg:col-span-6 space-y-4 lg:pl-6 text-left">
              <p className="text-xs font-bold text-brand-primary tracking-widest uppercase">Utility 03</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#17191C] leading-tight">See how your link will look before you share it.</h3>
              <p className="text-sm sm:text-base text-[#626A73] leading-relaxed">
                Preview the title, description, image and social presentation of a link.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onTabChange?.("preview")}
                  className="h-10 px-5 rounded-lg bg-[#EDF1F5] text-brand-primary font-bold text-xs hover:bg-[#E8EEFF] transition-all duration-150 inline-flex items-center gap-1.5 cursor-pointer border border-[#E1E5E9]/60"
                >
                  <span>Preview a link</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* UTILITY 04 — Open Graph Debugger (Alternating) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Text on Left */}
            <div className="grid order-2 lg:order-1 lg:col-span-6 space-y-4 lg:pr-6 text-left">
              <p className="text-xs font-bold text-brand-primary tracking-widest uppercase">Utility 04</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#17191C] leading-tight">Know exactly what your link is sending.</h3>
              <p className="text-sm sm:text-base text-[#626A73] leading-relaxed">
                Inspect the metadata behind your social previews and identify missing information.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onTabChange?.("ogdebug")}
                  className="h-10 px-5 rounded-lg bg-[#EDF1F5] text-brand-primary font-bold text-xs hover:bg-[#E8EEFF] transition-all duration-150 inline-flex items-center gap-1.5 cursor-pointer border border-[#E1E5E9]/60"
                >
                  <span>Inspect a link</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {/* Visual on Right */}
            <div className="order-1 lg:order-2 lg:col-span-6 w-full bg-[#EDF1F5] rounded-2xl p-6 sm:p-10 border border-[#E1E5E9]/70 flex items-center justify-center min-h-[300px]">
              <div className="w-full max-w-sm bg-white border border-[#E1E5E9] rounded-xl p-4 shadow-sm space-y-3 pointer-events-none text-left">
                <span className="text-[10px] font-bold text-[#8D959F] uppercase tracking-wider">OG Tags Inspection</span>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] p-2 bg-[#EDF1F5]/40 rounded-lg border border-[#ECEEF1]">
                    <span className="font-mono text-[#626A73]">og:title</span>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Prisinte</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] p-2 bg-[#EDF1F5]/40 rounded-lg border border-[#ECEEF1]">
                    <span className="font-mono text-[#626A73]">og:image</span>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Available</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] p-2 bg-[#EDF1F5]/40 rounded-lg border border-[#ECEEF1]">
                    <span className="font-mono text-[#626A73]">og:description</span>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* UTILITY 05 — UTM Builder */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Visual on Left */}
            <div className="lg:col-span-6 w-full bg-[#EDF1F5] rounded-2xl p-6 sm:p-10 border border-[#E1E5E9]/70 flex items-center justify-center min-h-[300px]">
              <div className="w-full max-w-sm bg-white border border-[#E1E5E9] rounded-xl p-4 shadow-sm space-y-3 pointer-events-none text-left">
                <span className="text-[10px] font-bold text-[#8D959F] uppercase tracking-wider">Parameter Builder</span>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="border border-[#ECEEF1] rounded-lg p-2">
                    <span className="block text-[#8D959F] mb-1">Source</span>
                    <span className="font-bold text-[#17191C]">newsletter</span>
                  </div>
                  <div className="border border-[#ECEEF1] rounded-lg p-2">
                    <span className="block text-[#8D959F] mb-1">Medium</span>
                    <span className="font-bold text-[#17191C]">email</span>
                  </div>
                  <div className="border border-[#ECEEF1] rounded-lg p-2 col-span-2">
                    <span className="block text-[#8D959F] mb-1">Campaign</span>
                    <span className="font-bold text-[#17191C]">sept_promo_launch</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Text on Right */}
            <div className="lg:col-span-6 space-y-4 lg:pl-6 text-left">
              <p className="text-xs font-bold text-brand-primary tracking-widest uppercase">Utility 05</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#17191C] leading-tight">Build campaign links without the manual work.</h3>
              <p className="text-sm sm:text-base text-[#626A73] leading-relaxed">
                Add clean UTM parameters to your URLs and keep campaign links organized.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onTabChange?.("utm")}
                  className="h-10 px-5 rounded-lg bg-[#EDF1F5] text-brand-primary font-bold text-xs hover:bg-[#E8EEFF] transition-all duration-150 inline-flex items-center gap-1.5 cursor-pointer border border-[#E1E5E9]/60"
                >
                  <span>Build a UTM link</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* UTILITY 06 — Link Hub (Alternating) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Text on Left */}
            <div className="grid order-2 lg:order-1 lg:col-span-6 space-y-4 lg:pr-6 text-left">
              <p className="text-xs font-bold text-[#0145F2] tracking-widest uppercase">Utility 06</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#17191C] leading-tight">Put everything you share in one place.</h3>
              <p className="text-sm sm:text-base text-[#626A73] leading-relaxed">
                Create a simple Smyl destination for the links your audience needs.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onTabChange?.("hubs")}
                  className="h-10 px-5 rounded-lg bg-[#EDF1F5] text-[#0145F2] font-bold text-xs hover:bg-[#E8EEFF] transition-all duration-150 inline-flex items-center gap-1.5 cursor-pointer border border-[#E1E5E9]/60"
                >
                  <span>Create a link hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {/* Visual on Right */}
            <div className="order-1 lg:order-2 lg:col-span-6 w-full bg-[#EDF1F5] rounded-2xl p-6 sm:p-10 border border-[#E1E5E9]/70 flex items-center justify-center min-h-[300px]">
              <div className="w-48 bg-white border border-[#E1E5E9] rounded-2xl p-4 shadow-sm space-y-3 pointer-events-none text-center">
                <div className="w-10 h-10 bg-brand-primary rounded-full mx-auto flex items-center justify-center text-white text-[10px] font-bold">AR</div>
                <div>
                  <h5 className="font-bold text-[11px] text-[#17191C]">Alex Rivera</h5>
                  <p className="text-[8px] text-[#8D959F]">smyl.co/alexrivera</p>
                </div>
                <div className="space-y-1.5 pt-2">
                  <div className="w-full py-1.5 border border-[#E1E5E9] rounded-lg text-[9px] font-bold text-[#17191C] bg-[#EDF1F5]/20">Latest Portfolio</div>
                  <div className="w-full py-1.5 border border-[#E1E5E9] rounded-lg text-[9px] font-bold text-[#17191C] bg-[#EDF1F5]/20">Read the Blog</div>
                  <div className="w-full py-1.5 border border-[#E1E5E9] rounded-lg text-[9px] font-bold text-[#17191C] bg-[#EDF1F5]/20">My Course</div>
                </div>
              </div>
            </div>
          </div>

          {/* UTILITY 07 — Screenshot Generator */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Visual on Left */}
            <div className="lg:col-span-6 w-full bg-[#EDF1F5] rounded-2xl p-6 sm:p-10 border border-[#E1E5E9]/70 flex items-center justify-center min-h-[300px]">
              <div className="w-full max-w-xs bg-white border border-[#E1E5E9] rounded-lg overflow-hidden shadow-sm pointer-events-none text-left">
                <div className="h-4 bg-[#EDF1F5] border-b border-[#E1E5E9] px-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <div className="p-3 bg-[#EDF1F5]/20 space-y-2">
                  <div className="h-10 bg-[#EDF1F5] rounded" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-16 bg-[#EDF1F5] rounded" />
                    <div className="h-16 bg-[#EDF1F5] rounded" />
                  </div>
                </div>
              </div>
            </div>
            {/* Text on Right */}
            <div className="lg:col-span-6 space-y-4 lg:pl-6 text-left">
              <p className="text-xs font-bold text-brand-primary tracking-widest uppercase">Utility 07</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#17191C] leading-tight">Turn a webpage into something you can share.</h3>
              <p className="text-sm sm:text-base text-[#626A73] leading-relaxed">
                Capture a clean screenshot of a public webpage for posts, presentations and campaigns.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onTabChange?.("screenshot")}
                  className="h-10 px-5 rounded-lg bg-[#EDF1F5] text-brand-primary font-bold text-xs hover:bg-[#E8EEFF] transition-all duration-150 inline-flex items-center gap-1.5 cursor-pointer border border-[#E1E5E9]/60"
                >
                  <span>Capture a webpage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 06 — SMYL IN ACTION (Staggered Collection Grid) */}
      <section id="smyl-in-action" className="py-20 sm:py-24 bg-[#EDF1F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Heading */}
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <p className="text-brand-primary font-bold tracking-[0.15em] text-xs uppercase mb-1">
              GALLERY
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17191C] tracking-tight">
              One tool. More ways to share.
            </h2>
            <p className="text-base text-[#626A73]">
              Discover real high-fidelity artifacts created with Smyl.
            </p>
          </div>

          {/* Staggered Grid Compositions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto items-start">
            
            {/* Artifact 1: X Post card */}
            <div className="bg-white border border-[#E1E5E9] rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-primary text-white text-xs font-bold flex items-center justify-center">AR</div>
                  <div>
                    <h5 className="font-bold text-xs text-[#17191C]">Alex Rivera</h5>
                    <p className="text-[10px] text-[#626A73]">@alexrivera</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-[#EDF1F5] text-[#17191C] px-2 py-0.5 rounded">X Post</span>
              </div>
              <p className="text-xs text-[#17191C] leading-relaxed">
                Simple, focused, and incredibly responsive. This is how link sharing was always meant to be.
              </p>
              <div className="pt-3 border-t border-[#ECEEF1] flex items-center justify-between text-[10px] text-[#8D959F]">
                <span>9:41 AM</span>
                <span className="font-semibold text-brand-primary">Styled Card</span>
              </div>
            </div>

            {/* Artifact 2: LinkedIn Post card */}
            <div className="bg-white border border-[#E1E5E9] rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">ER</div>
                  <div>
                    <h5 className="font-bold text-xs text-[#17191C]">Elena Rostova</h5>
                    <p className="text-[10px] text-[#626A73]">VP of Strategy</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">LinkedIn</span>
              </div>
              <p className="text-xs text-[#17191C] leading-relaxed font-serif">
                Visual proof matters more than text posts. High-resolution social cards are driving 34% more responses for tech brands.
              </p>
              <div className="pt-3 border-t border-[#ECEEF1] flex items-center justify-between text-[10px] text-[#8D959F]">
                <span>3h ago</span>
                <span className="font-semibold text-indigo-600">Premium Style</span>
              </div>
            </div>

            {/* Artifact 3: Short URL card */}
            <div className="bg-white border border-[#E1E5E9] rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary">Short Link</span>
                <span className="text-[9px] bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded">Active</span>
              </div>
              <div className="bg-[#EDF1F5] rounded-xl p-3 border border-[#E1E5E9]/50 text-left">
                <p className="text-[10px] text-[#8D959F]">Original: mylongbrandlink.com/campaign...</p>
                <p className="text-sm font-bold text-brand-primary font-mono mt-1">smyl.co/campaign-hq</p>
              </div>
              <div className="flex items-center justify-between pt-1 text-[10px] text-[#626A73]">
                <span>Clicks tracked</span>
                <span className="font-bold text-[#17191C]">4,821 clicks</span>
              </div>
            </div>

            {/* Artifact 4: QR Code card */}
            <div className="bg-white border border-[#E1E5E9] rounded-2xl p-5 shadow-xs flex flex-col items-center space-y-4">
              <span className="text-[10px] font-bold text-[#8D959F] uppercase tracking-wider self-start">Interactive QR</span>
              <div className="w-28 h-28 bg-[#EDF1F5]/40 border border-[#E1E5E9] rounded-xl p-3 flex items-center justify-center">
                <div className="w-full h-full border border-brand-primary/20 rounded bg-white p-1.5 flex flex-col justify-between">
                  <div className="flex justify-between">
                    <span className="w-3 h-3 border border-brand-primary rounded-xs" />
                    <span className="w-3 h-3 border border-brand-primary rounded-xs" />
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="w-3 h-3 border border-brand-primary rounded-xs" />
                    <span className="w-2.5 h-2.5 bg-brand-primary rounded-3xs" />
                  </div>
                </div>
              </div>
              <p className="text-[11px] font-mono text-[#626A73]">smyl.co/download-app</p>
            </div>

            {/* Artifact 5: Rich Link Preview Card */}
            <div className="bg-white border border-[#E1E5E9] rounded-2xl overflow-hidden shadow-xs space-y-0">
              <div className="h-24 bg-[#17191C]/5 flex items-center justify-center text-[#B0B6BD]">
                <Layers className="w-6 h-6 opacity-40" />
              </div>
              <div className="p-4 space-y-1 text-left">
                <span className="text-[9px] font-bold text-[#8D959F] uppercase tracking-wider">Link Preview</span>
                <h5 className="font-bold text-xs text-[#17191C] truncate">Design system constraints & rules</h5>
                <p className="text-[10px] text-[#626A73] line-clamp-1">A detailed guide to building scalable React platforms.</p>
              </div>
            </div>

            {/* Artifact 6: UTM Builder Output */}
            <div className="bg-white border border-[#E1E5E9] rounded-2xl p-5 shadow-xs space-y-3">
              <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">Campaign Built</span>
              <div className="bg-[#EDF1F5] rounded-xl p-3 text-[10px] font-mono text-[#626A73] leading-relaxed break-all border border-[#E1E5E9]/50">
                https://brand.co?utm_source=<span className="text-[#0145F2] font-bold">newsletter</span>&utm_medium=<span className="text-[#0145F2] font-bold">email</span>&utm_campaign=<span className="text-[#0145F2] font-bold">weekly</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 07 — WHO IT IS FOR */}
      <section className="py-20 sm:py-24 bg-white border-y border-[#E1E5E9]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Heading */}
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <p className="text-brand-primary font-bold tracking-[0.15em] text-xs uppercase mb-1">
              AUDIENCE
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17191C] tracking-tight">
              Built for people who already share online.
            </h2>
          </div>

          {/* 4 Compact Audiences */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            
            <div className="bg-[#EDF1F5]/40 border border-[#E1E5E9]/50 rounded-xl p-6 text-left hover:border-brand-primary/20 hover:shadow-xs transition-all">
              <h4 className="font-bold text-base text-[#17191C] mb-2">Creators</h4>
              <p className="text-xs text-[#626A73] leading-relaxed">
                Turn posts and ideas into polished visuals.
              </p>
            </div>

            <div className="bg-[#EDF1F5]/40 border border-[#E1E5E9]/50 rounded-xl p-6 text-left hover:border-brand-primary/20 hover:shadow-xs transition-all">
              <h4 className="font-bold text-base text-[#17191C] mb-2">Founders</h4>
              <p className="text-xs text-[#626A73] leading-relaxed">
                Share launches, updates and important links clearly.
              </p>
            </div>

            <div className="bg-[#EDF1F5]/40 border border-[#E1E5E9]/50 rounded-xl p-6 text-left hover:border-brand-primary/20 hover:shadow-xs transition-all">
              <h4 className="font-bold text-base text-[#17191C] mb-2">Marketers</h4>
              <p className="text-xs text-[#626A73] leading-relaxed">
                Create campaign-ready links and content faster.
              </p>
            </div>

            <div className="bg-[#EDF1F5]/40 border border-[#E1E5E9]/50 rounded-xl p-6 text-left hover:border-brand-primary/20 hover:shadow-xs transition-all">
              <h4 className="font-bold text-base text-[#17191C] mb-2">Teams</h4>
              <p className="text-xs text-[#626A73] leading-relaxed">
                Keep everyday sharing tools in one place.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 08 — FAQ */}
      <section id="faq" className="py-20 sm:py-24 max-w-3xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="text-center space-y-2">
          <p className="text-brand-primary font-bold tracking-[0.15em] text-xs uppercase mb-1">
            FAQ
          </p>
          <h2 className="text-3xl font-extrabold text-[#17191C] tracking-tight">
            Questions, answered.
          </h2>
        </div>

        {/* Accordion List with clean Dividers */}
        <div className="divide-y divide-[#ECEEF1] border-y border-[#ECEEF1]">
          {[
            {
              q: "What is Smyl?",
              a: "Smyl is a single workspace built for the link-sharing and social-sharing tasks you do every week. Create visual cards, shorten URLs, generate QR codes, preview links, debug metadata, build UTMs, and capture webpages from one place."
            },
            {
              q: "Do I need design skills to use Smyl?",
              a: "None at all. Smyl handles layout, contrast, font pairings, and safe-padding automatically so everything you output looks like it was created by a designer."
            },
            {
              q: "Can I customize my visual cards?",
              a: "Yes. You can change themes (light, dark, retro), pick background gradients, customize font styles, toggle engagement stats, and edit the text directly on the card."
            },
            {
              q: "How do the link tools work?",
              a: "Every link you shorten or turn into a QR code is tracked securely. You can see real-time clicks, preview how links will render on social networks, and generate clean UTM campaigns."
            },
            {
              q: "Are there watermark or credit card requirements?",
              a: "None. All tools are completely free to use, and all exported cards and files are 100% watermark-free. You do not need a credit card to create an account."
            },
            {
              q: "What are the benefits of creating a free account?",
              a: "A free account lets you \"keep what you create.\" All your cards, custom links, QR codes, and Link Hubs are saved securely so you can access, edit, or re-download them anytime from any device."
            }
          ].map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="py-5 transition-colors">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left flex items-center justify-between gap-4 transition-colors cursor-pointer group"
                >
                  <span className="font-bold text-base sm:text-lg text-[#17191C] group-hover:text-brand-primary transition-colors">
                    {faq.q}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#626A73] hover:bg-[#F5F7F9] transition-colors flex-shrink-0"
                  >
                    <ChevronDown className={`w-4 h-4 ${isOpen ? "text-brand-primary" : ""}`} />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="faq-content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 pr-10 text-xs sm:text-sm text-[#626A73] leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 09 — FINAL CTA */}
      <section className="py-14 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="bg-brand-primary rounded-3xl p-8 sm:p-12 md:p-14 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-lg relative overflow-hidden"
        >
          {/* Subtle Background Icon Accent */}
          <div className="absolute right-[-10%] bottom-[-20%] md:right-[-5%] md:bottom-[-10%] opacity-15 pointer-events-none select-none">
            <SmylIcon className="h-64 sm:h-80 md:h-96 w-auto" variant="white" />
          </div>

          <div className="space-y-4 max-w-lg text-center md:text-left z-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Your next share starts with Smyl.
            </h2>
            <p className="text-sm sm:text-base text-white/95 leading-relaxed max-w-md">
              Create, customize and share from one simple workspace.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onOpenGenerator()}
                className="w-full sm:w-auto h-11 px-7 rounded-xl bg-white text-brand-primary font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-[#F5F7F9] active:bg-[#EEF1F4] transition-all duration-150 cursor-pointer shadow-md"
              >
                <span>Create with Smyl</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Product Preview Mockup Visual */}
          <img
            src={PLACEHOLDER_IMAGES.comparison.after}
            alt="Smyl Card Preview"
            className="relative z-10 w-full max-w-[320px] h-[200px] rounded-2xl border border-white/25 shadow-xl flex-shrink-0 object-cover"
          />
        </motion.div>
      </section>

      {/* SECTION 10 — FOOTER */}
      <footer className="py-12 bg-white border-t border-[#E1E5E9]/80 text-xs text-[#626A73]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-8 border-b border-[#ECEEF1]">
            
            {/* Logo and Copyright Column */}
            <div className="col-span-2 space-y-4 text-left">
              <SmylFooterLogo className="h-5 w-auto" variant="brand" />
              <p className="text-xs text-[#8D959F] leading-relaxed max-w-xs">
                A single elegant workspace for the link-sharing and social visual creation jobs you do every week.
              </p>
              <p className="text-xs text-[#8D959F]">© 2026 Smyl. All rights reserved.</p>
            </div>

            {/* Column 2: Product */}
            <div className="space-y-3 text-left">
              <h5 className="font-bold text-[#17191C] uppercase tracking-wider text-[10px]">Product</h5>
              <ul className="space-y-2 font-medium">
                <li>
                  <button 
                    type="button" 
                    onClick={() => onOpenGenerator()} 
                    className="hover:text-brand-primary transition-colors cursor-pointer"
                  >
                    Studio Customizer
                  </button>
                </li>
                <li>
                  <button 
                    type="button" 
                    onClick={() => onTabChange?.("history")} 
                    className="hover:text-brand-primary transition-colors cursor-pointer"
                  >
                    Saved Templates
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Utilities */}
            <div className="space-y-3 text-left">
              <h5 className="font-bold text-[#17191C] uppercase tracking-wider text-[10px]">Utilities</h5>
              <ul className="space-y-2 font-medium">
                <li>
                  <button 
                    type="button" 
                    onClick={() => onTabChange?.("shortener")} 
                    className="hover:text-brand-primary transition-colors cursor-pointer"
                  >
                    Link Shortener
                  </button>
                </li>
                <li>
                  <button 
                    type="button" 
                    onClick={() => onTabChange?.("qr")} 
                    className="hover:text-brand-primary transition-colors cursor-pointer"
                  >
                    QR Generator
                  </button>
                </li>
                <li>
                  <button 
                    type="button" 
                    onClick={() => onTabChange?.("preview")} 
                    className="hover:text-brand-primary transition-colors cursor-pointer"
                  >
                    Social Preview
                  </button>
                </li>
                <li>
                  <button 
                    type="button" 
                    onClick={() => onTabChange?.("ogdebug")} 
                    className="hover:text-brand-primary transition-colors cursor-pointer"
                  >
                    Metadata Inspector
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Account */}
            <div className="space-y-3 text-left">
              <h5 className="font-bold text-[#17191C] uppercase tracking-wider text-[10px]">Account</h5>
              <ul className="space-y-2 font-medium">
                <li>
                  <button 
                    type="button" 
                    onClick={onBecomeUser} 
                    className="hover:text-brand-primary transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                </li>
                <li>
                  <button 
                    type="button" 
                    onClick={onBecomeUser} 
                    className="hover:text-brand-primary transition-colors cursor-pointer"
                  >
                    Create Free Profile
                  </button>
                </li>
              </ul>
            </div>

          </div>
          
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[#8D959F]">
            <div className="flex gap-4 font-semibold">
              <span className="hover:text-brand-primary cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-brand-primary cursor-pointer transition-colors">Terms of Service</span>
            </div>
            <p className="text-[11px]">Designed to help you keep what you create.</p>
          </div>
        </div>
      </footer>

    </div>
  );
};
