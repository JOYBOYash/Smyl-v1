import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LinkMetadata } from "../services/metadataService";
import { SocialPreviewCard, PreviewPlatform } from "./SocialPreviewCard";
import { apiClient } from "../services/apiClient";
import {
  IoLink,
  IoAlertCircle,
  IoGlobe,
  IoCheckmarkCircle,
  IoInformationCircleOutline,
  IoPhonePortrait,
  IoDesktop,
} from "react-icons/io5";
import {
  FaThreads,
  FaFacebook,
  FaTiktok,
  FaYoutube,
  FaMedium,
  FaInstagram,
  FaLinkedin,
  FaWhatsapp,
  FaXTwitter,
  FaSlack,
  FaDiscord,
} from "react-icons/fa6";
import { SiSubstack } from "react-icons/si";

interface LinkPreviewGeneratorProps {
  onBackToTools?: () => void;
  onProcessingChange?: (processing: boolean) => void;
}

export const LinkPreviewGenerator: React.FC<LinkPreviewGeneratorProps> = ({
  onBackToTools,
  onProcessingChange,
}) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);

  // Preview options state
  const [activePlatformTab, setActivePlatformTab] = useState<PreviewPlatform>("x");
  const [previewViewportMode, setPreviewViewportMode] = useState<"desktop" | "mobile">("desktop");

  const PLATFORMS = [
    { id: "x" as const, label: "X / Twitter", icon: FaXTwitter, color: "#000000" },
    { id: "linkedin" as const, label: "LinkedIn", icon: FaLinkedin, color: "#0A66C2" },
    { id: "facebook" as const, label: "Facebook", icon: FaFacebook, color: "#1877F2" },
    { id: "whatsapp" as const, label: "WhatsApp", icon: FaWhatsapp, color: "#25D366" },
    { id: "yt" as const, label: "YouTube", icon: FaYoutube, color: "#FF0000" },
    { id: "instagram" as const, label: "Instagram", icon: FaInstagram, color: "#E1306C" },
    { id: "tiktok" as const, label: "TikTok", icon: FaTiktok, color: "#000000" },
    { id: "threads" as const, label: "Threads", icon: FaThreads, color: "#000000" },
    { id: "substack" as const, label: "Substack", icon: SiSubstack, color: "#FF6719" },
    { id: "medium" as const, label: "Medium", icon: FaMedium, color: "#000000" },
    { id: "slack" as const, label: "Slack", icon: FaSlack, color: "#4A154B" },
    { id: "discord" as const, label: "Discord", icon: FaDiscord, color: "#5865F2" },
  ];

  // Client-side quick validation matching the backend boundaries
  const validateUrlClient = (val: string): string | null => {
    if (!val.trim()) {
      return "URL cannot be empty";
    }

    const lower = val.toLowerCase().trim();

    if (!lower.startsWith("http://") && !lower.startsWith("https://")) {
      return "URL must start with http:// or https://";
    }

    try {
      const parsed = new URL(val);
      const host = parsed.hostname.toLowerCase();

      // Basic SSRF target blocks
      if (
        host === "localhost" ||
        host === "127.0.0.1" ||
        host === "0.0.0.0" ||
        host === "[::1]" ||
        host.endsWith(".local") ||
        host.endsWith(".internal")
      ) {
        return "SSRF Protection: Access to local or internal network hostnames is forbidden.";
      }
    } catch {
      return "Invalid URL format.";
    }

    return null;
  };

  // Main Submit handler to fetch metadata
  const handlePreviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clientErr = validateUrlClient(url);
    if (clientErr) {
      setError(clientErr);
      setMetadata(null);
      return;
    }

    setLoading(true);
    onProcessingChange?.(true);
    setError(null);
    setMetadata(null);

    try {
      // Use centralized API client with automatic token handling and detailed error mappings
      const data = await apiClient.post<LinkMetadata>("/api/utilities/link-preview", {
        url: url.trim(),
      });
      setMetadata(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while fetching preview.");
    } finally {
      setLoading(false);
      onProcessingChange?.(false);
    }
  };

  // Loader presets for testing and quick audit convenience
  const handleRunTestPreset = (testUrl: string) => {
    setUrl(testUrl);
    setTimeout(() => {
      const fakeBtn = document.getElementById("link-preview-submit-btn");
      if (fakeBtn) fakeBtn.click();
    }, 100);
  };

  const TEST_PRESETS = [
    { name: "Google", url: "https://www.google.com" },
    { name: "Wikipedia", url: "https://www.wikipedia.org" },
    { name: "GitHub", url: "https://github.com" },
    { name: "NASA Space", url: "https://www.nasa.gov" },
  ];

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-8" id="link-preview-generator-container">
      {/* Header Description Title */}
      <div className="text-center md:text-left space-y-1.5 pb-5 border-b border-[#D0D7DE]/60">
        <h1 className="text-2xl font-bold text-[#17191C] tracking-tight">
          Preview your link before you share it
        </h1>
        <p className="text-sm text-[#626A73]">
          Generate visual previews and debug the exact metadata card that will render across popular platforms.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left hand side: Inputs & Extract results */}
        <div className="lg:col-span-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-[#E1E5E9] shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-xl p-5 md:p-6 space-y-4"
          >
            <div className="space-y-1">
              <label htmlFor="preview-target-url" className="block text-xs font-bold text-[#626A73] uppercase tracking-wider">
                Destination URL Address
              </label>
              <p className="text-[11px] text-[#8D959F]">Input the web URL to fetch and decode rich graph tags.</p>
            </div>

            <form onSubmit={handlePreviewSubmit} className="space-y-3.5">
              <div className="relative">
                <input
                  id="preview-target-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  disabled={loading}
                  className="w-full h-11 pl-4 pr-10 text-xs text-[#17191C] bg-white border border-[#D0D7DE] rounded-lg shadow-2xs focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/25 focus:outline-hidden disabled:bg-slate-50 transition-colors"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <IoLink className="w-4 h-4 text-[#8D959F]" />
                </div>
              </div>

              {/* Error messages reporting section */}
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                  <IoAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                id="link-preview-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-lg bg-brand-primary hover:bg-brand-dark text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    <span>Extracting...</span>
                  </>
                ) : (
                  <>
                    <IoGlobe className="w-4 h-4" />
                    <span>Generate live preview</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Presets Audit shortcuts */}
            <div className="space-y-2 pt-3 border-t border-[#ECEEF1]">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[#8D959F]">
                Quick test targets
              </span>
              <div className="flex flex-wrap gap-2">
                {TEST_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleRunTestPreset(p.url)}
                    className="px-2.5 py-1 text-xs font-semibold bg-[#EDF1F5] hover:bg-brand-soft text-[#626A73] hover:text-brand-primary rounded-md border border-[#E1E5E9]/50 cursor-pointer transition-colors"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Detailed extracted fields metadata display */}
          <AnimatePresence mode="wait">
            {loading ? (
              <div className="bg-white border border-[#E1E5E9] shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-xl p-5 md:p-6 space-y-4 animate-pulse">
                <div className="flex items-center gap-2 pb-2.5 border-b border-[#ECEEF1]">
                  <div className="w-8 h-8 rounded bg-[#EDF1F5]" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 bg-[#EDF1F5] rounded w-32" />
                    <div className="h-2.5 bg-[#EDF1F5] rounded w-20" />
                  </div>
                </div>
                <div className="space-y-4 pt-2">
                  {[1, 2, 3].map((idx) => (
                    <div key={idx} className="grid grid-cols-4 gap-2">
                      <div className="h-3.5 bg-[#EDF1F5] rounded col-span-1" />
                      <div className="h-8 bg-[#EDF1F5]/60 rounded col-span-3" />
                    </div>
                  ))}
                </div>
              </div>
            ) : metadata && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white border border-[#E1E5E9] shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-xl p-5 md:p-6 space-y-4"
              >
                <div className="flex items-center gap-2 pb-2.5 border-b border-[#ECEEF1]">
                  <div className="p-1.5 bg-brand-soft text-brand-primary rounded-lg">
                    <IoCheckmarkCircle className="w-4 h-4 text-[#2E9B62]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#17191C]">Extracted Webpage Metadata</h3>
                    <p className="text-[10px] text-[#8D959F]">Decoded and normalized server-side</p>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs text-[#17191C]">
                  {/* Title */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5">
                    <span className="font-bold text-[#626A73]">Page Title</span>
                    <span className="md:col-span-3 bg-[#FAFBFD] p-2 rounded border border-[#E1E5E9]/60 font-medium">
                      {metadata.title || "None extracted"}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5">
                    <span className="font-bold text-[#626A73]">Description</span>
                    <span className="md:col-span-3 bg-[#FAFBFD] p-2 rounded border border-[#E1E5E9]/60 text-[#626A73] leading-relaxed">
                      {metadata.description || "None extracted"}
                    </span>
                  </div>

                  {/* Site Name & Canonical */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5">
                    <span className="font-bold text-[#626A73]">Site & Canonical</span>
                    <div className="md:col-span-3 space-y-1">
                      {metadata.siteName && (
                        <div className="bg-[#FAFBFD] p-2 rounded border border-[#E1E5E9]/60">
                          <span className="font-bold text-[#626A73] mr-1">Name:</span>
                          <span>{metadata.siteName}</span>
                        </div>
                      )}
                      <div className="bg-[#FAFBFD] p-2 rounded border border-[#E1E5E9]/60 overflow-x-auto truncate">
                        <span className="font-bold text-[#626A73] mr-1">Final:</span>
                        <span className="text-[#0145F2]">{metadata.finalUrl}</span>
                      </div>
                    </div>
                  </div>

                  {/* Preview Image URL */}
                  {metadata.imageUrl && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5">
                      <span className="font-bold text-[#626A73]">Preview Image</span>
                      <div className="md:col-span-3 space-y-1.5">
                        <div className="bg-[#FAFBFD] p-2 rounded border border-[#E1E5E9]/60 break-all select-all font-mono text-[10px] text-[#626A73]">
                          {metadata.imageUrl}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* OpenGraph & Twitter detected metadata platforms stats */}
                  <div className="flex items-center gap-1.5 pt-2 text-[11px] text-[#626A73] bg-[#F5F7F9] p-2.5 rounded-lg border border-[#E1E5E9]/40">
                    <IoInformationCircleOutline className="w-4 h-4 text-brand-primary shrink-0" />
                    <span>
                      Detected: <strong>OpenGraph</strong> {metadata.openGraph.title ? "✓" : "✗"} /{" "}
                      <strong>Twitter Metadata</strong> {metadata.twitter.title ? "✓" : "✗"}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right hand: Dynamic Platform Previews Tabs */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-[#E1E5E9] shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-xl p-5 md:p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#ECEEF1]">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#626A73]">
                Social Media Previews
              </h3>

              {/* Viewport toggle for desktop/mobile simulation styles */}
              <div className="flex items-center bg-[#EDF1F5] rounded-lg p-0.5 self-start">
                <button
                  type="button"
                  onClick={() => setPreviewViewportMode("desktop")}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md flex items-center gap-1 cursor-pointer ${
                    previewViewportMode === "desktop"
                      ? "bg-white text-brand-primary shadow-xs font-bold"
                      : "text-[#626A73] hover:text-[#17191C]"
                  }`}
                >
                  <IoDesktop className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewportMode("mobile")}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md flex items-center gap-1 cursor-pointer ${
                    previewViewportMode === "mobile"
                      ? "bg-white text-brand-primary shadow-xs font-bold"
                      : "text-[#626A73] hover:text-[#17191C]"
                  }`}
                >
                  <IoPhonePortrait className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
              </div>
            </div>

            {/* Platform Horizontal Tabs Selection with brand icons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin border-b border-[#ECEEF1]">
              {PLATFORMS.map((plat) => {
                const IconComponent = plat.icon;
                const isActive = activePlatformTab === plat.id;
                return (
                  <button
                    key={plat.id}
                    type="button"
                    onClick={() => setActivePlatformTab(plat.id)}
                    title={plat.label}
                    className={`h-10 px-3 md:px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-2 transition-all cursor-pointer border ${
                      isActive
                        ? "bg-brand-soft text-brand-primary border-brand-primary/20 shadow-xs scale-102"
                        : "text-[#626A73] hover:text-[#17191C] hover:bg-[#F5F7F9] border-transparent"
                    }`}
                  >
                    <IconComponent
                      className="w-4 h-4 shrink-0 transition-transform"
                      style={{ color: isActive ? plat.color : undefined }}
                    />
                    <span className="hidden md:inline font-medium text-[11px]">{plat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Actual dynamic simulated social cards */}
            <div className="bg-[#EDF1F5]/40 border border-[#D0D7DE]/50 rounded-xl p-5 flex flex-col justify-center min-h-[320px] relative overflow-hidden">
              <AnimatePresence mode="wait">
                {loading ? (
                  <div className="relative w-full">
                    {/* Dimmed background pulsing mockup */}
                    <div className="w-full space-y-4 opacity-40 select-none pointer-events-none animate-pulse">
                      {/* Simulated Social Header */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#EDF1F5]" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-3 bg-[#EDF1F5] rounded w-1/4" />
                          <div className="h-2.5 bg-[#EDF1F5]/70 rounded w-1/6" />
                        </div>
                      </div>
                      {/* Simulated Text Lines */}
                      <div className="space-y-2 pt-1">
                        <div className="h-3 bg-[#EDF1F5] rounded w-5/6" />
                        <div className="h-3 bg-[#EDF1F5] rounded w-2/3" />
                      </div>
                      {/* Simulated Card Image */}
                      <div className="h-36 bg-[#EDF1F5] rounded-xl w-full" />
                    </div>

                    {/* Absolute glass spinner overlay */}
                    <div className="absolute inset-0 bg-white/30 backdrop-blur-3xs flex flex-col items-center justify-center space-y-3 z-10">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full border-4 border-brand-primary/10 border-t-brand-primary animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <IoLink className="w-4 h-4 text-brand-primary animate-pulse" />
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-[#17191C] bg-white/95 px-3 py-1.5 rounded-full border border-[#D0D7DE]/50 shadow-sm animate-pulse">
                        Extracting rich social metadata...
                      </span>
                    </div>
                  </div>
                ) : metadata ? (
                  <motion.div
                    key={`${activePlatformTab}-${previewViewportMode}`}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      maxWidth: previewViewportMode === "mobile" ? "375px" : "100%",
                      margin: "0 auto",
                      width: "100%",
                    }}
                    className="transition-all duration-300"
                  >
                    <SocialPreviewCard metadata={metadata} platform={activePlatformTab} />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 text-xs text-[#8D959F] space-y-2.5"
                  >
                    <IoGlobe className="w-10 h-10 mx-auto text-[#CBD5E1] animate-bounce" />
                    <div className="space-y-1">
                      <p className="font-bold text-[#626A73]">Waiting for active URL input</p>
                      <p className="text-[11px]">Paste a valid address and hit "Generate live preview" to see results</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
