import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { 
  LuLink as Link, 
  LuDownload as Download, 
  LuCopy as Copy, 
  LuMonitor as Monitor, 
  LuSmartphone as Smartphone, 
  LuMaximize2 as Maximize2, 
  LuMinimize2 as Minimize2, 
  LuInfo as AlertCircle, 
  LuCheck as Check, 
  LuImage as Image, 
  LuArrowRight as ArrowRight,
  LuRefreshCw as RefreshCw,
  LuSettings as Sliders
} from "react-icons/lu";

interface ScreenshotResult {
  image: string;
  normalizedUrl: string;
  viewport: "desktop" | "mobile";
  fullPage: boolean;
  createdAt: string;
  metadata: {
    sizeBytes: number;
    dimensions: string;
  };
}

export const ScreenshotGenerator: React.FC<{
  onHandoffToStudio: (post: any, customization?: any) => void;
  onProcessingChange?: (processing: boolean) => void;
}> = ({ onHandoffToStudio, onProcessingChange }) => {
  const { isAuthenticated, user } = useAuth();
  const [targetUrl, setTargetUrl] = useState("");
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [fullPage, setFullPage] = useState(false);
  const [waitForTimeout, setWaitForTimeout] = useState<number>(3000); // Default to 3s wait
  const [waitUntil, setWaitUntil] = useState<string>("networkidle2"); // Default to smart network idle wait
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScreenshotResult | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    onProcessingChange?.(true);

    const trimmedUrl = targetUrl.trim();
    if (!trimmedUrl) {
      setError("Please paste a webpage URL.");
      setLoading(false);
      onProcessingChange?.(false);
      return;
    }

    try {
      // Fetch current token if user is signed in to allow storage upload
      let token: string | null = null;
      if (isAuthenticated) {
        const { data: sessionData } = await supabase.auth.getSession();
        token = sessionData?.session?.access_token || null;
      }

      const res = await fetch("/api/utilities/screenshot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          url: trimmedUrl,
          viewport,
          fullPage,
          waitForTimeout,
          waitUntil,
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      let data: any = null;
      if (contentType.includes("application/json")) {
        try {
          data = await res.json();
        } catch (_) {
          // ignore parsing error here and handle via response status
        }
      }

      if (!res.ok) {
        throw new Error(data?.error || `Failed to capture screenshot (Status: ${res.status}).`);
      }

      if (!data) {
        throw new Error("Received an empty or invalid response from the screenshot server.");
      }

      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while capturing.");
    } finally {
      setLoading(false);
      onProcessingChange?.(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement("a");
    link.href = result.image;
    
    // Create clean download filename
    let cleanDomain = "webpage";
    try {
      const u = new URL(result.normalizedUrl);
      cleanDomain = u.hostname.replace("www.", "");
    } catch (_) {}
    
    link.download = `smyl-screenshot-${cleanDomain}-${result.viewport}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyUrl = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.normalizedUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleCreateCard = () => {
    if (!result) return;

    let cleanDomain = "Webpage";
    try {
      const u = new URL(result.normalizedUrl);
      cleanDomain = u.hostname.replace("www.", "");
    } catch (_) {}

    // Populate a beautifully formatted postcard preview
    const samplePost = {
      platform: "x" as const,
      author: {
        name: cleanDomain,
        username: `@${cleanDomain.split(".")[0]}`,
        isVerified: true,
        avatarColor: "#0145F2",
        avatarText: cleanDomain.substring(0, 2).toUpperCase(),
      },
      content: {
        text: `Captured a high-DPI screenshot of this elegant page!\n\nCheck out the clean layouts and visual rhythm of ${cleanDomain}. Powered by Smyl.`,
        hashtags: ["webdesign", "inspiration", "ux"],
        mentions: [],
        links: [result.normalizedUrl],
      },
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " · " + new Date().toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }),
      engagement: {
        likes: 1204,
        comments: 48,
        reposts: 215,
        views: 45000,
      },
      imageUrl: result.image, // pass the captured base64 or storage URL
    };

    onHandoffToStudio(samplePost, {
      canvasBackground: "gradient-ocean",
      theme: "light",
      borderRadius: "lg",
      shadowSize: "md",
      canvasPadding: "32",
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 lg:p-8 space-y-8 animate-in fade-in duration-300">
      {/* Exquisite Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-soft text-brand-primary text-xs font-semibold mb-2">
          <Image className="w-3.5 h-3.5 animate-pulse" />
          <span>Website Screenshot Utility</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#17191C] tracking-tight">
          Turn any webpage into a shareable screenshot
        </h1>
        <p className="text-[#626A73] text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          Capture a clean, high-fidelity screenshot of any public webpage for social posts, presentations, portfolios, and link sharing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E1E5E9] p-5 md:p-6 shadow-sm space-y-6">
          <form onSubmit={handleCapture} className="space-y-5">
            {/* Input URL */}
            <div className="space-y-2">
              <label htmlFor="url" className="text-xs font-bold text-[#17191C] uppercase tracking-wider block">
                Paste webpage URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8D959F]">
                  <Link className="w-4.5 h-4.5" />
                </div>
                <input
                  id="url"
                  type="url"
                  required
                  placeholder="https://example.com"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-[#E1E5E9] rounded-xl text-sm font-medium text-[#17191C] placeholder-[#8D959F] focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition"
                />
              </div>
            </div>

            {/* Viewport Selectors */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#17191C] uppercase tracking-wider block">
                Viewport Mode
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setViewport("desktop")}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    viewport === "desktop"
                      ? "bg-brand-soft/60 border-brand-primary text-brand-primary shadow-xs"
                      : "bg-white border-[#E1E5E9] text-[#626A73] hover:bg-[#F8FAFC]"
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  <span>Desktop (1280px)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewport("mobile")}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    viewport === "mobile"
                      ? "bg-brand-soft/60 border-brand-primary text-brand-primary shadow-xs"
                      : "bg-white border-[#E1E5E9] text-[#626A73] hover:bg-[#F8FAFC]"
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Mobile (375px)</span>
                </button>
              </div>
            </div>

            {/* Layout Options (Full-page / Viewport) */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#17191C] uppercase tracking-wider block">
                Height Capture
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFullPage(false)}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    !fullPage
                      ? "bg-brand-soft/60 border-brand-primary text-brand-primary shadow-xs"
                      : "bg-white border-[#E1E5E9] text-[#626A73] hover:bg-[#F8FAFC]"
                  }`}
                >
                  <Minimize2 className="w-4 h-4" />
                  <span>Standard Viewport</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFullPage(true)}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    fullPage
                      ? "bg-brand-soft/60 border-brand-primary text-brand-primary shadow-xs"
                      : "bg-white border-[#E1E5E9] text-[#626A73] hover:bg-[#F8FAFC]"
                  }`}
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>Full Height Page</span>
                </button>
              </div>
            </div>

            {/* Advanced Rendering Settings Expandable block */}
            <div className="border border-[#E1E5E9] rounded-xl overflow-hidden bg-[#F8FAFC]">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between p-3.5 text-xs font-bold text-[#17191C] hover:bg-[#F1F3F6] transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-brand-primary" />
                  <span>ADVANCED RENDER SETTINGS</span>
                </div>
                <span className="text-[10px] text-[#8D959F]">
                  {showAdvanced ? "Hide" : "Show"}
                </span>
              </button>
              
              {showAdvanced && (
                <div className="p-4 border-t border-[#E1E5E9] space-y-4 bg-white animate-in fade-in duration-200">
                  {/* Explanatory text */}
                  <p className="text-[11px] text-[#626A73] leading-relaxed">
                    Dynamic single-page apps (like React/Next.js/Vercel) may render blank if captured too quickly. Use these options to guarantee hydration complete.
                  </p>

                  {/* Rendering Delay */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#17191C] uppercase tracking-wider block">
                      Rendering Delay (ms)
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[0, 1000, 3000, 5000].map((delay) => (
                        <button
                          key={delay}
                          type="button"
                          onClick={() => setWaitForTimeout(delay)}
                          className={`py-1.5 text-center text-[10px] font-bold rounded-lg border transition cursor-pointer ${
                            waitForTimeout === delay
                              ? "bg-brand-soft/60 border-brand-primary text-brand-primary shadow-2xs"
                              : "bg-white border-[#E1E5E9] text-[#626A73] hover:bg-[#F8FAFC]"
                          }`}
                        >
                          {delay === 0 ? "Instant" : `${delay / 1000}s`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Wait Until Event */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#17191C] uppercase tracking-wider block">
                      Wait Until Event
                    </label>
                    <select
                      value={waitUntil}
                      onChange={(e) => setWaitUntil(e.target.value)}
                      className="w-full px-2.5 py-2 bg-[#F8FAFC] border border-[#E1E5E9] rounded-lg text-xs font-medium text-[#17191C] focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    >
                      <option value="networkidle2">Network Idle (Smart & Dynamic)</option>
                      <option value="networkidle0">Network Idle (Wait for ALL requests)</option>
                      <option value="load">Document Loaded (Full CSS & Media)</option>
                      <option value="domcontentloaded">DOM Loaded (Instant HTML parsing)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Primary Capture CTA */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-brand-primary/95 hover:shadow-lg transition cursor-pointer active:scale-[0.98] ${
                loading ? "opacity-75 cursor-wait" : ""
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                  <span>Rendering Webpage...</span>
                </>
              ) : (
                <>
                  <Image className="w-4.5 h-4.5" />
                  <span>Capture Screenshot</span>
                </>
              )}
            </button>
          </form>

          {/* Meaningful user-facing errors */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-start gap-2.5 p-3.5 bg-red-50 rounded-xl border border-red-100 text-red-600"
              >
                <AlertCircle className="w-4.5 h-4.5 mt-0.5 flex-shrink-0" />
                <div className="text-xs leading-relaxed font-medium">
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results/Preview Column */}
        <div className="lg:col-span-7 bg-[#F8FAFC] rounded-2xl border border-[#E1E5E9] p-4 md:p-6 min-h-[400px] flex flex-col justify-between shadow-xs">
          <div className="w-full flex-1 flex flex-col justify-center items-center">
            {loading ? (
              <div className="w-full space-y-6">
                <div className="flex items-center justify-between text-xs font-bold text-brand-primary uppercase tracking-wider">
                  <span>Processing Screenshot...</span>
                  <span className="flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Rendering</span>
                  </span>
                </div>

                {/* Animated Browser Viewport Skeleton with Glass Spinner Overlay */}
                <div className="relative w-full rounded-xl border border-[#E1E5E9] bg-white overflow-hidden shadow-xs">
                  {/* Background Skeleton Content (dimmed) */}
                  <div className="opacity-60 select-none pointer-events-none animate-pulse">
                    {/* Browser Top Bar Mockup */}
                    <div className="bg-[#EDF1F5] px-4 py-2 border-b border-[#E1E5E9] flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                      <div className="bg-white px-3 py-0.5 rounded-md text-[10px] text-[#8D959F] font-mono ml-4 w-48 truncate">
                        {targetUrl || "https://example.com"}
                      </div>
                    </div>

                    {/* Browser Content Skeleton Canvas */}
                    <div className="p-5 space-y-4">
                      {/* Pulsing Website Header */}
                      <div className="flex items-center justify-between">
                        <div className="h-5 bg-[#EDF1F5] rounded-md w-24" />
                        <div className="flex gap-2">
                          <div className="h-3 bg-[#EDF1F5] rounded-md w-12" />
                          <div className="h-3 bg-[#EDF1F5] rounded-md w-12" />
                        </div>
                      </div>

                      {/* Pulsing Content Blocks */}
                      <div className="space-y-2 pt-2">
                        <div className="h-4 bg-[#EDF1F5] rounded-md w-3/4" />
                        <div className="h-3 bg-[#EDF1F5] rounded-md w-full" />
                        <div className="h-3 bg-[#EDF1F5] rounded-md w-5/6" />
                      </div>

                      {/* Mock Hero Image Frame */}
                      <div className="h-32 bg-[#EDF1F5] rounded-lg w-full flex items-center justify-center text-[#8D959F]">
                        <Image className="w-8 h-8 opacity-40 animate-bounce" />
                      </div>
                    </div>
                  </div>

                  {/* Absolute Centered Premium Spinner Overlay */}
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-2xs flex flex-col items-center justify-center space-y-3 z-10">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full border-4 border-brand-primary/10 border-t-brand-primary animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <RefreshCw className="w-4 h-4 text-brand-primary animate-spin" style={{ animationDuration: '3s' }} />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#17191C] bg-white/90 px-3 py-1.5 rounded-full border border-[#D0D7DE]/50 shadow-sm animate-pulse">
                      Active Background Sandbox Render
                    </span>
                  </div>
                </div>

                {/* Processing Indicators / Helper texts */}
                <div className="text-center space-y-1.5">
                  <p className="text-xs font-semibold text-[#17191C]">Analyzing elements and viewport bounds</p>
                  <p className="text-[11px] text-[#626A73] max-w-xs mx-auto">
                    This can take up to 10 seconds depending on site script weight and load latency.
                  </p>
                </div>
              </div>
            ) : result ? (
              <div className="w-full space-y-4 animate-in fade-in duration-300">
                <div className="text-xs font-bold text-[#17191C] uppercase tracking-wider">
                  Screenshot Preview ({result.metadata.dimensions})
                </div>

                {/* Screenshot Container Frame */}
                <div className="relative rounded-xl border border-[#E1E5E9] bg-white overflow-hidden shadow-xs group max-w-full flex justify-center items-start">
                  <img
                    src={result.image}
                    alt="Captured Webpage"
                    className="w-full h-auto object-contain max-h-[360px]"
                    referrerPolicy="no-referrer"
                  />
                  {/* Hover stats overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 justify-between text-white text-[11px] font-medium backdrop-blur-3xs">
                    <span>Size: {(result.metadata.sizeBytes / 1024).toFixed(1)} KB</span>
                    <span>Captured in 15s max sandbox</span>
                  </div>
                </div>

                {/* Toolbar actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                  <button
                    onClick={handleDownload}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white border border-[#E1E5E9] text-[#17191C] hover:bg-[#F8FAFC] text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PNG</span>
                  </button>
                  <button
                    onClick={handleCopyUrl}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white border border-[#E1E5E9] text-[#17191C] hover:bg-[#F8FAFC] text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    {copySuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600">Copied URL!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy page URL</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCreateCard}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-brand-primary text-white hover:bg-brand-primary/90 text-xs font-bold rounded-xl transition cursor-pointer shadow-xs active:scale-98"
                  >
                    <span>Create Card</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-full bg-white border border-[#E1E5E9] flex items-center justify-center mx-auto shadow-2xs text-[#8D959F]">
                  <Image className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#17191C]">No screenshot captured yet</p>
                  <p className="text-xs text-[#626A73] max-w-xs mx-auto leading-relaxed">
                    Enter a public URL on the left and click &quot;Capture Screenshot&quot; to render a preview here.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
