import React, { useState, useEffect, useRef, useCallback } from "react";
import Lenis from "lenis";
import {
  ParsedPost,
  CardCustomization,
  PlatformType,
  CanvasBackground,
  FontFamily,
  CardOrientation,
} from "./types";
import { PostCard } from "./components/PostCard";
import { CanvasWrapper } from "./components/CanvasWrapper";
import { LandingPage } from "./components/LandingPage";
import { LinkShortener } from "./components/LinkShortener";
import { ExportModal } from "./components/ExportModal";
import { ParsingModal } from "./components/ParsingModal";
import { KeyboardShortcutsModal } from "./components/KeyboardShortcutsModal";
import { AvatarModal } from "./components/AvatarModal";
import { BatchExportModal } from "./components/BatchExportModal";
import { AuthModal } from "./components/AuthModal";
import { OnboardingModal } from "./components/OnboardingModal";
import { Tooltip } from "./components/Tooltip";
import { SmylLogo, SmylIcon, SmylHeaderLogo, SmylLoader } from "./components/SmylLogo";
import { CardDatabase, SavedCard } from "./utils/db";
import { CardRepository } from "./services/cardService";
import { useAuth } from "./context/AuthContext";
import { parsePostClientFallback } from "./utils/parser";
import { toPng } from "html-to-image";
import { motion, AnimatePresence } from "motion/react";
import {
  IoDownload,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoLogoLinkedin,
  IoLogoTwitter,
  IoEye,
  IoCreate,
  IoCompass,
  IoOptions,
  IoTrash,
  IoImage,
  IoClose,
  IoSunny,
  IoMoon,
  IoSparkles,
  IoChevronDown,
  IoBookmark,
  IoCheckmark,
  IoCloudUpload,
  IoLayers,
  IoPerson,
  IoLogOut,
  IoKeypad,
  IoArrowUndoOutline,
  IoArrowRedoOutline,
  IoLink,
} from "react-icons/io5";
import { FiArrowRight, FiAlignLeft, FiAlignCenter, FiAlignRight, FiPlus, FiHash } from "react-icons/fi";

const DOTS_LIGHT_SVG = `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='3' cy='3' r='1.5' fill='%23626A73' fill-opacity='0.25'/%3E%3C/svg%3E")`;
const DOTS_DARK_SVG = `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='3' cy='3' r='1.5' fill='%23ffffff' fill-opacity='0.20'/%3E%3C/svg%3E")`;
const GRID_LIGHT_SVG = `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 24 0 L 0 0 0 24' fill='none' stroke='%2317191C' stroke-width='1' stroke-opacity='0.08'/%3E%3C/svg%3E")`;
const GRID_DARK_SVG = `url("data:image/svg+xml,%3Csvg width='28' height='28' viewBox='0 0 28 28' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 28 0 L 0 0 0 28' fill='none' stroke='%2338bdf8' stroke-width='1' stroke-opacity='0.15'/%3E%3C/svg%3E")`;
const LINES_GRADIENT_SVG = `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20L20 0' stroke='%23ffffff' stroke-width='1.2' stroke-opacity='0.18'/%3E%3C/svg%3E")`;
const BLUEPRINT_SVG = `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 32 L32 0 M0 0 L32 32' stroke='%23ffffff' stroke-width='0.75' stroke-opacity='0.12'/%3E%3C/svg%3E")`;
const CROSSES_SVG = `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 8v8M8 12h8' stroke='%23ffffff' stroke-width='1.2' stroke-opacity='0.20'/%3E%3C/svg%3E")`;

const BACKDROP_PRESETS: { id: CanvasBackground; name: string; style: React.CSSProperties }[] = [
  { id: "none", name: "None", style: { backgroundColor: "#F5F7F9", border: "1px solid #D0D7DE" } },
  { id: "solid-white", name: "White", style: { backgroundColor: "#ffffff", border: "1px solid #D0D7DE" } },
  { id: "solid-dark", name: "Dark", style: { backgroundColor: "#111418" } },
  { id: "gradient-sunset", name: "Sunset", style: { background: "linear-gradient(135deg, #ff7e5f, #ec4899)" } },
  { id: "gradient-ocean", name: "Ocean", style: { background: "linear-gradient(135deg, #00c6ff, #3b82f6)" } },
  { id: "gradient-twilight", name: "Twilight", style: { background: "linear-gradient(135deg, #1e1b4b, #581c87)" } },
  { id: "gradient-emerald", name: "Emerald", style: { background: "linear-gradient(135deg, #11998e, #38ef7d)" } },
  { id: "gradient-royal", name: "Royal", style: { background: "linear-gradient(135deg, #654ea3, #eaafc8)" } },
  { id: "gradient-cyber", name: "Cyber", style: { background: "linear-gradient(135deg, #8a2387, #e94057)" } },
  { id: "pattern-dots-light", name: "Dots Light", style: { backgroundColor: "#ffffff", backgroundImage: DOTS_LIGHT_SVG, border: "1px solid #D0D7DE" } },
  { id: "pattern-dots-dark", name: "Dots Dark", style: { backgroundColor: "#111418", backgroundImage: DOTS_DARK_SVG } },
  { id: "pattern-grid-light", name: "Grid Light", style: { backgroundColor: "#F8FAFC", backgroundImage: GRID_LIGHT_SVG, border: "1px solid #D0D7DE" } },
  { id: "pattern-grid-dark", name: "Grid Cyber", style: { backgroundColor: "#0B0F17", backgroundImage: GRID_DARK_SVG } },
  { id: "pattern-lines-gradient", name: "Sunset Lines", style: { background: `${LINES_GRADIENT_SVG}, linear-gradient(135deg, #ff7e5f, #ec4899)` } },
  { id: "pattern-blueprint", name: "Blueprint", style: { background: `${BLUEPRINT_SVG}, linear-gradient(135deg, #0f172a, #581c87)` } },
  { id: "pattern-crosses", name: "Plus Matrix", style: { background: `${CROSSES_SVG}, linear-gradient(135deg, #654ea3, #eaafc8)` } },
];

export interface CardStylePresetItem {
  id: string;
  name: string;
  badge: string;
  description: string;
  swatch: string;
  apply: Partial<CardCustomization>;
}

const CARD_STYLE_PRESETS: CardStylePresetItem[] = [
  {
    id: "polaroid",
    name: "Polaroid",
    badge: "Classic",
    description: "Spacious white frame & editorial Outfit font",
    swatch: "bg-white border-2 border-[#D0D7DE]",
    apply: {
      canvasBackground: "solid-white",
      canvasPadding: "48",
      theme: "light",
      fontFamily: "outfit",
      borderRadius: "md",
      shadowSize: "lg",
      showEngagement: true,
      showPlatformIcon: true,
    },
  },
  {
    id: "dark-minimalist",
    name: "Dark Mode Minimalist",
    badge: "Dark",
    description: "Sleek obsidian theme & ultra-clean Inter font",
    swatch: "bg-[#111418] border-2 border-[#334155]",
    apply: {
      canvasBackground: "solid-dark",
      canvasPadding: "16",
      theme: "dark",
      fontFamily: "inter",
      borderRadius: "xl",
      shadowSize: "sm",
      showEngagement: true,
      showPlatformIcon: true,
    },
  },
  {
    id: "tech-blueprint",
    name: "Tech Blueprint",
    badge: "Code",
    description: "Cyber gradient & JetBrains monospace typography",
    swatch: "bg-gradient-to-br from-[#8a2387] via-[#e94057] to-[#f27121]",
    apply: {
      canvasBackground: "gradient-cyber",
      canvasPadding: "32",
      theme: "retro",
      fontFamily: "mono",
      borderRadius: "md",
      shadowSize: "lg",
      showEngagement: true,
      showPlatformIcon: true,
    },
  },
  {
    id: "sunset-glow",
    name: "Sunset Glow",
    badge: "Vibrant",
    description: "Warm coral backdrop & clean Poppins typography",
    swatch: "bg-gradient-to-br from-[#ff7e5f] to-[#ec4899]",
    apply: {
      canvasBackground: "gradient-sunset",
      canvasPadding: "32",
      theme: "light",
      fontFamily: "poppins",
      borderRadius: "lg",
      shadowSize: "lg",
      showEngagement: true,
      showPlatformIcon: true,
    },
  },
  {
    id: "royal-indigo",
    name: "Royal Indigo",
    badge: "Luxury",
    description: "Deep amethyst backdrop & dark typography",
    swatch: "bg-gradient-to-br from-[#654ea3] to-[#eaafc8]",
    apply: {
      canvasBackground: "gradient-royal",
      canvasPadding: "32",
      theme: "dark",
      fontFamily: "display",
      borderRadius: "xl",
      shadowSize: "lg",
      showEngagement: true,
      showPlatformIcon: true,
    },
  },
  {
    id: "editorial-classic",
    name: "Editorial Classic",
    badge: "Serif",
    description: "Pure zero-padding card with Lora serif",
    swatch: "bg-[#F8FAFC] border border-[#CBD5E1]",
    apply: {
      canvasBackground: "none",
      canvasPadding: "0",
      theme: "light",
      fontFamily: "serif",
      borderRadius: "none",
      shadowSize: "none",
      showEngagement: true,
      showPlatformIcon: true,
    },
  },
];

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
];

const DEFAULT_POST: ParsedPost = {
  platform: "x",
  author: {
    name: "Alex Rivera",
    username: "@alexrivera",
    isVerified: true,
    avatarColor: "#0145F2",
    avatarText: "AR",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  },
  content: {
    text: "The best product design doesn't feel like design at all.\n\nIt feels like an obvious solution you wonder why nobody built before.\n\nSimple, focused, fast. #design #product",
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

const DEFAULT_CUSTOMIZATION: CardCustomization = {
  theme: "light",
  platform: "x",
  fontFamily: "sans",
  orientation: "auto",
  canvasPadding: "0",
  canvasBackground: "none",
  showEngagement: true,
  showPlatformIcon: true,
  isEditable: false,
  borderRadius: "lg",
  shadowSize: "md",
  textAlign: "left",
  fontSize: 15,
  backgroundBlur: 10,
};

export const App: React.FC = () => {
  const { user, profile, isAuthenticated, isConfigured, signOut } = useAuth();
  const [post, setPost] = useState<ParsedPost>(DEFAULT_POST);
  const [customization, setCustomization] = useState<CardCustomization>(DEFAULT_CUSTOMIZATION);
  const [pastedContent, setPastedContent] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<SavedCard[]>([]);
  const [activeTab, setActiveTab] = useState<"landing" | "customize" | "history" | "shortener">("landing");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isBatchExportModalOpen, setIsBatchExportModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [shortcutsEnabled, setShortcutsEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("smyl_shortcuts_enabled");
      return stored ? JSON.parse(stored) : false; // Default disabled as requested
    } catch (e) {
      return false;
    }
  });
  const [isWorkspaceBgDropdownOpen, setIsWorkspaceBgDropdownOpen] = useState(false);
  const [isCardStyleDropdownOpen, setIsCardStyleDropdownOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const [isAvatarDragOver, setIsAvatarDragOver] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [showAutoSaved, setShowAutoSaved] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMountRef = useRef(true);
  const lastScrollYRef = useRef(0);

  // Undo / Redo history stacks for card customization state
  const [undoStack, setUndoStack] = useState<CardCustomization[]>([]);
  const [redoStack, setRedoStack] = useState<CardCustomization[]>([]);

  // Update customization with undo/redo history tracking
  const updateCustomization = useCallback((updater: React.SetStateAction<CardCustomization>) => {
    setCustomization((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (JSON.stringify(prev) === JSON.stringify(next)) return prev;
      setUndoStack((stack) => [...stack.slice(-49), prev]);
      setRedoStack([]);
      return next;
    });
  }, []);

  const handleUndo = useCallback(() => {
    setUndoStack((prevUndo) => {
      if (prevUndo.length === 0) return prevUndo;
      const previous = prevUndo[prevUndo.length - 1];
      const newUndo = prevUndo.slice(0, -1);
      setCustomization((current) => {
        setRedoStack((prevRedo) => [...prevRedo, current]);
        return previous;
      });
      setSuccessMsg("Reverted customization change");
      return newUndo;
    });
  }, []);

  const handleRedo = useCallback(() => {
    setRedoStack((prevRedo) => {
      if (prevRedo.length === 0) return prevRedo;
      const next = prevRedo[prevRedo.length - 1];
      const newRedo = prevRedo.slice(0, -1);
      setCustomization((current) => {
        setUndoStack((prevUndo) => [...prevUndo, current]);
        return next;
      });
      setSuccessMsg("Reapplied customization change");
      return newRedo;
    });
  }, []);

  // Saved Avatars Library
  const [savedAvatars, setSavedAvatars] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem("smyl_saved_avatars");
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return PRESET_AVATARS;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardCanvasRef = useRef<HTMLDivElement>(null);

  // Scroll listener for hiding navbar on scroll down and revealing on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 70 && currentScrollY > lastScrollYRef.current + 4) {
        // Scrolling down -> hide navbar
        setIsNavVisible(false);
      } else if (currentScrollY < lastScrollYRef.current - 4 || currentScrollY <= 60) {
        // Scrolling up or at top -> show navbar
        setIsNavVisible(true);
      }
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Initialize smooth momentum scrolling via Lenis
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  // Load persistence & shared URL parameters & draft recovery
  useEffect(() => {
    // Initial fetch from CardRepository
    const loadCards = async () => {
      try {
        const saved = await CardRepository.getCards(user?.id);
        setHistory(saved);
      } catch (err) {
        setHistory(CardDatabase.getAll());
      }
    };
    loadCards();

    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get("share") || params.get("card");
    if (sharedData) {
      const decoded = CardDatabase.decodeShareLink(sharedData);
      if (decoded) {
        setPost(decoded.post);
        setCustomization(decoded.customization);
        setActiveTab("customize");
        setSuccessMsg("Loaded shared card layout!");
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }
    }

    // Auto-save draft recovery on page refresh
    const draft = CardDatabase.getDraft();
    if (draft && draft.post && draft.customization) {
      setPost(draft.post);
      setCustomization(draft.customization);
    }
  }, [user?.id]);

  // Auto-save post content and customization state to local storage on every change
  useEffect(() => {
    CardDatabase.saveDraft(post, customization);

    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    setShowAutoSaved(true);
    autoSaveTimerRef.current = setTimeout(() => {
      setShowAutoSaved(false);
    }, 2000);
  }, [post, customization]);

  // Notifications timeout
  useEffect(() => {
    if (successMsg || errorMsg) {
      const t = setTimeout(() => {
        setSuccessMsg(null);
        setErrorMsg(null);
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [successMsg, errorMsg]);

  // Keyboard shortcuts event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key closes modals unconditionally
      if (e.key === "Escape") {
        setIsExportModalOpen(false);
        setIsShortcutsModalOpen(false);
        setIsWorkspaceBgDropdownOpen(false);
        return;
      }

      const target = e.target as HTMLElement | null;
      const isInput =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      // Question mark (?) shortcut triggers the shortcuts modal when not in an input
      if (e.key === "?" && !isInput && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
        return;
      }

      // If shortcuts are toggled off by user, do not execute operational shortcuts
      if (!shortcutsEnabled) return;

      const isMac = typeof window !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const mod = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl+Z / Cmd+Z: Undo style customization change
      if (mod && (e.key === "z" || e.key === "Z")) {
        if (!isInput) {
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
        }
      }

      // Ctrl+Y / Cmd+Y: Redo style customization change
      if (mod && (e.key === "y" || e.key === "Y")) {
        if (!isInput) {
          e.preventDefault();
          handleRedo();
        }
      }

      // Ctrl+Enter / Cmd+Enter: Trigger Auto-Format / Parse Post
      if (mod && e.key === "Enter") {
        e.preventDefault();
        if (pastedContent.trim() && !isParsing) {
          handleParsePost();
        } else if (!pastedContent.trim()) {
          setErrorMsg("Type or paste a post URL/text first to auto-format.");
        }
      }

      // Ctrl+S / Cmd+S: Save current card layout to local history
      if (mod && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        const title = `${post.platform.toUpperCase()} - ${post.author.name}`;
        handleSaveTemplate(title);
      }

      // Ctrl+E / Cmd+E: Toggle Direct Text Editing Mode
      if (mod && (e.key === "e" || e.key === "E")) {
        e.preventDefault();
        setCustomization((prev) => ({ ...prev, isEditable: !prev.isEditable }));
        setSuccessMsg(customization.isEditable ? "Preview Mode active" : "Direct Edit Mode active");
      }

      // Ctrl+P / Cmd+P: Toggle Platform (X / LinkedIn)
      if (mod && (e.key === "p" || e.key === "P")) {
        e.preventDefault();
        const nextPlatform: PlatformType = customization.platform === "x" ? "linkedin" : "x";
        setCustomization((prev) => ({ ...prev, platform: nextPlatform }));
        setPost((prev) => ({ ...prev, platform: nextPlatform }));
        setSuccessMsg(`Switched layout to ${nextPlatform === "x" ? "X / Twitter" : "LinkedIn"}`);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcutsEnabled, pastedContent, isParsing, post, customization, handleUndo, handleRedo]);

  const handleToggleShortcuts = (enabled: boolean) => {
    setShortcutsEnabled(enabled);
    try {
      localStorage.setItem("smyl_shortcuts_enabled", JSON.stringify(enabled));
    } catch (e) {}
    setSuccessMsg(enabled ? "Keyboard shortcuts activated!" : "Keyboard shortcuts disabled.");
  };

  // Page Transition Handler with silky smooth ease in and ease out
  const handleTabChange = (nextTab: "landing" | "customize" | "history" | "shortener") => {
    if (nextTab === activeTab) return;
    setIsPageTransitioning(true);
    setTimeout(() => {
      setActiveTab(nextTab);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        setIsPageTransitioning(false);
      }, 160);
    }, 180);
  };

  const handleOpenStudioFromLanding = (samplePost?: ParsedPost, sampleCustomization?: Partial<CardCustomization>) => {
    setIsPageTransitioning(true);
    setTimeout(() => {
      if (samplePost) {
        setPost(samplePost);
      }
      if (sampleCustomization) {
        setCustomization((prev) => ({
          ...prev,
          ...sampleCustomization,
          isEditable: false, // Default to preview mode in editor
        }));
      } else if (samplePost) {
        setCustomization((prev) => ({
          ...prev,
          platform: samplePost.platform,
        }));
      }
      setActiveTab("customize");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        setIsPageTransitioning(false);
      }, 150);
    }, 180);
  };

  // Helper to handle real-time post URL / text input with auto-platform switching
  const handlePastedContentChange = (val: string) => {
    setPastedContent(val);
    const lower = val.toLowerCase();
    if (lower.includes("linkedin.com") || lower.includes("lnkd.in")) {
      setCustomization((prev) => ({ ...prev, platform: "linkedin" }));
      setPost((prev) => ({ ...prev, platform: "linkedin" }));
    } else if (lower.includes("twitter.com") || lower.includes("x.com")) {
      setCustomization((prev) => ({ ...prev, platform: "x" }));
      setPost((prev) => ({ ...prev, platform: "x" }));
    }
  };

  // Parse post via Server-Side Gemini endpoint with seamless client fallback & progress modal
  const handleParsePost = async () => {
    if (!pastedContent.trim()) {
      setErrorMsg("Please paste a post link or content first.");
      return;
    }

    const lower = pastedContent.toLowerCase();
    if (lower.includes("linkedin.com") || lower.includes("lnkd.in")) {
      setCustomization((prev) => ({ ...prev, platform: "linkedin" }));
      setPost((prev) => ({ ...prev, platform: "linkedin" }));
    } else if (lower.includes("twitter.com") || lower.includes("x.com")) {
      setCustomization((prev) => ({ ...prev, platform: "x" }));
      setPost((prev) => ({ ...prev, platform: "x" }));
    }

    setIsParsing(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/parse-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: pastedContent }),
      });

      if (!response.ok) {
        // Fallback to client-side heuristic parser
        const fallbackResult = parsePostClientFallback(pastedContent);
        setPost(fallbackResult.post);
        if (fallbackResult.customizationPartial) {
          setCustomization((prev) => ({
            ...prev,
            ...fallbackResult.customizationPartial,
          }));
        }
        setSuccessMsg("Parsed and loaded post layout!");
        setPastedContent("");
        return;
      }

      const parsed: ParsedPost = await response.json();
      setPost(parsed);
      setCustomization((prev) => ({
        ...prev,
        platform: parsed.platform,
      }));
      setSuccessMsg("Parsed and loaded post layout!");
      setPastedContent("");
    } catch (err: any) {
      // Fallback to client parser on network or parsing error
      try {
        const fallbackResult = parsePostClientFallback(pastedContent);
        setPost(fallbackResult.post);
        if (fallbackResult.customizationPartial) {
          setCustomization((prev) => ({
            ...prev,
            ...fallbackResult.customizationPartial,
          }));
        }
        setSuccessMsg("Parsed and loaded post layout!");
        setPastedContent("");
      } catch (fallbackErr) {
        setErrorMsg("Failed to parse post. Please check the link or content.");
      }
    } finally {
      // Minimum duration for the progress animation to feel smooth
      setTimeout(() => {
        setIsParsing(false);
      }, 700);
    }
  };

  // High-DPI PNG Exporter
  const handleDownloadPng = async () => {
    if (!cardCanvasRef.current) return;
    setIsDownloading(true);

    const wasEditable = customization.isEditable;
    if (wasEditable) {
      setCustomization((prev) => ({ ...prev, isEditable: false }));
      // Give React & DOM a brief moment to render clean preview without input frames
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    try {
      await document.fonts.ready;
      const dataUrl = await toPng(cardCanvasRef.current, {
        cacheBust: true,
        pixelRatio: 2.5,
      });

      const link = document.createElement("a");
      link.download = `smyl-${post.platform}-${post.author.username.replace("@", "") || "card"}.png`;
      link.href = dataUrl;
      link.click();
      setSuccessMsg("Exported high-res PNG!");
    } catch (err: any) {
      setErrorMsg("Could not export image: " + (err.message || "Unknown error"));
    } finally {
      if (wasEditable) {
        setCustomization((prev) => ({ ...prev, isEditable: true }));
      }
      setIsDownloading(false);
    }
  };

  // Share URL Generator
  const handleShareUrl = () => {
    const fullUrl = CardDatabase.generateShareLink(post, customization);
    navigator.clipboard.writeText(fullUrl);
    setSuccessMsg("Share URL copied to clipboard!");
  };

  // Save layout to Supabase Cloud
  const handleSaveTemplate = async (name: string) => {
    if (!user) {
      setErrorMsg("You must sign in to save templates.");
      setIsAuthModalOpen(true);
      return;
    }

    const title = name.trim() || `${post.platform.toUpperCase()} - ${post.author.name}`;
    const cardId = "card_" + Date.now();
    const savedCard = await CardRepository.saveCard(
      {
        id: cardId,
        name: title,
        post,
        customization,
      },
      user.id
    );
    setHistory((prev) => [savedCard, ...prev.filter((i) => i.id !== savedCard.id)]);
    setSuccessMsg(`Saved template: "${title}"`);
  };

  // Delete saved template
  const handleDeleteTemplate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await CardRepository.deleteCard(id, user?.id);
    setHistory((prev) => prev.filter((item) => item.id !== id));
    setSuccessMsg("Template removed from history.");
  };

  // Clear all post content in the Studio
  const handleClearAllContent = () => {
    setPost((prev) => ({
      ...prev,
      content: {
        text: "",
        hashtags: [],
        mentions: [],
        links: [],
      },
      engagement: {
        likes: 0,
        comments: 0,
        reposts: 0,
      },
    }));
    setPastedContent("");
    setSuccessMsg("Cleared card content and media.");
  };

  // Load saved template
  const handleLoadTemplate = (item: SavedCard) => {
    setIsPageTransitioning(true);
    setTimeout(() => {
      setPost(item.post);
      setCustomization(item.customization);
      setActiveTab("customize");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setSuccessMsg(`Loaded "${item.name}"`);
      setTimeout(() => {
        setIsPageTransitioning(false);
      }, 150);
    }, 180);
  };

  // Reset to default template
  const handleResetToDefault = () => {
    setPost(DEFAULT_POST);
    setCustomization(DEFAULT_CUSTOMIZATION);
    setSuccessMsg("Reset to default template.");
  };

  // Process image file for avatar and save to library
  const processAvatarFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPost((prev) => ({
        ...prev,
        author: {
          ...prev.author,
          avatarUrl: dataUrl,
        },
      }));
      setSavedAvatars((prev) => {
        if (prev.includes(dataUrl)) return prev;
        const updated = [dataUrl, ...prev.slice(0, 11)];
        try {
          localStorage.setItem("smyl_saved_avatars", JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
      setSuccessMsg("Avatar uploaded and saved to library!");
    };
    reader.readAsDataURL(file);
  };

  const handleSelectAvatar = (url: string) => {
    setPost((prev) => ({
      ...prev,
      author: {
        ...prev.author,
        avatarUrl: url,
      },
    }));
    setSuccessMsg("Avatar applied!");
  };

  const handleRemoveCurrentAvatar = () => {
    setPost((prev) => ({
      ...prev,
      author: {
        ...prev.author,
        avatarUrl: undefined,
      },
    }));
    setSuccessMsg("Avatar removed, using initials badge.");
  };

  const handleDeleteAvatarFromLibrary = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedAvatars((prev) => {
      const updated = prev.filter((a) => a !== url);
      try {
        localStorage.setItem("smyl_saved_avatars", JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });
    if (post.author.avatarUrl === url) {
      setPost((prev) => ({
        ...prev,
        author: {
          ...prev.author,
          avatarUrl: undefined,
        },
      }));
    }
    setSuccessMsg("Removed avatar from library.");
  };

  // Avatar Upload Handler
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processAvatarFile(file);
  };

  const handleAvatarDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsAvatarDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processAvatarFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#EDF1F5] font-sans antialiased text-[#17191C]">
      {/* Toast Notifications */}
      <AnimatePresence>
        {showAutoSaved && !successMsg && !errorMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-40 bg-[#17191C]/90 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg border border-white/10 flex items-center gap-1.5 backdrop-blur-md select-none pointer-events-none"
          >
            <IoCheckmarkCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Auto-saved</span>
          </motion.div>
        )}
      </AnimatePresence>

      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-emerald-500 text-emerald-800 text-xs font-semibold px-4 py-3 rounded-lg shadow-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <IoCheckmarkCircle className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-red-500 text-red-800 text-xs font-semibold px-4 py-3 rounded-lg shadow-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <IoAlertCircle className="w-4 h-4 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Parsing Progress Modal */}
      <ParsingModal isOpen={isParsing} inputContent={pastedContent} />

      {/* Page Transition Loader - Compact Bottom-Right Floating Pill without Bar */}
      <AnimatePresence>
        {isPageTransitioning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-50 bg-white/95 backdrop-blur-md border border-[#E1E5E9] shadow-lg rounded-full p-2.5 flex items-center justify-center"
            title="Loading page..."
          >
            <SmylLoader size="sm" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Centered Pilled Floating Header Navbar (Scroll-responsive hide/show) */}
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: isNavVisible ? 0 : -85 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="fixed top-3.5 left-0 right-0 z-40 px-4 w-full flex justify-center pointer-events-none"
      >
        <div className="w-full max-w-5xl bg-white/95 backdrop-blur-md border border-[#E1E5E9] shadow-xs rounded-2xl h-13 px-3.5 sm:px-5 grid grid-cols-3 items-center pointer-events-auto transition-all">
          {/* Col 1: Logo & Brand */}
          <div className="flex items-center justify-start">
            <div
              onClick={() => handleTabChange("landing")}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <SmylLogo className="h-6 sm:h-6.5 w-auto transition-transform group-hover:scale-105" />
            </div>
          </div>

          {/* Col 2: Navigation Items Centered */}
          <div className="flex items-center justify-center">
            <nav className="relative flex items-center gap-1 bg-[#EDF1F5] p-1 rounded-xl">
              <button
                onClick={() => handleTabChange("customize")}
                className={`relative z-10 h-8 px-3 sm:px-4 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer w-auto ${
                  activeTab === "customize" ? "text-brand-primary font-bold" : "text-[#626A73] hover:text-[#17191C]"
                }`}
              >
                {activeTab === "customize" && (
                  <motion.div
                    layoutId="header-nav-pill"
                    className="absolute inset-0 bg-white rounded-lg shadow-xs -z-10"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <IoCreate className="w-3.5 h-3.5 shrink-0" />
                <span>Studio</span>
              </button>

              <button
                onClick={() => handleTabChange("shortener")}
                className={`relative z-10 h-8 px-3 sm:px-4 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer w-auto ${
                  activeTab === "shortener" ? "text-brand-primary font-bold" : "text-[#626A73] hover:text-[#17191C]"
                }`}
              >
                {activeTab === "shortener" && (
                  <motion.div
                    layoutId="header-nav-pill"
                    className="absolute inset-0 bg-white rounded-lg shadow-xs -z-10"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <IoLink className="w-3.5 h-3.5 shrink-0" />
                <span>Shortener</span>
              </button>

              <button
                onClick={() => handleTabChange("history")}
                className={`relative z-10 h-8 px-3 sm:px-4 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer w-auto ${
                  activeTab === "history" ? "text-brand-primary font-bold" : "text-[#626A73] hover:text-[#17191C]"
                }`}
              >
                {activeTab === "history" && (
                  <motion.div
                    layoutId="header-nav-pill"
                    className="absolute inset-0 bg-white rounded-lg shadow-xs -z-10"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <IoBookmark className="w-3.5 h-3.5 shrink-0" />
                <span>Saved ({history.length})</span>
              </button>
            </nav>
          </div>

          {/* Col 3: Right Actions: Faded Shortcuts & Auth Account */}
          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsShortcutsModalOpen(true)}
              className="p-1.5 text-[#8D959F] hover:text-[#17191C] hover:bg-[#F5F7F9] rounded-lg transition-colors cursor-pointer relative flex items-center justify-center"
              title="Keyboard Shortcuts (Press ?)"
            >
              <IoKeypad className="w-4 h-4 text-current opacity-70 hover:opacity-100" />
              <span
                className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${
                  shortcutsEnabled ? "bg-emerald-500 animate-pulse" : "bg-[#8D959F]"
                }`}
                title={shortcutsEnabled ? "Shortcuts Active" : "Shortcuts Inactive"}
              />
            </button>

            {/* Auth Sign In / User Profile Button */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                  className="h-8 px-2.5 rounded-lg border border-[#D0D7DE] bg-white text-xs font-semibold text-[#17191C] flex items-center gap-2 hover:bg-[#F8FAFC] transition-colors cursor-pointer shadow-xs"
                >
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.display_name || "Profile"}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-brand-primary text-white text-[10px] font-bold flex items-center justify-center">
                      {(profile?.display_name || user.email || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden md:inline max-w-[100px] truncate text-[11px]">
                    {profile?.display_name || user.email?.split("@")[0]}
                  </span>
                  <IoChevronDown className="w-3 h-3 text-[#626A73]" />
                </button>

                {/* Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl border border-[#E1E5E9] shadow-xl p-1.5 z-50 text-xs animate-in fade-in duration-150"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-3 py-2 border-b border-[#ECEEF1]">
                      <p className="font-bold text-[#17191C] truncate">{profile?.display_name || "Account"}</p>
                      <p className="text-[10px] text-[#626A73] truncate">{user.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        setIsOnboardingModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-[#17191C] hover:bg-[#F5F7F9] font-medium flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <IoPerson className="w-3.5 h-3.5 text-[#626A73]" />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        setIsProfileDropdownOpen(false);
                        await signOut();
                        setSuccessMsg("Signed out successfully");
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 font-medium flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <IoLogOut className="w-3.5 h-3.5 text-rose-600" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="h-8 px-3.5 rounded-lg bg-brand-primary text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-brand-hover active:bg-brand-pressed transition-colors cursor-pointer shadow-xs"
              >
                <span>Try Now</span>
              </button>
            )}
          </div>
        </div>
      </motion.header>

      {/* Main Content Area */}
      <main className="flex-grow w-full pt-16 sm:pt-20">
        {activeTab === "landing" ? (
          <LandingPage
            onOpenGenerator={handleOpenStudioFromLanding}
            onBecomeUser={() => {
              if (isAuthenticated) {
                setSuccessMsg("You are already signed in! Enjoy the Studio.");
                handleTabChange("customize");
              } else {
                setIsAuthModalOpen(true);
              }
            }}
          />
        ) : activeTab === "customize" ? (
          <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">

            {/* TWO COLUMN WORKSPACE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: Sidebar Customization Controls (Unboxed) */}
              <div className="lg:col-span-4 space-y-4">
                <div className="space-y-4">
                  
                  {/* STUDIO CONTROLS HEADER WITH UNDO/REDO */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#D0D7DE]/60">
                    <div>
                      <h2 className="font-bold text-[#17191C] text-sm">Studio Controls</h2>
                      <p className="text-xs text-[#626A73]">Customize card style & parameters</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleUndo}
                        disabled={undoStack.length === 0}
                        className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                          undoStack.length > 0
                            ? "bg-white border-[#D0D7DE] text-[#17191C] hover:bg-[#F5F7F9] hover:border-brand-primary active:scale-95 shadow-2xs"
                            : "bg-[#F5F7F9] border-[#E1E5E9] text-[#8D959F] cursor-not-allowed opacity-50"
                        }`}
                        title={undoStack.length > 0 ? `Undo style change (${undoStack.length} step${undoStack.length > 1 ? 's' : ''}) [Ctrl+Z]` : "Nothing to undo"}
                      >
                        <IoArrowUndoOutline className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={handleRedo}
                        disabled={redoStack.length === 0}
                        className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                          redoStack.length > 0
                            ? "bg-white border-[#D0D7DE] text-[#17191C] hover:bg-[#F5F7F9] hover:border-brand-primary active:scale-95 shadow-2xs"
                            : "bg-[#F5F7F9] border-[#E1E5E9] text-[#8D959F] cursor-not-allowed opacity-50"
                        }`}
                        title={redoStack.length > 0 ? `Redo style change (${redoStack.length} step${redoStack.length > 1 ? 's' : ''}) [Ctrl+Y]` : "Nothing to redo"}
                      >
                        <IoArrowRedoOutline className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* CARD STYLES SECTION (Dropdown with Swatch + Title only) */}
                  <div className="pb-3 border-b border-[#D0D7DE]/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-[#626A73] uppercase tracking-wider">
                        Card Style Preset
                      </label>
                      {CARD_STYLE_PRESETS.some(
                        (preset) =>
                          customization.canvasBackground === preset.apply.canvasBackground &&
                          customization.theme === preset.apply.theme &&
                          customization.fontFamily === preset.apply.fontFamily
                      ) && (
                        <span className="text-[10px] uppercase font-bold tracking-wider text-brand-primary bg-brand-soft px-1.5 py-0.5 rounded">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="relative">
                      {(() => {
                        const activePreset = CARD_STYLE_PRESETS.find(
                          (preset) =>
                            customization.canvasBackground === preset.apply.canvasBackground &&
                            customization.theme === preset.apply.theme &&
                            customization.fontFamily === preset.apply.fontFamily
                        );

                        return (
                          <>
                            <button
                              type="button"
                              onClick={() => setIsCardStyleDropdownOpen((prev) => !prev)}
                              className="w-full h-10 px-3 rounded-xl border border-[#D0D7DE] bg-white text-xs font-semibold flex items-center justify-between hover:border-brand-primary transition-all cursor-pointer shadow-2xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {activePreset ? (
                                  <div className={`w-4 h-4 rounded-full ${activePreset.swatch} flex-shrink-0`} />
                                ) : (
                                  <div className="w-4 h-4 rounded-full bg-brand-soft border border-brand-primary flex items-center justify-center flex-shrink-0">
                                    <IoSparkles className="w-2.5 h-2.5 text-brand-primary" />
                                  </div>
                                )}
                                <span className="text-[#17191C] font-semibold truncate">
                                  {activePreset ? activePreset.name : "Custom Configuration"}
                                </span>
                              </div>
                              <IoChevronDown
                                className={`w-4 h-4 text-[#626A73] transition-transform duration-200 ${
                                  isCardStyleDropdownOpen ? "rotate-180" : ""
                                }`}
                              />
                            </button>

                            <AnimatePresence>
                              {isCardStyleDropdownOpen && (
                                <>
                                  <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsCardStyleDropdownOpen(false)}
                                  />
                                  <motion.div
                                    initial={{ opacity: 0, y: -4, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute left-0 right-0 mt-1.5 p-1.5 bg-white border border-[#D0D7DE] rounded-xl shadow-lg z-50 space-y-1 max-h-60 overflow-y-auto"
                                  >
                                    {CARD_STYLE_PRESETS.map((preset) => {
                                      const isPresetActive =
                                        customization.canvasBackground === preset.apply.canvasBackground &&
                                        customization.theme === preset.apply.theme &&
                                        customization.fontFamily === preset.apply.fontFamily;

                                      return (
                                        <button
                                          key={preset.id}
                                          type="button"
                                          onClick={() => {
                                            updateCustomization((prev) => ({
                                              ...prev,
                                              ...preset.apply,
                                            }));
                                            setIsCardStyleDropdownOpen(false);
                                            setSuccessMsg(`Applied "${preset.name}" preset!`);
                                          }}
                                          className={`w-full px-2.5 py-2 rounded-lg flex items-center justify-between text-xs font-semibold transition-colors cursor-pointer ${
                                            isPresetActive
                                              ? "bg-brand-soft text-brand-primary font-bold"
                                              : "text-[#17191C] hover:bg-[#F5F7F9]"
                                          }`}
                                        >
                                          <div className="flex items-center gap-2.5">
                                            <div className={`w-4 h-4 rounded-full ${preset.swatch} flex-shrink-0`} />
                                            <span>{preset.name}</span>
                                          </div>
                                          {isPresetActive && (
                                            <IoCheckmark className="w-4 h-4 text-brand-primary" />
                                          )}
                                        </button>
                                      );
                                    })}
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="pb-1 border-b border-[#D0D7DE]/60">
                    <h2 className="font-bold text-[#17191C] text-sm">Layout Settings</h2>
                    <p className="text-xs text-[#626A73]">Fine-tune canvas padding, orientation, shadows, and content.</p>
                  </div>

                  {/* 1. Orientation & Padding */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#626A73] uppercase tracking-wider mb-1.5">
                        Orientation
                      </label>
                      <div className="relative">
                        <select
                          value={customization.orientation}
                          onChange={(e) =>
                            updateCustomization((prev) => ({ ...prev, orientation: e.target.value as CardOrientation }))
                          }
                          className="w-full h-9 pl-3 pr-7 text-xs font-semibold rounded-lg border border-[#D0D7DE] bg-white text-[#17191C] hover:bg-[#F8FAFC] focus:outline-none focus:border-brand-primary cursor-pointer appearance-none shadow-xs transition-colors"
                        >
                          <option value="auto">Auto (Standard)</option>
                          <option value="landscape">Landscape Wide</option>
                          <option value="portrait">Portrait Tall</option>
                          <option value="square">Square 1:1</option>
                        </select>
                        <IoChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-[#8D959F] w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#626A73] uppercase tracking-wider mb-1.5">
                        Canvas Padding
                      </label>
                      <div className="relative">
                        <select
                          value={customization.canvasPadding}
                          onChange={(e) =>
                            updateCustomization((prev) => ({ ...prev, canvasPadding: e.target.value as any }))
                          }
                          className="w-full h-9 pl-3 pr-7 text-xs font-semibold rounded-lg border border-[#D0D7DE] bg-white text-[#17191C] hover:bg-[#F8FAFC] focus:outline-none focus:border-brand-primary cursor-pointer appearance-none shadow-xs transition-colors"
                        >
                          <option value="0">None (0px)</option>
                          <option value="16">Compact (16px)</option>
                          <option value="32">Medium (32px)</option>
                          <option value="48">Spacious (48px)</option>
                          <option value="64">Extra Large (64px)</option>
                        </select>
                        <IoChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-[#8D959F] w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* 2. Rounded Corners & Shadow */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#626A73] uppercase tracking-wider mb-1">
                        Corners
                      </label>
                      <div className="relative">
                        <select
                          value={customization.borderRadius}
                          onChange={(e) =>
                            updateCustomization((prev) => ({ ...prev, borderRadius: e.target.value as any }))
                          }
                          className="w-full h-9 pl-3 pr-7 text-xs font-semibold rounded-lg border border-[#D0D7DE] bg-white text-[#17191C] hover:bg-[#F8FAFC] focus:outline-none focus:border-brand-primary cursor-pointer appearance-none shadow-xs transition-colors"
                        >
                          <option value="none">Square (0px)</option>
                          <option value="sm">Small (8px)</option>
                          <option value="md">Medium (12px)</option>
                          <option value="lg">Large (16px)</option>
                          <option value="xl">Extra (24px)</option>
                        </select>
                        <IoChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-[#8D959F] w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#626A73] uppercase tracking-wider mb-1">
                        Shadow
                      </label>
                      <div className="relative">
                        <select
                          value={customization.shadowSize}
                          onChange={(e) =>
                            updateCustomization((prev) => ({ ...prev, shadowSize: e.target.value as any }))
                          }
                          className="w-full h-9 pl-3 pr-7 text-xs font-semibold rounded-lg border border-[#D0D7DE] bg-white text-[#17191C] hover:bg-[#F8FAFC] focus:outline-none focus:border-brand-primary cursor-pointer appearance-none shadow-xs transition-colors"
                        >
                          <option value="none">None</option>
                          <option value="sm">Subtle</option>
                          <option value="md">Elevated</option>
                          <option value="lg">Heavy</option>
                        </select>
                        <IoChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-[#8D959F] w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* 3. Text Alignment & Font Size Controls */}
                  <div className="pt-2 border-t border-[#D0D7DE]/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-[#626A73] uppercase tracking-wider">
                        Text Alignment
                      </label>
                      <div className="flex bg-[#E1E5E9]/80 p-0.5 rounded-lg">
                        <button
                          type="button"
                          onClick={() => updateCustomization((prev) => ({ ...prev, textAlign: "left" }))}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            (customization.textAlign || "left") === "left"
                              ? "bg-white text-brand-primary shadow-xs"
                              : "text-[#626A73] hover:text-[#17191C]"
                          }`}
                          title="Align Left"
                        >
                          <FiAlignLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateCustomization((prev) => ({ ...prev, textAlign: "center" }))}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            customization.textAlign === "center"
                              ? "bg-white text-brand-primary shadow-xs"
                              : "text-[#626A73] hover:text-[#17191C]"
                          }`}
                          title="Align Center"
                        >
                          <FiAlignCenter className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateCustomization((prev) => ({ ...prev, textAlign: "right" }))}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            customization.textAlign === "right"
                              ? "bg-white text-brand-primary shadow-xs"
                              : "text-[#626A73] hover:text-[#17191C]"
                          }`}
                          title="Align Right"
                        >
                          <FiAlignRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Font Size Slider */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-bold text-[#626A73] uppercase tracking-wider">
                          Base Font Size
                        </label>
                        <span className="text-xs font-semibold text-[#17191C] px-2 py-0.5 rounded bg-[#EDF1F5] border border-[#D0D7DE]">
                          {customization.fontSize || 15}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="12"
                        max="24"
                        step="1"
                        value={customization.fontSize || 15}
                        onChange={(e) =>
                          updateCustomization((prev) => ({ ...prev, fontSize: Number(e.target.value) }))
                        }
                        className="w-full h-1.5 bg-[#D0D7DE] rounded-lg appearance-none cursor-pointer accent-brand-primary"
                      />
                    </div>

                    {/* Gradient & Pattern Background Blur Slider (Shown when gradient or pattern backdrop is active) */}
                    {(customization.canvasBackground.startsWith("gradient-") || customization.canvasBackground.startsWith("pattern-")) && (
                      <div className="pt-2 border-t border-[#D0D7DE]/60">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-bold text-[#626A73] uppercase tracking-wider">
                            Backdrop Blur Intensity
                          </label>
                          <span className="text-xs font-semibold text-[#17191C] px-2 py-0.5 rounded bg-[#EDF1F5] border border-[#D0D7DE]">
                            {customization.backgroundBlur ?? 10}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="24"
                          step="1"
                          value={customization.backgroundBlur ?? 10}
                          onChange={(e) =>
                            updateCustomization((prev) => ({ ...prev, backgroundBlur: Number(e.target.value) }))
                          }
                          className="w-full h-1.5 bg-[#D0D7DE] rounded-lg appearance-none cursor-pointer accent-brand-primary"
                        />
                      </div>
                    )}
                  </div>

                  {/* 4. Toggles (Platform Icon, Engagement, Hashtag Cloud) */}
                  <div className="pt-2 border-t border-[#D0D7DE]/60 space-y-2.5">
                    <label className="flex items-center justify-between text-xs font-semibold text-[#17191C] cursor-pointer hover:text-brand-primary transition-colors">
                      <span>Show Platform Icon</span>
                      <input
                        type="checkbox"
                        checked={customization.showPlatformIcon}
                        onChange={(e) =>
                          updateCustomization((prev) => ({ ...prev, showPlatformIcon: e.target.checked }))
                        }
                        className="w-4 h-4 text-brand-primary rounded border-[#D0D7DE] focus:ring-brand-primary cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between text-xs font-semibold text-[#17191C] cursor-pointer hover:text-brand-primary transition-colors">
                      <span>Show Engagement Metrics</span>
                      <input
                        type="checkbox"
                        checked={customization.showEngagement}
                        onChange={(e) =>
                          updateCustomization((prev) => ({ ...prev, showEngagement: e.target.checked }))
                        }
                        className="w-4 h-4 text-brand-primary rounded border-[#D0D7DE] focus:ring-brand-primary cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between text-xs font-semibold text-[#17191C] cursor-pointer hover:text-brand-primary transition-colors">
                      <div className="flex items-center gap-1.5">
                        <FiHash className="w-3.5 h-3.5 text-brand-primary" />
                        <span>Hashtag Cloud Badges</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={customization.showHashtagCloud || false}
                        onChange={(e) =>
                          updateCustomization((prev) => ({ ...prev, showHashtagCloud: e.target.checked }))
                        }
                        className="w-4 h-4 text-brand-primary rounded border-[#D0D7DE] focus:ring-brand-primary cursor-pointer"
                      />
                    </label>
                  </div>

                  {/* 5. Avatar Image Manager (3 Visible Avatars + 4th Modal Trigger) */}
                  <div className="pt-2 border-t border-[#D0D7DE]/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-[#626A73] uppercase tracking-wider">
                        Avatar
                      </label>
                      {post.author.avatarUrl ? (
                        <button
                          type="button"
                          onClick={handleRemoveCurrentAvatar}
                          className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                          title="Remove custom photo and use initials"
                        >
                          Use Initials
                        </button>
                      ) : (
                        <span className="text-[10px] text-[#8D959F]">Initials badge active</span>
                      )}
                    </div>

                    {/* 4 Items Horizontal Row: 3 Avatars + 1 Modal Trigger Button */}
                    <div className="grid grid-cols-4 gap-2.5 items-center">
                      {savedAvatars.slice(0, 3).map((url, idx) => {
                        const isSelected = post.author.avatarUrl === url;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectAvatar(url)}
                            className={`relative rounded-full aspect-square border-2 transition-all overflow-hidden cursor-pointer ${
                              isSelected
                                ? "border-brand-primary ring-2 ring-brand-primary/30 shadow-xs"
                                : "border-[#D0D7DE] hover:border-brand-primary opacity-85 hover:opacity-100"
                            }`}
                            title={`Select Avatar ${idx + 1}`}
                          >
                            <img
                              src={url}
                              alt={`Avatar ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {isSelected && (
                              <div className="absolute inset-0 bg-brand-primary/35 flex items-center justify-center">
                                <IoCheckmark className="w-3.5 h-3.5 text-white font-bold" />
                              </div>
                            )}
                          </button>
                        );
                      })}

                      {/* 4th Item: Open Avatar Library & Upload Modal */}
                      <button
                        type="button"
                        onClick={() => setIsAvatarModalOpen(true)}
                        className="aspect-square rounded-full border-2 border-dashed border-brand-primary/60 bg-brand-soft/50 hover:bg-brand-soft text-brand-primary flex flex-col items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105"
                        title="Open Avatar Library & Upload Modal"
                      >
                        <FiPlus className="w-4 h-4 text-brand-primary" />
                        <span className="text-[9px] font-bold leading-none mt-0.5">More</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* RIGHT COLUMN: Live Canvas & Mode Toggles */}
              <div className="lg:col-span-8 space-y-4">
                
                {/* TOP ROW: URL Input & Auto-Format Post Button (Occupying spot right beside Card Style Preset) */}
                <div className="pb-3 border-b border-[#D0D7DE]/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-[#626A73] uppercase tracking-wider">
                      Import / Draft Post
                    </label>
                    <span className="text-[10px] text-[#8D959F]">X / LinkedIn URL or raw draft</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 items-center">
                    <div className="relative flex-1 w-full">
                      <input
                        type="text"
                        value={pastedContent}
                        onChange={(e) => handlePastedContentChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && pastedContent.trim()) {
                            handleParsePost();
                          }
                        }}
                        placeholder="Paste X / LinkedIn post URL or raw draft..."
                        className="w-full h-10 pl-3.5 pr-10 text-xs sm:text-sm rounded-xl border border-[#D0D7DE] bg-white text-[#17191C] placeholder-[#8D959F] shadow-2xs focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
                      />
                      {pastedContent && (
                        <button
                          type="button"
                          onClick={() => setPastedContent("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8D959F] hover:text-[#17191C] cursor-pointer"
                        >
                          <IoClose className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleClearAllContent}
                        title="Clear all text content and attached images from current card"
                        className="w-full sm:w-auto h-10 px-3.5 rounded-xl border border-[#D0D7DE] bg-white text-[#626A73] hover:text-[#17191C] hover:bg-[#F8FAFC] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs flex-shrink-0"
                      >
                        <IoTrash className="w-4 h-4 text-[#8D959F]" />
                        <span>Clear All</span>
                      </button>

                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={handleParsePost}
                        disabled={isParsing || !pastedContent.trim()}
                        className="w-full sm:w-auto h-10 px-5 rounded-xl bg-brand-primary text-white font-semibold text-xs flex items-center justify-center gap-2 hover:bg-brand-hover active:bg-brand-pressed transition-colors disabled:opacity-50 cursor-pointer shadow-2xs flex-shrink-0"
                      >
                        <IoLayers className="w-4 h-4" />
                        <span>{isParsing ? "Parsing..." : "Auto-Format Post"}</span>
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* SECOND LINE OF CONTROLS (Mode, Layout, Theme, Font, Backdrop Dropdown - Unboxed) */}
                <div className="flex flex-wrap items-center justify-between gap-3 relative z-30 pb-0.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    
                    {/* 1. Mode Selector (Icons-only as requested) */}
                    <div className="relative flex bg-[#E1E5E9]/70 p-1 rounded-lg" title="Toggle Edit Mode">
                      <button
                        type="button"
                        onClick={() => updateCustomization((prev) => ({ ...prev, isEditable: false }))}
                        className={`relative z-10 p-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer flex items-center justify-center w-8 h-8 ${
                          !customization.isEditable ? "text-brand-primary" : "text-[#626A73] hover:text-[#17191C]"
                        }`}
                        title="Live Preview Mode"
                      >
                        {!customization.isEditable && (
                          <motion.div
                            layoutId="studio-mode-pill"
                            className="absolute inset-0 bg-white rounded-md shadow-xs -z-10"
                            transition={{ type: "spring", stiffness: 450, damping: 35 }}
                          />
                        )}
                        <IoEye className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => updateCustomization((prev) => ({ ...prev, isEditable: true }))}
                        className={`relative z-10 p-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer flex items-center justify-center w-8 h-8 ${
                          customization.isEditable ? "text-brand-primary" : "text-[#626A73] hover:text-[#17191C]"
                        }`}
                        title="Direct Text Editing Mode"
                      >
                        {customization.isEditable && (
                          <motion.div
                            layoutId="studio-mode-pill"
                            className="absolute inset-0 bg-white rounded-md shadow-xs -z-10"
                            transition={{ type: "spring", stiffness: 450, damping: 35 }}
                          />
                        )}
                        <IoCreate className="w-4 h-4" />
                      </button>
                    </div>

                    {/* 2. Platform/Layout Toggle (Icons-only as requested) */}
                    <div className="relative flex bg-[#E1E5E9]/70 p-1 rounded-lg" title="Toggle Social Card Layout">
                      <button
                        type="button"
                        onClick={() => updateCustomization((prev) => ({ ...prev, platform: "x" }))}
                        className={`relative z-10 p-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer flex items-center justify-center w-8 h-8 ${
                          customization.platform === "x" ? "text-[#1D9BF0]" : "text-[#626A73] hover:text-[#17191C]"
                        }`}
                        title="Format for Twitter/X"
                      >
                        {customization.platform === "x" && (
                          <motion.div
                            layoutId="studio-platform-pill"
                            className="absolute inset-0 bg-white rounded-md shadow-xs -z-10"
                            transition={{ type: "spring", stiffness: 450, damping: 35 }}
                          />
                        )}
                        <IoLogoTwitter className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => updateCustomization((prev) => ({ ...prev, platform: "linkedin" }))}
                        className={`relative z-10 p-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer flex items-center justify-center w-8 h-8 ${
                          customization.platform === "linkedin" ? "text-[#0A66C2]" : "text-[#626A73] hover:text-[#17191C]"
                        }`}
                        title="Format for LinkedIn"
                      >
                        {customization.platform === "linkedin" && (
                          <motion.div
                            layoutId="studio-platform-pill"
                            className="absolute inset-0 bg-white rounded-md shadow-xs -z-10"
                            transition={{ type: "spring", stiffness: 450, damping: 35 }}
                          />
                        )}
                        <IoLogoLinkedin className="w-4 h-4" />
                      </button>
                    </div>

                    {/* 3. Theme Selector (Light, Dark, Retro) */}
                    <div className="relative flex bg-[#E1E5E9]/70 p-1 rounded-lg" title="Change Card Theme">
                      <button
                        type="button"
                        onClick={() => updateCustomization((prev) => ({ ...prev, theme: "light" }))}
                        className={`relative z-10 p-1.5 rounded-md transition-colors cursor-pointer flex items-center justify-center w-8 h-8 ${
                          customization.theme === "light" ? "text-brand-primary" : "text-[#626A73] hover:text-[#17191C]"
                        }`}
                        title="Light Theme"
                      >
                        {customization.theme === "light" && (
                          <motion.div
                            layoutId="studio-theme-pill"
                            className="absolute inset-0 bg-white rounded-md shadow-xs -z-10"
                            transition={{ type: "spring", stiffness: 450, damping: 35 }}
                          />
                        )}
                        <IoSunny className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => updateCustomization((prev) => ({ ...prev, theme: "dark" }))}
                        className={`relative z-10 p-1.5 rounded-md transition-colors cursor-pointer flex items-center justify-center w-8 h-8 ${
                          customization.theme === "dark" ? "text-white" : "text-[#626A73] hover:text-[#17191C]"
                        }`}
                        title="Dark Theme"
                      >
                        {customization.theme === "dark" && (
                          <motion.div
                            layoutId="studio-theme-pill"
                            className="absolute inset-0 bg-[#0A0D12] rounded-md shadow-xs -z-10"
                            transition={{ type: "spring", stiffness: 450, damping: 35 }}
                          />
                        )}
                        <IoMoon className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => updateCustomization((prev) => ({ ...prev, theme: "retro" }))}
                        className={`relative z-10 p-1.5 rounded-md transition-colors cursor-pointer flex items-center justify-center w-8 h-8 ${
                          customization.theme === "retro" ? "text-[#78350F]" : "text-[#626A73] hover:text-[#17191C]"
                        }`}
                        title="Retro Theme"
                      >
                        {customization.theme === "retro" && (
                          <motion.div
                            layoutId="studio-theme-pill"
                            className="absolute inset-0 bg-[#FEF3C7] rounded-md shadow-xs -z-10"
                            transition={{ type: "spring", stiffness: 450, damping: 35 }}
                          />
                        )}
                        <IoSparkles className="w-4 h-4" />
                      </button>
                    </div>

                    {/* 4. Font Family Selector (Compact Typography Dropdown) */}
                    <div className="relative">
                      <select
                        value={customization.fontFamily}
                        onChange={(e) =>
                          updateCustomization((prev) => ({ ...prev, fontFamily: e.target.value as FontFamily }))
                        }
                        className="h-8 pl-2.5 pr-6 text-xs font-semibold rounded-lg border border-[#D0D7DE] bg-white text-[#17191C] hover:bg-[#F8FAFC] focus:outline-none focus:border-brand-primary cursor-pointer appearance-none shadow-xs transition-colors"
                      >
                        <option value="sans">DM Sans</option>
                        <option value="inter">Inter</option>
                        <option value="roboto">Roboto</option>
                        <option value="display">Jakarta</option>
                        <option value="outfit">Outfit</option>
                        <option value="poppins">Poppins</option>
                        <option value="space">Space</option>
                        <option value="serif">Lora</option>
                        <option value="playfair">Playfair</option>
                        <option value="mono">JetBrains</option>
                        <option value="fira">Fira</option>
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-[#8D959F] flex items-center">
                        <IoChevronDown className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* 5. Backdrop Swatches Dropdown (Clean swatches only, no names as requested) */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsWorkspaceBgDropdownOpen(!isWorkspaceBgDropdownOpen)}
                        className="h-8 pl-2.5 pr-2 rounded-lg border border-[#D0D7DE] bg-white hover:bg-[#F8FAFC] flex items-center gap-1.5 shadow-xs cursor-pointer text-[#17191C] font-semibold text-xs transition-colors"
                      >
                        {/* Current swatch bubble */}
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-black/10 flex-shrink-0 flex items-center justify-center shadow-xs"
                          style={
                            BACKDROP_PRESETS.find((p) => p.id === customization.canvasBackground)?.style || {
                              backgroundColor: "#F5F7F9",
                              border: "1px solid #D0D7DE",
                            }
                          }
                        />
                        <span>Backdrop</span>
                        <IoChevronDown className="w-3.5 h-3.5 text-[#8D959F] flex-shrink-0" />
                      </button>

                      {/* Backdrop popover grid of options (Swatches only) */}
                      <AnimatePresence>
                        {isWorkspaceBgDropdownOpen && (
                          <>
                            <div 
                              className="fixed inset-0 z-40" 
                              onClick={() => setIsWorkspaceBgDropdownOpen(false)} 
                            />
                            <motion.div
                              initial={{ opacity: 0, y: 8, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 8, scale: 0.95 }}
                              transition={{ duration: 0.15 }}
                              className="absolute left-0 mt-1.5 w-60 p-2.5 bg-white border border-[#D0D7DE] rounded-xl shadow-lg z-50 grid grid-cols-4 gap-2 max-h-64 overflow-y-auto"
                            >
                              {BACKDROP_PRESETS.map((bg) => {
                                const isSelected = customization.canvasBackground === bg.id;
                                return (
                                  <button
                                    key={bg.id}
                                    type="button"
                                    onClick={() => {
                                      updateCustomization((prev) => ({
                                        ...prev,
                                        canvasBackground: bg.id,
                                        ...(bg.id !== "none" && prev.canvasPadding === "0" ? { canvasPadding: "32" } : {}),
                                      }));
                                      setIsWorkspaceBgDropdownOpen(false);
                                    }}
                                    style={bg.style}
                                    className={`w-9 h-9 rounded-full relative cursor-pointer flex items-center justify-center border border-[#D0D7DE] hover:scale-110 transition-all shadow-xs ${
                                      isSelected ? "ring-2 ring-brand-primary ring-offset-2" : "opacity-90"
                                    }`}
                                    title={bg.name}
                                  >
                                    {isSelected && <IoCheckmark className="w-4 h-4 text-brand-primary bg-white rounded-full p-0.5 shadow-sm" />}
                                  </button>
                                );
                              })}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* 6. Character Limit Counter beside the backdrop */}
                    <div
                      className="h-8 px-2.5 rounded-lg border border-[#D0D7DE] bg-white text-xs font-semibold flex items-center gap-1.5 shadow-xs select-none"
                      title={`${post.content.text?.length || 0} / 500 characters used`}
                    >
                      <span className={(post.content.text?.length || 0) > 500 ? "text-rose-600 font-bold" : (post.content.text?.length || 0) > 400 ? "text-amber-600 font-bold" : "text-[#17191C]"}>
                        {post.content.text?.length || 0}
                      </span>
                      <span className="text-[#8D959F]">/</span>
                      <span className="text-[#8D959F]">500</span>
                    </div>

                  </div>

                  {/* Primary Export Button (Fit to content) */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => setIsExportModalOpen(true)}
                    className="w-auto h-8 px-4 rounded-lg bg-brand-primary text-white font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-brand-hover active:bg-brand-pressed transition-colors cursor-pointer shadow-xs shrink-0"
                  >
                    <IoDownload className="w-4 h-4" />
                    <span>Export Card</span>
                  </motion.button>
                </div>

                {/* Live Card Render Canvas Container (Fixed sizing without layout scale jumpiness) */}
                <div className="bg-[#EDF1F5] border border-[#D0D7DE] rounded-2xl p-4 sm:p-8 flex items-center justify-center min-h-[440px] overflow-auto shadow-inner">
                  <div
                    ref={cardCanvasRef}
                    className="w-full max-w-2xl flex items-center justify-center"
                  >
                    <CanvasWrapper
                      background={customization.canvasBackground}
                      padding={customization.canvasPadding}
                      backgroundBlur={customization.backgroundBlur}
                    >
                      <div className="w-full flex items-center justify-center cursor-default">
                        <PostCard
                          post={post}
                          customization={customization}
                          onUpdatePost={(fields) => setPost((prev) => ({ ...prev, ...fields }))}
                        />
                      </div>
                    </CanvasWrapper>
                  </div>
                </div>

              </div>

            </div>
          </div>
        ) : activeTab === "shortener" ? (
          <LinkShortener />
        ) : (
          /* SAVED HISTORY TAB */
          <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
            <div className="bg-white border border-[#E1E5E9] rounded-2xl shadow-xs p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#ECEEF1]">
                <div>
                  <h2 className="font-bold text-[#17191C] text-lg tracking-tight mb-1 flex items-center gap-2">
                    <IoBookmark className="w-5 h-5 text-brand-primary" />
                    <span>Saved Layouts History</span>
                  </h2>
                  <p className="text-xs text-[#626A73]">
                    {isAuthenticated ? "Templates synced with your cloud account & browser cache." : "Templates saved locally in your browser storage."}
                  </p>
                </div>

                {history.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsBatchExportModalOpen(true)}
                      className="h-9 px-3.5 rounded-lg border border-[#D0D7DE] bg-white text-[#17191C] hover:bg-[#F8FAFC] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <IoLayers className="w-4 h-4 text-brand-primary" />
                      <span>Batch Export (ZIP)</span>
                    </button>
                  </div>
                )}
              </div>

              {history.length === 0 ? (
                <div className="mt-8 py-12 text-center border-2 border-dashed border-[#E1E5E9] rounded-2xl space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#F5F7F9] text-[#8D959F] flex items-center justify-center mx-auto text-xl">
                    <IoBookmark className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-[#17191C]">No saved layouts yet</p>
                  <p className="text-xs text-[#626A73] max-w-sm mx-auto">
                    Design a card in the Studio and click Export &gt; Save Template to store your preset here.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleTabChange("customize")}
                    className="w-auto h-10 px-6 rounded-lg bg-brand-primary text-white font-semibold text-xs inline-flex items-center justify-center gap-1.5 hover:bg-brand-hover transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Create Your First Card</span>
                  </motion.button>
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {history.map((item) => (
                    <motion.div
                      whileHover={{ y: -2 }}
                      key={item.id}
                      onClick={() => handleLoadTemplate(item)}
                      className="bg-white border border-[#E1E5E9] hover:border-brand-primary rounded-xl p-4 shadow-xs hover:shadow-sm transition-all cursor-pointer space-y-3 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#17191C] truncate">{item.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-soft text-brand-primary">
                            {item.customization.platform}
                          </span>
                          <button
                            onClick={(e) => handleDeleteTemplate(item.id, e)}
                            className="text-[#8D959F] hover:text-red-600 p-1 rounded transition-colors"
                            title="Delete template"
                          >
                            <IoTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-[#626A73] line-clamp-2 italic">
                        "{item.post.content.text}"
                      </p>

                      <div className="pt-2 border-t border-[#ECEEF1] flex items-center justify-between text-[11px] text-[#8D959F]">
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        <span className="text-brand-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                          <span>Load Layout</span>
                          <FiArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Export Modal Dialog */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onDownloadPng={handleDownloadPng}
        isDownloading={isDownloading}
        onShareUrl={handleShareUrl}
        onSaveTemplate={handleSaveTemplate}
        onResetDefault={handleResetToDefault}
        post={post}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
        shortcutsEnabled={shortcutsEnabled}
        onToggleShortcuts={handleToggleShortcuts}
      />

      {/* Avatar Library & Upload Modal */}
      <AvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        savedAvatars={savedAvatars}
        currentAvatarUrl={post.author.avatarUrl}
        onSelectAvatar={(url) => {
          handleSelectAvatar(url);
          setIsAvatarModalOpen(false);
        }}
        onUploadAvatar={(e) => {
          handleAvatarUpload(e);
          setIsAvatarModalOpen(false);
        }}
        onDropAvatar={(e) => {
          handleAvatarDrop(e);
          setIsAvatarModalOpen(false);
        }}
        onDeleteAvatar={handleDeleteAvatarFromLibrary}
        onRemovePhoto={() => {
          handleRemoveCurrentAvatar();
          setIsAvatarModalOpen(false);
        }}
      />
      {/* Batch Export Modal */}
      <BatchExportModal
        isOpen={isBatchExportModalOpen}
        onClose={() => setIsBatchExportModalOpen(false)}
        savedCards={history}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          setSuccessMsg("Welcome to Smyl!");
        }}
      />

      {/* Onboarding / Profile Setup Modal */}
      <OnboardingModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        onCompleted={() => {
          setIsOnboardingModalOpen(false);
          setSuccessMsg("Profile updated successfully!");
        }}
      />
    </div>
  );
};

export default App;

