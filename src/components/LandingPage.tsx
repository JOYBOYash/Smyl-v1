import React, { useState, useRef } from "react";
import { ParsedPost, CardCustomization, FontFamily, CardTheme, CanvasBackground } from "../types";
import { PLACEHOLDER_IMAGES } from "../constants/images";
import { PostCard } from "./PostCard";
import { CanvasWrapper } from "./CanvasWrapper";
import { SmylTextLogo, SmylIcon } from "./SmylLogo";
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
  Sparkles,
  MousePointerClick,
  Info
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
    <div className="w-full text-[#17191C] overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="pt-20 pb-16 md:pt-24 md:pb-20 px-4 max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto text-center space-y-6"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-soft text-brand-primary text-[10px] sm:text-xs font-bold tracking-wider uppercase border border-brand-primary/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Free Tools for Sharing Links & Content</span>
          </div>

          {/* H1 */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#17191C] tracking-tight leading-[1.1] max-w-3xl mx-auto">
            Turn links and social posts into things <span className="text-brand-primary">worth sharing</span>.
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl text-[#626A73] font-normal leading-relaxed max-w-2xl mx-auto">
            Create polished social cards, shorten links, generate QR codes, preview link shares, build UTM URLs, and more — all from one place.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <motion.button
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99, y: 0 }}
              onClick={() => onOpenGenerator()}
              className="w-full sm:w-auto h-12 px-8 rounded-xl bg-brand-primary text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-brand-hover active:bg-brand-pressed transition-colors cursor-pointer shadow-md shadow-brand-primary/10"
            >
              <span>Create your first card</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99, y: 0 }}
              onClick={() => scrollToSection("free-tools")}
              className="w-full sm:w-auto h-12 px-8 rounded-xl bg-white text-[#17191C] border border-[#E1E5E9] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#F5F7F9] hover:border-[#B9C0C8] active:bg-[#EEF1F4] transition-colors cursor-pointer shadow-2xs"
            >
              <span>Explore free tools</span>
            </motion.button>
          </div>

          {/* Trust Line */}
          <div className="pt-3 text-xs font-semibold text-[#8D959F] flex flex-wrap items-center justify-center gap-2">
            <span>No design skills required</span>
            <span className="text-[#C2C9D1]">•</span>
            <span>Free to use</span>
            <span className="text-[#C2C9D1]">•</span>
            <span>No credit card required</span>
          </div>
        </motion.div>
      </section>

      {/* 2. ENTRY POINT SECTION */}
      <section className="py-16 bg-[#F8FAFC] border-y border-[#ECEEF1]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-[#17191C] tracking-tight">
              Start with the thing you're already trying to share.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Social Post Entry */}
            <div className="bg-white border border-[#E1E5E9] rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-300 group">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand-primary flex items-center justify-center font-black">
                  A
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#17191C]">Social Post</h3>
                  <p className="text-sm text-[#626A73] mt-2 leading-relaxed">
                    Turn X or LinkedIn posts into polished shareable cards.
                  </p>
                </div>
              </div>
              <div className="pt-6">
                <button
                  onClick={() => onOpenGenerator()}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary group-hover:text-brand-hover hover:underline cursor-pointer"
                >
                  <span>Create a card</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Link Entry */}
            <div className="bg-white border border-[#E1E5E9] rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-300 group">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#17191C]">Link</h3>
                  <p className="text-sm text-[#626A73] mt-2 leading-relaxed">
                    Shorten, track, preview, tag, or turn any URL into a QR code.
                  </p>
                </div>
              </div>
              <div className="pt-6">
                <button
                  onClick={() => onTabChange?.("shortener")}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary group-hover:text-brand-hover hover:underline cursor-pointer"
                >
                  <span>Work with a link</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Webpage Entry */}
            <div className="bg-white border border-[#E1E5E9] rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-300 group">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#17191C]">Webpage</h3>
                  <p className="text-sm text-[#626A73] mt-2 leading-relaxed">
                    Capture a webpage or inspect exactly how its social preview will appear.
                  </p>
                </div>
              </div>
              <div className="pt-6">
                <button
                  onClick={() => onTabChange?.("screenshot")}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary group-hover:text-brand-hover hover:underline cursor-pointer"
                >
                  <span>Inspect a page</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE DEMO */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-3xl font-black text-[#17191C] tracking-tight">
            See what you can make in seconds.
          </h2>
          <p className="text-sm text-[#626A73]">
            Customize content directly inside the card to see the high-DPI output format.
          </p>
        </div>

        <motion.div
          ref={demoContainerRef}
          onMouseMove={handleDemoMouseMove}
          onMouseEnter={() => setIsDemoHovered(true)}
          onMouseLeave={() => setIsDemoHovered(false)}
          className="max-w-5xl mx-auto relative overflow-hidden rounded-2xl border border-[#E1E5E9] shadow-md bg-white p-4 sm:p-6 md:p-8"
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
              <span>{isDirectEdit ? "Direct Edit Active: Click on any text inside the card to modify." : "Live Customization: Choose configurations instantly above."}</span>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-bold text-[#8D959F] hidden sm:inline">Paste → customize → export</span>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onOpenGenerator(currentPost, demoCustomization)}
                className="w-full sm:w-auto h-11 px-6 rounded-xl bg-brand-primary text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-brand-hover active:bg-brand-pressed transition-colors cursor-pointer shadow-xs shrink-0"
              >
                <span>Make yours</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 4. PROBLEM SECTION */}
      <section className="py-20 bg-white border-y border-[#E1E5E9]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-[#17191C] tracking-tight leading-tight">
              Your content is already good. The presentation shouldn't make it look unfinished.
            </h2>
            <p className="text-base text-[#626A73] leading-relaxed max-w-2xl mx-auto font-normal">
              Screenshots crop awkwardly, lose context, and rarely look like something you intentionally designed. Smyl turns your existing content into clean, shareable visuals without making you rebuild it in a design tool.
            </p>
          </div>

          {/* Slider Comparison Box */}
          <div className="max-w-4xl mx-auto">
            <div
              className="relative w-full h-[380px] sm:h-[440px] md:h-[480px] rounded-2xl overflow-hidden select-none border border-[#E1E5E9] shadow-sm cursor-ew-resize group"
              onMouseDown={(e) => {
                isDraggingRef.current = true;
                const rect = e.currentTarget.getBoundingClientRect();
                handleSliderMove(e.clientX, rect);
              }}
              onMouseMove={(e) => {
                if (isDraggingRef.current) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  handleSliderMove(e.clientX, rect);
                }
              }}
              onMouseUp={() => {
                isDraggingRef.current = false;
              }}
              onMouseLeave={() => {
                isDraggingRef.current = false;
              }}
              onTouchMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                if (e.touches[0]) handleSliderMove(e.touches[0].clientX, rect);
              }}
            >
              {/* RIGHT SIDE: Smyl Card */}
              <div className="absolute inset-0 bg-[#0F172A] overflow-hidden flex items-center justify-center">
                <img
                  src={PLACEHOLDER_IMAGES.comparison.after}
                  alt={PLACEHOLDER_IMAGES.comparison.afterAlt}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-5 right-5 bg-emerald-600/95 backdrop-blur-md text-white text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-xs flex items-center gap-1.5 z-20">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>The Smyl Card</span>
                </div>
              </div>

              {/* LEFT SIDE: Screenshot */}
              <div
                className="absolute inset-0 bg-[#1E293B] overflow-hidden flex items-center justify-center"
                style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
              >
                <img
                  src={PLACEHOLDER_IMAGES.comparison.before}
                  alt={PLACEHOLDER_IMAGES.comparison.beforeAlt}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-5 left-5 bg-rose-600/95 backdrop-blur-md text-white text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-xs flex items-center gap-1.5 z-20">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>Plain Screenshot</span>
                </div>
              </div>

              {/* Handle */}
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-40 pointer-events-none -translate-x-1/2"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white shadow-[0_2px_12px_rgba(0,0,0,0.3)] flex items-center justify-center text-[#17191C] pointer-events-auto hover:scale-110 active:scale-95 transition-transform duration-200 cursor-ew-resize">
                  <svg className="w-4 h-4 text-[#17191C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m8 7-5 5 5 5" />
                    <path d="m16 7 5 5-5 5" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Comparison Highlights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-3xl mx-auto text-center">
              <div className="p-3 bg-brand-soft/40 border border-brand-primary/5 rounded-xl">
                <span className="block font-bold text-xs text-[#17191C]">Cleaner presentation</span>
              </div>
              <div className="p-3 bg-brand-soft/40 border border-brand-primary/5 rounded-xl">
                <span className="block font-bold text-xs text-[#17191C]">Better readability</span>
              </div>
              <div className="p-3 bg-brand-soft/40 border border-brand-primary/5 rounded-xl">
                <span className="block font-bold text-xs text-[#17191C]">Intentional dimensions</span>
              </div>
              <div className="p-3 bg-brand-soft/40 border border-brand-primary/5 rounded-xl">
                <span className="block font-bold text-xs text-[#17191C]">Easier sharing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS SECTION */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-brand-soft text-brand-primary text-[10px] font-bold uppercase tracking-wider">
            <span>Flow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#17191C] tracking-tight">
            Turn an idea into a shareable asset in three steps.
          </h2>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-primary text-white font-black flex items-center justify-center text-lg">
              01
            </div>
            <h3 className="font-bold text-lg text-[#17191C]">Paste what you already have</h3>
            <p className="text-sm text-[#626A73] leading-relaxed">
              Drop in an X or LinkedIn post, URL, or draft. Smyl handles the formatting.
            </p>
          </div>

          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-primary text-white font-black flex items-center justify-center text-lg">
              02
            </div>
            <h3 className="font-bold text-lg text-[#17191C]">Make it look right</h3>
            <p className="text-sm text-[#626A73] leading-relaxed">
              Choose the platform, typography, theme, background, and layout.
            </p>
          </div>

          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-primary text-white font-black flex items-center justify-center text-lg">
              03
            </div>
            <h3 className="font-bold text-lg text-[#17191C]">Share it</h3>
            <p className="text-sm text-[#626A73] leading-relaxed">
              Export a clean, high-resolution visual or keep the design in your Smyl account.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => onOpenGenerator()}
            className="h-12 px-8 rounded-xl bg-brand-primary text-white font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-brand-hover transition-colors cursor-pointer"
          >
            <span>Create yours for free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 6. FREE TOOLS SECTION */}
      <section id="free-tools" className="py-20 bg-[#F8FAFC] border-y border-[#E1E5E9]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-soft text-brand-primary text-[10px] sm:text-xs font-bold tracking-wider uppercase border border-brand-primary/10">
              <Settings className="w-3.5 h-3.5" />
              <span>Free Utility Suite</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#17191C] tracking-tight">
              One place for the link-sharing jobs you do every week.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* 1. Link Shortener */}
            <div 
              onClick={() => onTabChange?.("shortener")}
              className="bg-white border border-[#E1E5E9] hover:border-brand-primary/40 rounded-2xl p-6 flex flex-col justify-between cursor-pointer hover:shadow-lg transition-all group"
            >
              <div className="space-y-4">
                <div className="w-9 h-9 rounded-xl bg-brand-soft text-brand-primary flex items-center justify-center">
                  <LinkIcon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#17191C]">Link Shortener</h3>
                  <p className="text-xs text-[#626A73] mt-1.5 leading-relaxed">
                    Turn long URLs into clean, shareable links.
                  </p>
                </div>
              </div>
              <div className="pt-5 border-t border-[#ECEEF1] mt-5">
                <span className="text-xs font-bold text-brand-primary group-hover:underline inline-flex items-center gap-1">
                  Shorten a link <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>

            {/* 2. QR Code Generator */}
            <div 
              onClick={() => onTabChange?.("qr")}
              className="bg-white border border-[#E1E5E9] hover:border-brand-primary/40 rounded-2xl p-6 flex flex-col justify-between cursor-pointer hover:shadow-lg transition-all group"
            >
              <div className="space-y-4">
                <div className="w-9 h-9 rounded-xl bg-brand-soft text-brand-primary flex items-center justify-center">
                  <QrCode className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#17191C]">QR Code Generator</h3>
                  <p className="text-xs text-[#626A73] mt-1.5 leading-relaxed">
                    Turn any URL into a downloadable QR code.
                  </p>
                </div>
              </div>
              <div className="pt-5 border-t border-[#ECEEF1] mt-5">
                <span className="text-xs font-bold text-brand-primary group-hover:underline inline-flex items-center gap-1">
                  Create a QR code <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>

            {/* 3. Link Preview */}
            <div 
              onClick={() => onTabChange?.("preview")}
              className="bg-white border border-[#E1E5E9] hover:border-brand-primary/40 rounded-2xl p-6 flex flex-col justify-between cursor-pointer hover:shadow-lg transition-all group"
            >
              <div className="space-y-4">
                <div className="w-9 h-9 rounded-xl bg-brand-soft text-brand-primary flex items-center justify-center">
                  <Eye className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#17191C]">Link Preview</h3>
                  <p className="text-xs text-[#626A73] mt-1.5 leading-relaxed">
                    See exactly how your URL looks when shared.
                  </p>
                </div>
              </div>
              <div className="pt-5 border-t border-[#ECEEF1] mt-5">
                <span className="text-xs font-bold text-brand-primary group-hover:underline inline-flex items-center gap-1">
                  Preview a link <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>

            {/* 4. OG Debugger */}
            <div 
              onClick={() => onTabChange?.("ogdebug")}
              className="bg-white border border-[#E1E5E9] hover:border-brand-primary/40 rounded-2xl p-6 flex flex-col justify-between cursor-pointer hover:shadow-lg transition-all group"
            >
              <div className="space-y-4">
                <div className="w-9 h-9 rounded-xl bg-brand-soft text-brand-primary flex items-center justify-center">
                  <Bug className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#17191C]">OG Debugger</h3>
                  <p className="text-xs text-[#626A73] mt-1.5 leading-relaxed">
                    Find missing or broken Open Graph metadata before you share.
                  </p>
                </div>
              </div>
              <div className="pt-5 border-t border-[#ECEEF1] mt-5">
                <span className="text-xs font-bold text-brand-primary group-hover:underline inline-flex items-center gap-1">
                  Debug a URL <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>

            {/* 5. UTM Builder */}
            <div 
              onClick={() => onTabChange?.("utm")}
              className="bg-white border border-[#E1E5E9] hover:border-brand-primary/40 rounded-2xl p-6 flex flex-col justify-between cursor-pointer hover:shadow-lg transition-all group"
            >
              <div className="space-y-4">
                <div className="w-9 h-9 rounded-xl bg-brand-soft text-brand-primary flex items-center justify-center font-bold">
                  U
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#17191C]">UTM Builder</h3>
                  <p className="text-xs text-[#626A73] mt-1.5 leading-relaxed">
                    Build campaign URLs without manually writing UTM parameters.
                  </p>
                </div>
              </div>
              <div className="pt-5 border-t border-[#ECEEF1] mt-5">
                <span className="text-xs font-bold text-brand-primary group-hover:underline inline-flex items-center gap-1">
                  Build a UTM link <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>

            {/* 6. Link Hub */}
            <div 
              onClick={() => onTabChange?.("hubs")}
              className="bg-white border border-[#E1E5E9] hover:border-brand-primary/40 rounded-2xl p-6 flex flex-col justify-between cursor-pointer hover:shadow-lg transition-all group"
            >
              <div className="space-y-4">
                <div className="w-9 h-9 rounded-xl bg-brand-soft text-brand-primary flex items-center justify-center">
                  <Compass className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#17191C]">Link Hub</h3>
                  <p className="text-xs text-[#626A73] mt-1.5 leading-relaxed">
                    Create one clean page for all your important links.
                  </p>
                </div>
              </div>
              <div className="pt-5 border-t border-[#ECEEF1] mt-5">
                <span className="text-xs font-bold text-brand-primary group-hover:underline inline-flex items-center gap-1">
                  Create a Link Hub <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>

            {/* 7. Screenshot Generator */}
            <div 
              onClick={() => onTabChange?.("screenshot")}
              className="bg-white border border-[#E1E5E9] hover:border-brand-primary/40 rounded-2xl p-6 flex flex-col justify-between cursor-pointer hover:shadow-lg transition-all group"
            >
              <div className="space-y-4">
                <div className="w-9 h-9 rounded-xl bg-brand-soft text-brand-primary flex items-center justify-center">
                  <ImageIcon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#17191C]">Screenshot Generator</h3>
                  <p className="text-xs text-[#626A73] mt-1.5 leading-relaxed">
                    Capture any public webpage as a clean, high-resolution image.
                  </p>
                </div>
              </div>
              <div className="pt-5 border-t border-[#ECEEF1] mt-5">
                <span className="text-xs font-bold text-brand-primary group-hover:underline inline-flex items-center gap-1">
                  Capture a webpage <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section className="py-20 md:py-24 px-4 max-w-3xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-[#17191C] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-[#626A73]">
            Everything you need to know about Smyl and how our utilities help you share better content.
          </p>
        </div>

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

      {/* 8. FINAL CTA SECTION */}
      <section className="py-14 pb-24 px-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="bg-brand-primary rounded-3xl p-8 sm:p-12 md:p-14 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-lg relative overflow-hidden"
        >
          {/* Background Brand Icon Accent */}
          <div className="absolute right-[-10%] bottom-[-20%] md:right-[-5%] md:bottom-[-10%] opacity-15 pointer-events-none select-none">
            <SmylIcon className="h-64 sm:h-80 md:h-96 w-auto" variant="white" />
          </div>

          <div className="space-y-4 max-w-lg text-center md:text-left z-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              You already have the link. Smyl handles the rest.
            </h2>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed max-w-md">
              Shorten it. Preview it. Track it. Turn it into a QR code. Or turn your post into something worth sharing.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3">
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98, y: 0 }}
                onClick={() => onOpenGenerator()}
                className="w-full sm:w-auto h-11 px-7 rounded-xl bg-white text-brand-primary font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-[#F5F7F9] active:bg-[#EEF1F4] transition-all cursor-pointer shadow-md"
              >
                <span>Create something with Smyl</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98, y: 0 }}
                onClick={() => scrollToSection("free-tools")}
                className="w-full sm:w-auto h-11 px-6 rounded-xl bg-brand-hover text-white border border-white/20 font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-brand-pressed transition-all cursor-pointer"
              >
                <span>Explore all tools</span>
              </motion.button>
            </div>
          </div>

          {/* Product Preview Image */}
          <img
            src={PLACEHOLDER_IMAGES.comparison.after}
            alt="Smyl Card Preview"
            className="relative z-10 w-full max-w-[340px] h-[220px] rounded-2xl border border-white/20 shadow-xl flex-shrink-0 object-cover"
          />
        </motion.div>
      </section>

      {/* 9. FOOTER */}
      <footer className="py-8 bg-white border-t border-[#E1E5E9] text-xs text-[#626A73]">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>© 2026</span>
            <SmylTextLogo className="h-4 w-auto" variant="monochrome" />
          </div>
        </div>
      </footer>
    </div>
  );
};
