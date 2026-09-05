import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LinkMetadata } from "../services/metadataService";
import { SocialPreviewCard } from "./SocialPreviewCard";
import {
  IoLink,
  IoAlertCircle,
  IoGlobe,
  IoCheckmarkCircle,
  IoInformationCircleOutline,
  IoPhonePortrait,
  IoDesktop,
  IoSparkles,
} from "react-icons/io5";

interface LinkPreviewGeneratorProps {
  onBackToTools?: () => void;
}

export const LinkPreviewGenerator: React.FC<LinkPreviewGeneratorProps> = ({
  onBackToTools,
}) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);

  // Preview options state
  const [activePlatformTab, setActivePlatformTab] = useState<
    "x" | "linkedin" | "facebook" | "slack" | "discord" | "whatsapp"
  >("x");
  const [previewViewportMode, setPreviewViewportMode] = useState<"desktop" | "mobile">("desktop");

  const PLATFORMS: { id: typeof activePlatformTab; label: string }[] = [
    { id: "x", label: "X / Twitter" },
    { id: "linkedin", label: "LinkedIn" },
    { id: "facebook", label: "Facebook" },
    { id: "slack", label: "Slack" },
    { id: "discord", label: "Discord" },
    { id: "whatsapp", label: "WhatsApp" },
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
    setError(null);
    setMetadata(null);

    try {
      const response = await fetch("/api/utilities/link-preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to parse link metadata.");
      }

      setMetadata(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while fetching preview.");
    } finally {
      setLoading(false);
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
          See the title, description, image, and site information Smyl can extract from a URL.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left hand: URL Input and extraction card */}
        <div className="lg:col-span-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-[#E1E5E9] shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-xl p-5 md:p-6 space-y-5"
          >
            <form onSubmit={handlePreviewSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#17191C]">
                  Paste a URL
                </label>
                <div className="relative flex items-center">
                  <IoLink className="absolute left-3 w-5 h-5 text-[#8D959F]" />
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/some-page"
                    className="w-full h-11 pl-10 pr-3 bg-white border border-[#E1E5E9] rounded-lg text-sm text-[#17191C] placeholder-[#8D959F] hover:border-[#B9C0C8] focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                  />
                </div>
              </div>

              {/* Status or error container */}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-xs text-[#D94A4A] flex items-start gap-2"
                >
                  <IoAlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              <button
                type="submit"
                id="link-preview-submit-btn"
                disabled={loading}
                className="w-full h-11 bg-brand-primary hover:bg-brand-hover text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Fetching metadata...</span>
                  </span>
                ) : (
                  <>
                    <span>Preview link</span>
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
          <AnimatePresence>
            {metadata && (
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

            {/* Platform Horizontal Tabs Selection */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1.5 scrollbar-thin">
              {PLATFORMS.map((plat) => (
                <button
                  key={plat.id}
                  type="button"
                  onClick={() => setActivePlatformTab(plat.id)}
                  className={`h-8 px-3 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    activePlatformTab === plat.id
                      ? "bg-brand-soft text-brand-primary font-bold"
                      : "text-[#626A73] hover:text-[#17191C] hover:bg-[#F5F7F9]"
                  }`}
                >
                  {plat.label}
                </button>
              ))}
            </div>

            {/* Actual dynamic simulated social cards */}
            <div className="bg-[#EDF1F5]/40 border border-[#D0D7DE]/50 rounded-xl p-5 flex flex-col justify-center min-h-[320px] relative overflow-hidden">
              <AnimatePresence mode="wait">
                {metadata ? (
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
                    <IoSparkles className="w-10 h-10 mx-auto text-[#CBD5E1] animate-bounce" />
                    <div className="space-y-1">
                      <p className="font-bold text-[#626A73]">Waiting for active URL input</p>
                      <p className="text-[11px]">Paste a valid address and hit "Preview link" to see results</p>
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
