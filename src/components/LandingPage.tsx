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
import { 
  FaWhatsapp, 
  FaXTwitter, 
  FaInstagram, 
  FaLinkedinIn, 
  FaThreads, 
  FaFacebookF, 
  FaTiktok, 
  FaYoutube,
  FaMedium
} from "react-icons/fa6";
import { SiSubstack } from "react-icons/si";

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
        
        <div className="max-w-4xl mx-auto text-center space-y-6 relative">
          
          {/* Floating Social Media Nodes — strictly kept inside header text range */}
          <div className="hidden lg:block">
            {/* Left Arc Nodes */}
            {/* Node 1: X (formerly Twitter) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, y: [0, -4, 0], rotate: -10 }}
              transition={{
                opacity: { duration: 0.5 },
                scale: { duration: 0.5 },
                y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
              }}
              className="absolute -left-[5%] lg:-left-[8%] xl:-left-[10%] top-[-4%] z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] bg-white border border-[#E1E5E9]/30 shadow-[0_12px_32px_rgba(0,0,0,0.08)] flex items-center justify-center text-[#17191C] hover:scale-115 hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)] active:scale-95 transition-all duration-300 cursor-pointer"
              title="X / Twitter"
            >
              <FaXTwitter className="w-6 h-6" />
            </motion.div>

            {/* Node 2: WhatsApp */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, y: [0, -5, 0], rotate: 8 }}
              transition={{
                opacity: { duration: 0.5, delay: 0.1 },
                scale: { duration: 0.5, delay: 0.1 },
                y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.15 }
              }}
              className="absolute -left-[8%] lg:-left-[11%] xl:-left-[14%] top-[20%] z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] bg-white border border-[#E1E5E9]/30 shadow-[0_12px_32px_rgba(0,0,0,0.08)] flex items-center justify-center text-[#25D366] hover:scale-115 hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)] active:scale-95 transition-all duration-300 cursor-pointer"
              title="WhatsApp"
            >
              <FaWhatsapp className="w-7.5 h-7.5" />
            </motion.div>

            {/* Node 3: Instagram */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, y: [0, -4, 0], rotate: -12 }}
              transition={{
                opacity: { duration: 0.5, delay: 0.2 },
                scale: { duration: 0.5, delay: 0.2 },
                y: { duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }
              }}
              className="absolute -left-[9%] lg:-left-[12%] xl:-left-[15%] top-[44%] z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] bg-white border border-[#E1E5E9]/30 shadow-[0_12px_32px_rgba(0,0,0,0.08)] flex items-center justify-center text-[#E4405F] hover:scale-115 hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)] active:scale-95 transition-all duration-300 cursor-pointer"
              title="Instagram"
            >
              <FaInstagram className="w-7 h-7" />
            </motion.div>

            {/* Node 4: TikTok */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, y: [0, -5, 0], rotate: 8 }}
              transition={{
                opacity: { duration: 0.5, delay: 0.3 },
                scale: { duration: 0.5, delay: 0.3 },
                y: { duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.45 }
              }}
              className="absolute -left-[8%] lg:-left-[11%] xl:-left-[14%] top-[68%] z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] bg-white border border-[#E1E5E9]/30 shadow-[0_12px_32px_rgba(0,0,0,0.08)] flex items-center justify-center text-black hover:scale-115 hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)] active:scale-95 transition-all duration-300 cursor-pointer"
              title="TikTok"
            >
              <FaTiktok className="w-6 h-6" />
            </motion.div>

            {/* Node 5: Facebook */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, y: [0, -4, 0], rotate: -6 }}
              transition={{
                opacity: { duration: 0.5, delay: 0.4 },
                scale: { duration: 0.5, delay: 0.4 },
                y: { duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.6 }
              }}
              className="absolute -left-[5%] lg:-left-[8%] xl:-left-[10%] top-[92%] z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] bg-white border border-[#E1E5E9]/30 shadow-[0_12px_32px_rgba(0,0,0,0.08)] flex items-center justify-center text-[#1877F2] hover:scale-115 hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)] active:scale-95 transition-all duration-300 cursor-pointer"
              title="Facebook"
            >
              <FaFacebookF className="w-6 h-6" />
            </motion.div>

            {/* Right Arc Nodes */}
            {/* Node 6: YouTube */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, y: [0, -4, 0], rotate: 12 }}
              transition={{
                opacity: { duration: 0.5 },
                scale: { duration: 0.5 },
                y: { duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.1 }
              }}
              className="absolute -right-[5%] lg:-right-[8%] xl:-right-[10%] top-[-4%] z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] bg-white border border-[#E1E5E9]/30 shadow-[0_12px_32px_rgba(0,0,0,0.08)] flex items-center justify-center text-[#FF0000] hover:scale-115 hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)] active:scale-95 transition-all duration-300 cursor-pointer"
              title="YouTube"
            >
              <FaYoutube className="w-7 h-7" />
            </motion.div>

            {/* Node 7: LinkedIn */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, y: [0, -5, 0], rotate: -6 }}
              transition={{
                opacity: { duration: 0.5, delay: 0.1 },
                scale: { duration: 0.5, delay: 0.1 },
                y: { duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }
              }}
              className="absolute -right-[8%] lg:-right-[11%] xl:-right-[14%] top-[20%] z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] bg-white border border-[#E1E5E9]/30 shadow-[0_12px_32px_rgba(0,0,0,0.08)] flex items-center justify-center text-[#0A66C2] hover:scale-115 hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)] active:scale-95 transition-all duration-300 cursor-pointer"
              title="LinkedIn"
            >
              <FaLinkedinIn className="w-6.5 h-6.5" />
            </motion.div>

            {/* Node 8: Threads */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, y: [0, -4, 0], rotate: 10 }}
              transition={{
                opacity: { duration: 0.5, delay: 0.2 },
                scale: { duration: 0.5, delay: 0.2 },
                y: { duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }
              }}
              className="absolute -right-[9%] lg:-right-[12%] xl:-right-[15%] top-[44%] z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] bg-white border border-[#E1E5E9]/30 shadow-[0_12px_32px_rgba(0,0,0,0.08)] flex items-center justify-center text-[#17191C] hover:scale-115 hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)] active:scale-95 transition-all duration-300 cursor-pointer"
              title="Threads"
            >
              <FaThreads className="w-6.5 h-6.5" />
            </motion.div>

            {/* Node 9: Substack */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, y: [0, -5, 0], rotate: -8 }}
              transition={{
                opacity: { duration: 0.5, delay: 0.3 },
                scale: { duration: 0.5, delay: 0.3 },
                y: { duration: 3.9, repeat: Infinity, ease: "easeInOut", delay: 0.4 }
              }}
              className="absolute -right-[8%] lg:-right-[11%] xl:-right-[14%] top-[68%] z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] bg-white border border-[#E1E5E9]/30 shadow-[0_12px_32px_rgba(0,0,0,0.08)] flex items-center justify-center text-[#FF6719] hover:scale-115 hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)] active:scale-95 transition-all duration-300 cursor-pointer"
              title="Substack"
            >
              <SiSubstack className="w-6 h-6" />
            </motion.div>

            {/* Node 10: Medium */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, y: [0, -4, 0], rotate: 11 }}
              transition={{
                opacity: { duration: 0.5, delay: 0.4 },
                scale: { duration: 0.5, delay: 0.4 },
                y: { duration: 3.7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
              }}
              className="absolute -right-[5%] lg:-right-[8%] xl:-right-[10%] top-[92%] z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] bg-white border border-[#E1E5E9]/30 shadow-[0_12px_32px_rgba(0,0,0,0.08)] flex items-center justify-center text-[#17191C] hover:scale-115 hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)] active:scale-95 transition-all duration-300 cursor-pointer"
              title="Medium"
            >
              <FaMedium className="w-6 h-6" />
            </motion.div>
          </div>

          {/* Eyebrow - Pure Text tracking-wider, no pill badge */}
          <p className="text-brand-primary font-bold tracking-[0.15em] text-xs uppercase mb-3">
            SHARE BETTER
          </p>

          {/* Headline - Editorial Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-extrabold text-[#17191C] tracking-[-0.04em] leading-[1.05] max-w-3xl mx-auto">
            Turn your links and content into something worth sharing.
          </h1>

          {/* Supporting Text */}
          <p className="text-base lg:text-[18px] text-[#626A73] font-normal leading-[1.6] max-w-2xl mx-auto">
            Create polished shareable visuals, short links, QR codes and more — without switching between tools.
          </p>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto sm:max-w-none">
            <button
              type="button"
              onClick={() => onOpenGenerator()}
              className="w-full sm:w-auto h-12 px-8 rounded-xl bg-brand-primary text-white font-semibold text-[14px] leading-[20px] inline-flex items-center justify-center gap-2 hover:bg-brand-hover active:bg-brand-pressed transition-all duration-150 cursor-pointer shadow-md shadow-brand-primary/15"
            >
              <span>Create with Smyl</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("how-it-works")}
              className="w-full sm:w-auto h-12 px-8 rounded-xl bg-white text-[#17191C] border border-[#E1E5E9] font-semibold text-[14px] leading-[20px] inline-flex items-center justify-center gap-2 hover:bg-[#F5F7F9] hover:border-[#B9C0C8] active:bg-[#EEF1F4] transition-all duration-150 cursor-pointer shadow-xs"
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
            <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-bold text-[#17191C] tracking-[-0.035em] leading-[1.1]">
              How Smyl Works
            </h2>
            <p className="text-base lg:text-[18px] text-[#626A73] font-normal leading-[1.6]">
              From your original content to something ready to share.
            </p>
          </div>

          {/* Three horizontal cards layout side-by-side with premium SaaS boxes, numbers and texts matching the screenshot */}
          <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 justify-center items-stretch max-w-6xl mx-auto">
            
            {/* Step 1 */}
            <div id="step-card-01" className="flex-1 min-w-[280px] max-w-full bg-white rounded-3xl border border-[#E1E5E9]/60 hover:border-brand-primary/20 hover:shadow-[0_16px_48px_rgba(0,0,0,0.04)] transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center text-white font-extrabold text-sm mb-5">
                  01
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#17191C] tracking-[-0.02em] mb-2">
                  Add your content
                </h3>
                <p className="text-sm sm:text-base text-[#626A73] font-normal leading-[1.5] mb-6">
                  Paste a link, post, or piece of content into Smyl.
                </p>
              </div>
              <div className="overflow-hidden flex items-center justify-center h-[240px] sm:h-[260px] xl:h-[280px] relative w-full mt-auto">
                <img
                  src="/assets/landing/1_add-content.webp"
                  alt="Add your content graphic"
                  className="w-full h-full object-contain block scale-110 group-hover:scale-[1.18] transition-transform duration-500 ease-out"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Step 2 */}
            <div id="step-card-02" className="flex-1 min-w-[280px] max-w-full bg-white rounded-3xl border border-[#E1E5E9]/60 hover:border-brand-primary/20 hover:shadow-[0_16px_48px_rgba(0,0,0,0.04)] transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center text-white font-extrabold text-sm mb-5">
                  02
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#17191C] tracking-[-0.02em] mb-2">
                  Make it yours
                </h3>
                <p className="text-sm sm:text-base text-[#626A73] font-normal leading-[1.5] mb-6">
                  Choose the format and customize how it looks.
                </p>
              </div>
              <div className="overflow-hidden flex items-center justify-center h-[240px] sm:h-[260px] xl:h-[280px] relative w-full mt-auto">
                <img
                  src="/assets/landing/2_make-yours.webp"
                  alt="Make it yours graphic"
                  className="w-full h-full object-contain block scale-110 group-hover:scale-[1.18] transition-transform duration-500 ease-out"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Step 3 */}
            <div id="step-card-03" className="flex-1 min-w-[280px] max-w-full bg-white rounded-3xl border border-[#E1E5E9]/60 hover:border-brand-primary/20 hover:shadow-[0_16px_48px_rgba(0,0,0,0.04)] transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center text-white font-extrabold text-sm mb-5">
                  03
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#17191C] tracking-[-0.02em] mb-2">
                  Share it
                </h3>
                <p className="text-sm sm:text-base text-[#626A73] font-normal leading-[1.5] mb-6">
                  Export, copy, or share your finished result.
                </p>
              </div>
              <div className="overflow-hidden flex items-center justify-center h-[240px] sm:h-[260px] xl:h-[280px] relative w-full mt-auto">
                <img
                  src="/assets/landing/3_share-it.webp"
                  alt="Share it graphic"
                  className="w-full h-full object-contain block scale-110 group-hover:scale-[1.18] transition-transform duration-500 ease-out"
                  referrerPolicy="no-referrer"
                />
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
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-bold text-[#17191C] tracking-[-0.035em] leading-[1.1]">
            Everything you need to share a link better.
          </h2>
          <p className="text-base lg:text-[18px] text-[#626A73] leading-[1.6] max-w-2xl mx-auto font-normal">
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
            <div className="lg:col-span-6 w-full bg-[#EDF1F5] rounded-2xl p-2 border border-[#E1E5E9]/70 overflow-hidden shadow-xs">
              <img
                src="/assets/landing/4_link-shorten.webp"
                alt="Link Shortener"
                className="w-full h-auto rounded-xl object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Text on Right */}
            <div className="lg:col-span-6 space-y-4 lg:pl-6 text-left">
              <p className="text-xs font-bold text-brand-primary tracking-widest uppercase">Utility 01</p>
              <h3 className="text-2xl sm:text-3xl lg:text-[40px] font-bold text-[#17191C] tracking-[-0.025em] leading-[1.1]">Make long links easier to share.</h3>
              <p className="text-sm sm:text-base lg:text-[18px] text-[#626A73] font-normal leading-[1.6]">
                Turn long URLs into clean, memorable Smyl links.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onTabChange?.("shortener")}
                  className="h-10 px-5 rounded-lg bg-[#EDF1F5] text-brand-primary font-semibold text-[14px] leading-5 hover:bg-[#E8EEFF] transition-all duration-150 inline-flex items-center gap-1.5 cursor-pointer border border-[#E1E5E9]/60"
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
              <h3 className="text-2xl sm:text-3xl lg:text-[40px] font-bold text-[#17191C] tracking-[-0.025em] leading-[1.1]">Turn any link into a QR code.</h3>
              <p className="text-sm sm:text-base lg:text-[18px] text-[#626A73] font-normal leading-[1.6]">
                Create a clean QR code ready for digital or physical sharing.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onTabChange?.("qr")}
                  className="h-10 px-5 rounded-lg bg-[#EDF1F5] text-brand-primary font-semibold text-[14px] leading-5 hover:bg-[#E8EEFF] transition-all duration-150 inline-flex items-center gap-1.5 cursor-pointer border border-[#E1E5E9]/60"
                >
                  <span>Create a QR code</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {/* Visual on Right */}
            <div className="order-1 lg:order-2 lg:col-span-6 w-full bg-[#EDF1F5] rounded-2xl p-2 border border-[#E1E5E9]/70 overflow-hidden shadow-xs">
              <img
                src="/assets/landing/5_qr-gen.webp"
                alt="QR Code Generator"
                className="w-full h-auto rounded-xl object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* UTILITY 03 — Link Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Visual on Left */}
            <div className="lg:col-span-6 w-full bg-[#EDF1F5] rounded-2xl p-2 border border-[#E1E5E9]/70 overflow-hidden shadow-xs">
              <img
                src="/assets/landing/6_link-preview.webp"
                alt="Link Preview"
                className="w-full h-auto rounded-xl object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Text on Right */}
            <div className="lg:col-span-6 space-y-4 lg:pl-6 text-left">
              <p className="text-xs font-bold text-brand-primary tracking-widest uppercase">Utility 03</p>
              <h3 className="text-2xl sm:text-3xl lg:text-[40px] font-bold text-[#17191C] tracking-[-0.025em] leading-[1.1]">See how your link will look before you share it.</h3>
              <p className="text-sm sm:text-base lg:text-[18px] text-[#626A73] font-normal leading-[1.6]">
                Preview the title, description, image and social presentation of a link.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onTabChange?.("preview")}
                  className="h-10 px-5 rounded-lg bg-[#EDF1F5] text-brand-primary font-semibold text-[14px] leading-5 hover:bg-[#E8EEFF] transition-all duration-150 inline-flex items-center gap-1.5 cursor-pointer border border-[#E1E5E9]/60"
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
              <h3 className="text-2xl sm:text-3xl lg:text-[40px] font-bold text-[#17191C] tracking-[-0.025em] leading-[1.1]">Know exactly what your link is sending.</h3>
              <p className="text-sm sm:text-base lg:text-[18px] text-[#626A73] font-normal leading-[1.6]">
                Inspect the metadata behind your social previews and identify missing information.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onTabChange?.("ogdebug")}
                  className="h-10 px-5 rounded-lg bg-[#EDF1F5] text-brand-primary font-semibold text-[14px] leading-5 hover:bg-[#E8EEFF] transition-all duration-150 inline-flex items-center gap-1.5 cursor-pointer border border-[#E1E5E9]/60"
                >
                  <span>Inspect a link</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {/* Visual on Right */}
            <div className="order-1 lg:order-2 lg:col-span-6 w-full bg-[#EDF1F5] rounded-2xl p-2 border border-[#E1E5E9]/70 overflow-hidden shadow-xs">
              <img
                src="/assets/landing/7_link-inspect.webp"
                alt="Open Graph Debugger"
                className="w-full h-auto rounded-xl object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* UTILITY 05 — UTM Builder */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Visual on Left */}
            <div className="lg:col-span-6 w-full bg-[#EDF1F5] rounded-2xl p-2 border border-[#E1E5E9]/70 overflow-hidden shadow-xs">
              <img
                src="/assets/landing/8_utm-link.webp"
                alt="UTM Link Builder"
                className="w-full h-auto rounded-xl object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Text on Right */}
            <div className="lg:col-span-6 space-y-4 lg:pl-6 text-left">
              <p className="text-xs font-bold text-brand-primary tracking-widest uppercase">Utility 05</p>
              <h3 className="text-2xl sm:text-3xl lg:text-[40px] font-bold text-[#17191C] tracking-[-0.025em] leading-[1.1]">Build campaign links without the manual work.</h3>
              <p className="text-sm sm:text-base lg:text-[18px] text-[#626A73] font-normal leading-[1.6]">
                Add clean UTM parameters to your URLs and keep campaign links organized.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onTabChange?.("utm")}
                  className="h-10 px-5 rounded-lg bg-[#EDF1F5] text-brand-primary font-semibold text-[14px] leading-5 hover:bg-[#E8EEFF] transition-all duration-150 inline-flex items-center gap-1.5 cursor-pointer border border-[#E1E5E9]/60"
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
              <p className="text-xs font-bold text-brand-primary tracking-widest uppercase">Utility 06</p>
              <h3 className="text-2xl sm:text-3xl lg:text-[40px] font-bold text-[#17191C] tracking-[-0.025em] leading-[1.1]">Put everything you share in one place.</h3>
              <p className="text-sm sm:text-base lg:text-[18px] text-[#626A73] font-normal leading-[1.6]">
                Create a simple Smyl destination for the links your audience needs.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onTabChange?.("hubs")}
                  className="h-10 px-5 rounded-lg bg-[#EDF1F5] text-[#0145F2] font-semibold text-[14px] leading-5 hover:bg-[#E8EEFF] transition-all duration-150 inline-flex items-center gap-1.5 cursor-pointer border border-[#E1E5E9]/60"
                >
                  <span>Create a link hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {/* Visual on Right */}
            <div className="order-1 lg:order-2 lg:col-span-6 w-full bg-[#EDF1F5] rounded-2xl p-2 border border-[#E1E5E9]/70 overflow-hidden shadow-xs">
              <img
                src="/assets/landing/9_link-hub.webp"
                alt="Link Hub"
                className="w-full h-auto rounded-xl object-cover"
                referrerPolicy="no-referrer"
              />
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
            <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-bold text-[#17191C] tracking-[-0.035em] leading-[1.1]">
              One tool. More ways to share.
            </h2>
            <p className="text-base lg:text-[18px] text-[#626A73] font-normal leading-[1.6]">
              Discover real high-fidelity artifacts created with Smyl.
            </p>
          </div>

          {/* Banner Image */}
          <div className="max-w-6xl mx-auto rounded-2xl overflow-hidden border border-[#E1E5E9]/50 shadow-xs bg-white p-1 hover:shadow-md hover:border-brand-primary/20 transition-all duration-300">
            <img
              src="/assets/landing/smyl_banner.png"
              alt="Smyl Sharing Formats and Platforms"
              className="w-full h-auto rounded-xl object-cover block"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* SECTION 07 — WHO IT IS FOR */}
      <section id="audiences" className="py-20 sm:py-24 bg-white border-y border-[#E1E5E9]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Heading */}
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <p className="text-brand-primary font-bold tracking-[0.15em] text-xs uppercase mb-1">
              AUDIENCE
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-bold text-[#17191C] tracking-[-0.035em] leading-[1.1]">
              Built for people who already share online.
            </h2>
          </div>

          {/* 4 Compact Audiences with Premium High-Quality Visuals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            
            {/* Creators */}
            <div className="bg-white border border-[#E1E5E9] rounded-2xl overflow-hidden hover:shadow-md hover:border-brand-primary/20 transition-all duration-300 group">
              <img
                src="/assets/landing/Final_1_Creators.webp"
                alt="Creators"
                className="w-full h-auto object-cover block"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Founders */}
            <div className="bg-white border border-[#E1E5E9] rounded-2xl overflow-hidden hover:shadow-md hover:border-brand-primary/20 transition-all duration-300 group">
              <img
                src="/assets/landing/Final_2_Founders.webp"
                alt="Founders"
                className="w-full h-auto object-cover block"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Marketers */}
            <div className="bg-white border border-[#E1E5E9] rounded-2xl overflow-hidden hover:shadow-md hover:border-brand-primary/20 transition-all duration-300 group">
              <img
                src="/assets/landing/Final_3_Marketers.webp"
                alt="Marketers"
                className="w-full h-auto object-cover block"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Teams */}
            <div className="bg-white border border-[#E1E5E9] rounded-2xl overflow-hidden hover:shadow-md hover:border-brand-primary/20 transition-all duration-300 group">
              <img
                src="/assets/landing/Final_4_Teams.webp"
                alt="Teams"
                className="w-full h-auto object-cover block"
                referrerPolicy="no-referrer"
              />
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
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-bold text-[#17191C] tracking-[-0.035em] leading-[1.1]">
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
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E1E5E9]/60">
        <div className="bg-[#0145F2] rounded-3xl p-8 sm:p-12 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-xl shadow-[#0145F2]/10">
          {/* Subtle design accents from the brand palette */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/10 rounded-full blur-2xl -ml-20 -mb-20 pointer-events-none" />
          
          <div className="space-y-4 max-w-xl text-center md:text-left z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.035em] text-white leading-[1.1]">
              Everything you need to share better.
            </h2>
            <p className="text-base sm:text-lg text-blue-100/90 leading-[1.6] font-normal">
              Shorten links, create QR codes, preview social cards, build campaign URLs, and turn your content into something worth sharing.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onOpenGenerator()}
                className="w-full sm:w-auto h-12 px-8 rounded-xl bg-white text-[#0145F2] font-bold text-[14px] leading-[20px] inline-flex items-center justify-center gap-2 hover:bg-blue-50 active:bg-blue-100 transition-all duration-150 cursor-pointer shadow-lg shadow-black/10 hover:scale-[1.02]"
              >
                <span>Create with Smyl</span>
                <ArrowRight className="w-4 h-4 text-[#0145F2]" />
              </button>
            </div>
          </div>

          {/* Graphic CTA.webp */}
          <img
            src="/assets/landing/CTA.webp"
            alt="Smyl Features Graphic"
            className="relative z-10 w-full max-w-[280px] sm:max-w-[340px] md:max-w-[400px] lg:max-w-[440px] h-auto object-contain select-none shrink-0 rounded-2xl"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>

    </div>
  );
};
