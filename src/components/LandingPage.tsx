import React, { useState, useRef } from "react";
import { ParsedPost, CardCustomization, FontFamily, CardTheme, CanvasBackground } from "../types";
import { PLACEHOLDER_IMAGES } from "../constants/images";
import { PostCard } from "./PostCard";
import { CanvasWrapper } from "./CanvasWrapper";
import { SmylTextLogo, SmylIcon } from "./SmylLogo";
import { motion, AnimatePresence } from "motion/react";
import { FiArrowRight, FiCornerDownRight } from "react-icons/fi";
import { FaXTwitter } from "react-icons/fa6";
import {
  IoCheckmarkCircle,
  IoCloseCircle,
  IoLogoLinkedin,
  IoLogoTwitter,
  IoChevronDown,
  IoEye,
  IoCreate,
  IoSunny,
  IoMoon,
  IoSparkles,
  IoHeart,
  IoCheckmark,
} from "react-icons/io5";

interface LandingPageProps {
  onOpenGenerator: (samplePost?: ParsedPost, customization?: Partial<CardCustomization>) => void;
  onBecomeUser: () => void;
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

const SHOWCASE_POST: ParsedPost = {
  platform: "x",
  author: {
    name: "Alex Rivera",
    username: "@alexrivera",
    isVerified: true,
    avatarColor: "#0145F2",
    avatarText: "AR",
  },
  content: {
    text: "The best product design doesn't feel like design at all.\n\nIt feels like an obvious solution you wonder why nobody built before.",
    hashtags: ["design", "product"],
    mentions: [],
    links: [],
  },
  timestamp: "9:41 AM · Aug 24, 2026",
  engagement: {
    likes: 3840,
    comments: 215,
    reposts: 640,
  },
};

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenGenerator, onBecomeUser }) => {
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

  const scrollToDemo = () => {
    document.getElementById("interactive-demo")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="w-full text-[#17191C] overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="pt-16 pb-16 md:pt-20 md:pb-20 px-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mx-auto text-center space-y-5"
        >
          {/* H1 */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#17191C] tracking-tight leading-[1.2] flex flex-col items-center justify-center gap-2">
            <span className="flex flex-wrap items-center justify-center gap-x-2.5 sm:gap-x-4 gap-y-2">
              Turn your
              <span className="inline-flex items-center justify-center p-1.5 sm:p-2.5 rounded-lg bg-[#17191C]/5 text-[#17191C] shrink-0">
                <FaXTwitter className="w-5 h-5 sm:w-7 sm:h-7 text-[#17191C]" />
              </span>
              or
              <span className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-[#0A66C2]/10 shrink-0">
                <svg viewBox="0 0 118 28" className="h-5 sm:h-7 w-auto text-[#0A66C2] fill-current" aria-label="LinkedIn">
                  <g transform="translate(0, -50)">
                    <path d="M.85 52.73h4.94v17.98h9.14v4.56H.85V52.73zM17.11 60h4.74v15.26h-4.74zm2.37-7.59a2.75 2.75 0 1 1-2.75 2.75a2.75 2.75 0 0 1 2.75-2.75m22.21.32h4.74V66.2l5.38-6.22h5.81l-6.22 7.07l6.09 8.22h-5.96l-5.04-7.55h-.06v7.55h-4.74V52.73zM24.48 60H29v2.09h.06a5 5 0 0 1 4.49-2.47c4.81 0 5.69 3.16 5.69 7.27v8.38h-4.7v-7.43c0-1.77 0-4-2.47-4s-2.85 1.93-2.85 3.92v7.55h-4.74z" />
                    <path d="M67.61 65.85a2.84 2.84 0 0 0-2.91-2.91a3.16 3.16 0 0 0-3.35 2.91zm4 6.77a8.35 8.35 0 0 1-6.48 3c-4.74 0-8.54-3.16-8.54-8.07s3.8-8.06 8.54-8.06c4.43 0 7.21 3.16 7.21 8.06v1.49h-11a3.54 3.54 0 0 0 3.57 3a4 4 0 0 0 3.38-1.87zm10.62-8.94A3.89 3.89 0 1 0 86 67.57a3.6 3.6 0 0 0-3.8-3.89m8.2 11.58H86v-2a6 6 0 0 1-4.71 2.4c-4.56 0-7.56-3.29-7.56-7.94c0-4.27 2.66-8.19 7-8.19a5.73 5.73 0 0 1 4.87 2h.06v-8.8h4.74z" />
                  </g>
                  <rect x="94" y="2" width="24" height="24" rx="3" fill="#0A66C2" />
                  <path d="M102 20h-3v-8h3v8zm-1.5-9.3c-.9 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm11.5 9.3h-3v-4.5c0-1.1-.9-2-2-2s-2 .9-2 2v4.5h-3v-8h3v1.2c.5-.7 1.5-1.2 2.5-1.2 2.2 0 4 1.8 4 4v4z" fill="#FFFFFF" />
                </svg>
              </span>
              posts
            </span>
            <span className="flex flex-wrap items-center justify-center gap-2 sm:gap-3.5 mt-1 sm:mt-2 text-brand-primary">
              <FiCornerDownRight className="w-6 h-6 sm:w-9 sm:h-9 text-brand-primary/80 animate-pulse shrink-0" />
              <span>into polished cards</span>
            </span>
          </h1>

          {/* Body */}
          <p className="text-base sm:text-lg text-[#626A73] font-normal leading-relaxed max-w-2xl mx-auto">
            Paste a post or link. Smyl turns it into an X or LinkedIn-style visual you can share anywhere.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98, y: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => onOpenGenerator(currentPost, demoCustomization)}
              className="w-full sm:w-auto h-11 px-7 rounded-xl bg-brand-primary text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-brand-hover active:bg-brand-pressed transition-colors cursor-pointer shadow-xs"
            >
              <span>Visit Studio</span>
              <FiArrowRight className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98, y: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={onBecomeUser}
              className="w-full sm:w-auto h-11 px-7 rounded-xl bg-white text-[#17191C] border border-[#E1E5E9] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#F5F7F9] hover:border-[#B9C0C8] active:bg-[#EEF1F4] transition-colors cursor-pointer"
            >
              <span>Become a user!</span>
            </motion.button>
          </div>

          {/* Underlined Url link with Arrow below buttons */}
          <div className="pt-2 flex items-center justify-center">
            <button
              onClick={scrollToDemo}
              className="inline-flex items-center gap-1 text-sm font-bold text-brand-primary hover:text-brand-hover underline underline-offset-4 cursor-pointer transition-colors"
            >
              <span>Try Live Demo</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Trust points */}
          <div className="pt-3 flex items-center justify-center flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-[#626A73]">
            <span className="flex items-center gap-1.5">
              <IoCheckmarkCircle className="text-emerald-600 w-3.5 h-3.5" />
              No design skills required
            </span>
            <span className="text-[#C2C9D1] hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <IoCheckmarkCircle className="text-emerald-600 w-3.5 h-3.5" />
              Built for X & LinkedIn
            </span>
            <span className="text-[#C2C9D1] hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <IoCheckmarkCircle className="text-emerald-600 w-3.5 h-3.5" />
              Export-ready visuals
            </span>
          </div>
        </motion.div>

        {/* 2. PRODUCT PREVIEW SECTION */}
        <motion.div
          id="interactive-demo"
          ref={demoContainerRef}
          onMouseMove={handleDemoMouseMove}
          onMouseEnter={() => setIsDemoHovered(true)}
          onMouseLeave={() => setIsDemoHovered(false)}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 md:mt-12 max-w-5xl mx-auto relative overflow-hidden rounded-2xl"
        >
          {/* Glowing cursor tracker blur background circle */}
          <motion.div
            animate={{
              x: mousePos.x - 120,
              y: mousePos.y - 120,
              opacity: isDemoHovered ? 0.25 : 0.08,
              scale: isDemoHovered ? 1.2 : 1,
            }}
            transition={{ type: "spring", stiffness: 150, damping: 28, mass: 0.1 }}
            className="absolute pointer-events-none w-64 h-64 rounded-full bg-gradient-to-tr from-brand-primary via-cyan-400 to-indigo-500 blur-3xl"
            style={{ left: 0, top: 0, zIndex: 0 }}
          />

          <div className="bg-white/80 backdrop-blur-md border border-[#E1E5E9] rounded-2xl p-4 sm:p-6 md:p-7 shadow-sm space-y-4 relative z-10">
            {/* Interactive Controller Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#ECEEF1]">
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
                    <IoEye className="w-4 h-4" />
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
                    <IoCreate className="w-4 h-4" />
                  </button>
                </div>

                <div className="hidden sm:block h-6 w-[1px] bg-[#ECEEF1]" />

                {/* 2. Platform Selector */}
                <div className="flex items-center gap-1 bg-[#EDF1F5] p-1 rounded-xl relative">
                  <button
                    type="button"
                    onClick={() => setSelectedPlatform("x")}
                    className={`relative z-10 p-2 rounded-lg transition-colors cursor-pointer ${
                      selectedPlatform === "x" ? "text-[#1D9BF0]" : "text-[#626A73] hover:text-[#17191C]"
                    }`}
                    title="X Layout"
                  >
                    {selectedPlatform === "x" && (
                      <motion.div
                        layoutId="demo-platform-pill"
                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                        className="absolute inset-0 bg-white rounded-lg shadow-xs -z-10"
                      />
                    )}
                    <IoLogoTwitter className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPlatform("linkedin")}
                    className={`relative z-10 p-2 rounded-lg transition-colors cursor-pointer ${
                      selectedPlatform === "linkedin" ? "text-[#0A66C2]" : "text-[#626A73] hover:text-[#17191C]"
                    }`}
                    title="LinkedIn Layout"
                  >
                    {selectedPlatform === "linkedin" && (
                      <motion.div
                        layoutId="demo-platform-pill"
                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                        className="absolute inset-0 bg-white rounded-lg shadow-xs -z-10"
                      />
                    )}
                    <IoLogoLinkedin className="w-4 h-4" />
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
                    <IoSparkles className="w-4 h-4" />
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
                    <IoChevronDown className="w-3.5 h-3.5" />
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
                    <IoChevronDown className="w-3.5 h-3.5 text-[#8D959F] flex-shrink-0" />
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
                                {isSel && <IoCheckmark className="text-brand-primary bg-white rounded-full w-3.5 h-3.5 p-0.5" />}
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
            <div className="p-3 sm:p-5 md:p-6 bg-[#EDF1F5] rounded-xl flex items-center justify-center min-h-[400px] overflow-hidden w-full transition-all duration-300">
              <CanvasWrapper background={demoCustomization.canvasBackground} padding={demoCustomization.canvasPadding}>
                <PostCard
                  post={currentPost}
                  customization={demoCustomization}
                  onUpdatePost={handleUpdateCurrentPost}
                />
              </CanvasWrapper>
            </div>

            {/* Action Bar Below Canvas */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <span className="text-xs text-[#626A73] text-center sm:text-left">
                {isDirectEdit
                  ? "Direct Edit Active: Type directly on the card to edit content."
                  : "Preview Mode: Switch themes, fonts, and backgrounds above."}
              </span>
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98, y: 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => onOpenGenerator(currentPost, demoCustomization)}
                className="w-auto h-10 px-5 rounded-lg bg-brand-primary text-white font-semibold text-xs flex items-center justify-center gap-2 hover:bg-brand-hover active:bg-brand-pressed transition-colors cursor-pointer shadow-xs shrink-0"
              >
                <span>Visit Studio</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. COMPARISON SECTION */}
      <section className="py-20 md:py-24 bg-white border-y border-[#E1E5E9]">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-2xl mx-auto space-y-3 mb-10"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[#17191C] tracking-tight">
              Your best posts deserve more than a screenshot.
            </h2>
            <p className="text-sm sm:text-base text-[#626A73] leading-relaxed">
              Screenshots are easy to make, but they rarely look intentional. Smyl turns your posts into clean, platform-inspired cards designed for sharing.
            </p>
          </motion.div>

          {/* Interactive Comparison Slider */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl mx-auto"
          >
            <div
              className="relative w-full h-[400px] sm:h-[460px] md:h-[500px] rounded-2xl overflow-hidden select-none border border-[#E1E5E9] shadow-sm cursor-ew-resize group"
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
              {/* RIGHT SIDE: The Smyl Card */}
              <div className="absolute inset-0 bg-[#0F172A] overflow-hidden flex items-center justify-center">
                <img
                  src={PLACEHOLDER_IMAGES.comparison.after}
                  alt={PLACEHOLDER_IMAGES.comparison.afterAlt}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-5 right-5 bg-emerald-600/95 backdrop-blur-md text-white text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-xs flex items-center gap-1.5 z-20">
                  <IoCheckmarkCircle className="w-3.5 h-3.5" />
                  <span>The Smyl Card</span>
                </div>
              </div>

              {/* LEFT SIDE: Messy Screenshot */}
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
                  <IoCloseCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Plain Screenshot</span>
                </div>
              </div>

              {/* Slider Handle */}
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

            <div className="text-center mt-3 text-xs text-[#626A73]">
              Drag handle left and right to inspect the visual contrast
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section className="py-20 md:py-24 px-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto space-y-3 mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-soft text-brand-primary text-xs font-bold border border-brand-primary/15 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-xs bg-brand-primary inline-block shrink-0" />
            <span>HOW IT WORKS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#17191C] tracking-tight leading-tight">
            From post to shareable card in 3 simple steps.
          </h2>
        </motion.div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {[
            {
              step: "01",
              title: "Paste your post",
              desc: "Paste plain text or enter a URL from X or LinkedIn to parse author details and content automatically.",
              image: PLACEHOLDER_IMAGES.howItWorks[0].imageUrl,
              alt: PLACEHOLDER_IMAGES.howItWorks[0].alt,
            },
            {
              step: "02",
              title: "Make it yours",
              desc: "Customize platform layout, light/dark theme, background gradients, and font pairings in real-time.",
              image: PLACEHOLDER_IMAGES.howItWorks[1].imageUrl,
              alt: PLACEHOLDER_IMAGES.howItWorks[1].alt,
            },
            {
              step: "03",
              title: "Export & share",
              desc: "Download high-DPI, 100% watermark-free PNG visual cards ready to share on any platform.",
              image: PLACEHOLDER_IMAGES.howItWorks[2].imageUrl,
              alt: PLACEHOLDER_IMAGES.howItWorks[2].alt,
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col group cursor-pointer"
              onClick={() => onOpenGenerator()}
            >
              <div className="w-full bg-[#F4F6F9] border border-[#E8ECF0] rounded-3xl p-5 sm:p-6 aspect-[4/3] relative overflow-hidden flex items-center justify-center shadow-2xs group-hover:border-[#CBD5E1] transition-colors duration-200">
                <img
                  src={item.image}
                  alt={item.alt}
                  className="w-full h-full object-cover rounded-2xl border border-white/60 shadow-xs transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>

              <div className="pt-4 px-1 space-y-1">
                <span className="text-xs font-extrabold text-brand-primary uppercase tracking-wider block">
                  Step {item.step}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#17191C] leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#626A73] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98, y: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => onOpenGenerator()}
            className="h-10 px-6 rounded-xl bg-brand-primary text-white font-semibold text-xs inline-flex items-center justify-center gap-2 hover:bg-brand-hover active:bg-brand-pressed transition-colors cursor-pointer shadow-xs"
          >
            <span>Visit Studio</span>
            <FiArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </section>

      {/* 6. BENEFIT CARDS SECTION */}
      <section className="py-20 bg-white border-t border-[#E1E5E9]">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-2xl mx-auto space-y-3 mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[#17191C] tracking-tight">
              Everything you need for a post that looks shareable.
            </h2>
            <p className="text-sm sm:text-base text-[#626A73]">
              Designed to elevate your text into clean, engaging visuals.
            </p>
          </motion.div>

          {/* 4 Benefit Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto px-4">
            {[
              {
                num: "01",
                title: "Platform-inspired layouts",
                desc: "Designed specifically to mirror the authentic structure of X and LinkedIn posts so your content looks native and credible.",
              },
              {
                num: "02",
                title: "Clean, readable formatting",
                desc: "Optimized typography, line heights, and padding that make your post effortless to read across all feed sizes.",
              },
              {
                num: "03",
                title: "Customizable styles",
                desc: "Pick from clean light and dark themes, background gradients, and font pairings that align with your personal brand.",
              },
              {
                num: "04",
                title: "Ready to export",
                desc: "Download high-DPI, 100% watermark-free PNG images instantly ready for newsletters, blogs, or social feeds.",
              },
            ].map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="relative group"
              >
                {/* Offset Bottom-Left Notch Accent */}
                <div className="absolute -bottom-2.5 -left-2.5 w-24 sm:w-28 h-12 sm:h-14 rounded-bl-2xl rounded-tr-lg bg-brand-primary opacity-90 transition-transform duration-300 group-hover:translate-x-[-2px] group-hover:translate-y-[2px]" />

                {/* Main White Card Box */}
                <div className="relative z-10 bg-white border border-[#E1E5E9] shadow-md hover:shadow-lg transition-all rounded-2xl p-6 sm:p-7 flex items-start gap-4 sm:gap-5">
                  <span className="text-3xl sm:text-4xl font-black tracking-tight shrink-0 select-none leading-none pt-0.5 text-brand-primary">
                    {card.num}
                  </span>

                  <div className="space-y-1.5">
                    <h3 className="text-sm sm:text-base font-bold text-[#17191C]">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#626A73] leading-relaxed font-normal">
                      {card.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98, y: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => onOpenGenerator()}
              className="h-10 px-6 rounded-xl bg-brand-primary text-white font-semibold text-xs inline-flex items-center justify-center gap-2 hover:bg-brand-hover active:bg-brand-pressed transition-colors cursor-pointer shadow-xs"
            >
              <span>Visit Studio</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section className="py-20 md:py-24 px-4 max-w-3xl mx-auto space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center space-y-2"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-[#17191C] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-[#626A73]">
            Everything you need to know about Smyl card generation and usage.
          </p>
        </motion.div>

        <div className="divide-y divide-[#ECEEF1] border-y border-[#ECEEF1]">
          {[
            {
              q: "What is Smyl?",
              a: "Smyl is a web tool that transforms social text posts and links into clean, platform-inspired visual cards ready to share.",
            },
            {
              q: "What posts can I use?",
              a: "You can paste text from X (Twitter), LinkedIn, or notes, or paste a public post URL to parse content automatically.",
            },
            {
              q: "Do I need design skills?",
              a: "No design skills required. Smyl handles layout, font pairings, padding, and contrast automatically.",
            },
            {
              q: "Can I customize my card?",
              a: "Yes. You can switch between light, dark, and retro themes, pick background colors, customize font styles, and toggle post metadata.",
            },
            {
              q: "Can I use exported cards commercially?",
              a: "Yes. All exported cards are 100% watermark-free and yours to use in newsletters, presentations, blogs, or social feeds.",
            },
          ].map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="py-5 transition-colors">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left flex items-center justify-between gap-4 transition-colors cursor-pointer group"
                >
                  <span className="font-semibold text-base sm:text-lg text-[#17191C] group-hover:text-brand-primary transition-colors">
                    {faq.q}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#626A73] group-hover:bg-[#F5F7F9] transition-colors flex-shrink-0"
                  >
                    <IoChevronDown className={`w-4 h-4 ${isOpen ? "text-brand-primary" : ""}`} />
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
                      <div className="pt-3 pr-10 text-sm text-[#626A73] leading-relaxed">
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
              Your next shareable post is already written.
            </h2>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed max-w-md">
              Paste it into Smyl and turn it into a polished visual.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3">
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98, y: 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => onOpenGenerator()}
                className="w-full sm:w-auto h-11 px-7 rounded-xl bg-white text-brand-primary font-semibold text-sm inline-flex items-center justify-center gap-2 hover:bg-[#F5F7F9] active:bg-[#EEF1F4] transition-all cursor-pointer shadow-md"
              >
                <span>Visit Studio</span>
                <FiArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98, y: 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                onClick={onBecomeUser}
                className="w-full sm:w-auto h-11 px-6 rounded-xl bg-brand-hover text-white border border-white/20 font-semibold text-sm inline-flex items-center justify-center gap-2 hover:bg-brand-pressed transition-all cursor-pointer"
              >
                <span>Become a user!</span>
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
