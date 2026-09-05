import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Link,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check,
  Search,
  Globe,
  FileCode,
  ShieldCheck,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Eye,
  Settings,
  Image as ImageIcon,
} from "lucide-react";
import { SocialPreviewCard } from "./SocialPreviewCard";

export interface DiagnosticItem {
  code: string;
  severity: "Good" | "Warning" | "Missing" | "Unavailable";
  message: string;
}

export interface DebugMetadataResult {
  url: string;
  finalUrl: string;
  statusCode: number;
  contentType: string | null;
  timingMs: number;
  https: boolean;
  redirects: string[];
  openGraph: {
    title: string | null;
    description: string | null;
    image: string | null;
    siteName: string | null;
    type: string | null;
    url: string | null;
  };
  twitter: {
    card: string | null;
    title: string | null;
    description: string | null;
    image: string | null;
  };
  standard: {
    title: string | null;
    description: string | null;
    favicon: string | null;
  };
  canonical: {
    url: string | null;
    matches: boolean;
  };
  images: Array<{
    url: string;
    status: "Good" | "Missing" | "Warning" | "Unavailable";
    contentType: string | null;
    reachable: boolean;
  }>;
  diagnostics: DiagnosticItem[];
}

export const OgDebugger: React.FC = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugData, setDebugData] = useState<DebugMetadataResult | null>(null);

  // UI state
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"diagnostics" | "opengraph" | "twitter" | "standard" | "canonical" | "images" | "json" | "preview">("diagnostics");
  const [expandedDiagnostics, setExpandedDiagnostics] = useState<Record<string, boolean>>({
    "errors": true,
    "warnings": true,
    "good": false,
  });

  const triggerCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const validateUrl = (val: string): string | null => {
    if (!val.trim()) return "URL cannot be empty";
    const lower = val.toLowerCase().trim();
    if (!lower.startsWith("http://") && !lower.startsWith("https://")) {
      return "URL must start with http:// or https://";
    }
    try {
      const parsed = new URL(val);
      const host = parsed.hostname.toLowerCase();
      if (
        host === "localhost" ||
        host === "127.0.0.1" ||
        host === "0.0.0.0" ||
        host === "[::1]" ||
        host.endsWith(".local") ||
        host.endsWith(".internal")
      ) {
        return "Access forbidden: Internal addresses cannot be debugged.";
      }
    } catch {
      return "Invalid URL syntax.";
    }
    return null;
  };

  const handleInspectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const urlErr = validateUrl(url);
    if (urlErr) {
      setError(urlErr);
      setDebugData(null);
      return;
    }

    setLoading(true);
    setError(null);
    setDebugData(null);

    try {
      const res = await fetch("/api/utilities/og-debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to inspect page metadata.");
      }
      setDebugData(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during diagnostics inspection.");
    } finally {
      setLoading(false);
    }
  };

  const handleRunPreset = (presetUrl: string) => {
    setUrl(presetUrl);
    setTimeout(() => {
      const btn = document.getElementById("og-debug-submit-btn");
      if (btn) btn.click();
    }, 100);
  };

  // Compile warning / error tallies
  const warnings = debugData?.diagnostics.filter(d => d.severity === "Warning") || [];
  const missings = debugData?.diagnostics.filter(d => d.severity === "Missing") || [];
  const goods = debugData?.diagnostics.filter(d => d.severity === "Good") || [];

  const overallStatus = (warnings.length > 0 || missings.length > 0) ? "attention" : "healthy";

  // Quick preset shortcuts
  const PRESETS = [
    { name: "Google", url: "https://www.google.com" },
    { name: "NASA Space", url: "https://www.nasa.gov" },
    { name: "GitHub", url: "https://github.com" },
    { name: "Wikipedia", url: "https://www.wikipedia.org" },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 space-y-8" id="og-debugger-container">
      {/* Page Header */}
      <div className="text-center md:text-left space-y-1.5 pb-5 border-b border-[#D0D7DE]/60">
        <h1 className="text-2xl font-bold text-[#17191C] tracking-tight">
          Debug your link preview
        </h1>
        <p className="text-sm text-[#626A73]">
          Inspect Open Graph, X/Twitter metadata, canonical URLs, titles, descriptions, images, and other share data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left hand Input & Configuration Section */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-[#E1E5E9] shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-xl p-5 md:p-6 space-y-5"
          >
            <form onSubmit={handleInspectSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#17191C]">
                  Paste website URL
                </label>
                <div className="relative flex items-center">
                  <Search className="absolute left-3 w-5 h-5 text-[#8D959F]" />
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

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-xs text-[#D94A4A] flex items-start gap-2"
                >
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              <button
                type="submit"
                id="og-debug-submit-btn"
                disabled={loading}
                className="w-full h-11 bg-brand-primary hover:bg-brand-hover text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Inspecting page...</span>
                  </span>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Inspect link</span>
                  </>
                )}
              </button>
            </form>

            {/* Diagnostics presets shortcuts */}
            <div className="space-y-2 pt-3 border-t border-[#ECEEF1]">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[#8D959F]">
                Quick Diagnostic Shortcuts
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleRunPreset(p.url)}
                    className="px-2 py-1.5 text-xs text-[#626A73] hover:text-brand-primary font-medium bg-[#EDF1F5] hover:bg-brand-soft border border-[#E1E5E9]/60 rounded-lg cursor-pointer transition-colors text-left truncate"
                  >
                    🔍 {p.name}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Core Checklists (Pre-inspection helper or mini checklist summary) */}
          {debugData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white border border-[#E1E5E9] rounded-xl p-5 space-y-4"
            >
              <h4 className="text-xs font-bold text-[#17191C] uppercase tracking-wider">
                Inspection Checklists
              </h4>
              <div className="space-y-2.5 text-xs">
                {/* HTTPS */}
                <div className="flex items-center justify-between">
                  <span className="text-[#626A73]">HTTPS protocol security</span>
                  {debugData.https ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">✓ Secure</span>
                  ) : (
                    <span className="text-rose-500 font-semibold flex items-center gap-1">✗ Unsecure</span>
                  )}
                </div>

                {/* Status Code */}
                <div className="flex items-center justify-between">
                  <span className="text-[#626A73]">Page HTTP response status</span>
                  <span className={`font-semibold ${debugData.statusCode === 200 ? "text-emerald-600" : "text-amber-500"}`}>
                    {debugData.statusCode} {debugData.statusCode === 200 ? "OK" : ""}
                  </span>
                </div>

                {/* Content type */}
                <div className="flex items-center justify-between">
                  <span className="text-[#626A73]">Content type verified</span>
                  <span className="font-semibold text-[#17191C] truncate max-w-[140px]" title={debugData.contentType || ""}>
                    {debugData.contentType?.split(";")[0] || "None"}
                  </span>
                </div>

                {/* Fetch timing */}
                <div className="flex items-center justify-between">
                  <span className="text-[#626A73]">Inspection fetch duration</span>
                  <span className="font-semibold text-[#626A73]">
                    {debugData.timingMs}ms
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right hand Diagnostic Analysis & Reports */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {debugData ? (
              <motion.div
                key={debugData.url}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Health Rating Status Banner */}
                <div
                  className={`p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    overallStatus === "healthy"
                      ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                      : "bg-amber-50 border-amber-100 text-amber-800"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {overallStatus === "healthy" ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      )}
                      <h3 className="font-bold text-sm tracking-tight">
                        {overallStatus === "healthy"
                          ? "Healthy"
                          : "Needs attention"}
                      </h3>
                    </div>
                    <p className="text-xs opacity-90 leading-relaxed">
                      {overallStatus === "healthy"
                        ? "Your webpage social metadata is fully robust and ready to be shared!"
                        : `Your link can generate previews, but has ${warnings.length + missings.length} warnings/missing share fields.`}
                    </p>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => triggerCopyText(JSON.stringify(debugData, null, 2), "json-copied")}
                      className="h-8 px-3 bg-white hover:bg-opacity-80 rounded-lg text-xs font-semibold text-[#17191C] border border-[#D0D7DE]/40 shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      {copiedField === "json-copied" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === "json-copied" ? "Copied!" : "Copy diagnostic JSON"}</span>
                    </button>
                    <a
                      href={debugData.finalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 px-3 bg-brand-primary hover:bg-brand-hover rounded-lg text-xs font-semibold text-white shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <span>Visit site</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Horizontal Navigation Diagnostic Tabs */}
                <div className="flex items-center gap-1.5 border-b border-[#ECEEF1] pb-0.5 overflow-x-auto scrollbar-thin">
                  {[
                    { id: "diagnostics", label: "Diagnostic Checklists" },
                    { id: "standard", label: "Standard" },
                    { id: "opengraph", label: "Open Graph (OG)" },
                    { id: "twitter", label: "X / Twitter" },
                    { id: "canonical", label: "Canonical" },
                    { id: "images", label: "Images Check" },
                    { id: "json", label: "Raw JSON" },
                    { id: "preview", label: "Preview Frames" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveSection(tab.id as any)}
                      className={`h-9 px-3 text-xs font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                        activeSection === tab.id
                          ? "border-brand-primary text-brand-primary font-bold"
                          : "border-transparent text-[#626A73] hover:text-[#17191C] hover:border-[#E1E5E9]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Dynamic diagnostic reports based on active section selection */}
                <div className="bg-white border border-[#E1E5E9] rounded-xl p-5 md:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.02)] min-h-[350px]">
                  
                  {/* 1. Diagnostics Section with collapsible checklists */}
                  {activeSection === "diagnostics" && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-sm font-bold text-[#17191C]">Metadata Diagnostic Checks</h4>
                        <p className="text-xs text-[#626A73]">Verified validation list of common sharing standards and search setups.</p>
                      </div>

                      {/* Warnings / Errors checks */}
                      {(missings.length > 0 || warnings.length > 0) && (
                        <div className="border border-amber-200/60 rounded-xl overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setExpandedDiagnostics(prev => ({ ...prev, warnings: !prev.warnings }))}
                            className="w-full bg-amber-50/40 p-3.5 text-xs font-bold text-[#8A6D3B] flex items-center justify-between border-b border-amber-100"
                          >
                            <span className="flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                              <span>Warnings and Missing Properties ({warnings.length + missings.length})</span>
                            </span>
                            {expandedDiagnostics.warnings ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>

                          {expandedDiagnostics.warnings && (
                            <div className="divide-y divide-amber-100 bg-white">
                              {[...missings, ...warnings].map((item, idx) => (
                                <div key={idx} className="p-3.5 flex items-start gap-3 text-xs text-left">
                                  <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${item.severity === "Missing" ? "text-amber-500" : "text-[#D94A4A]"}`} />
                                  <div className="space-y-0.5">
                                    <span className="font-bold text-[#17191C] mr-2">[{item.code}]</span>
                                    <p className="text-[#626A73] leading-relaxed">{item.message}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Good checkmarks */}
                      <div className="border border-emerald-200/60 rounded-xl overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setExpandedDiagnostics(prev => ({ ...prev, good: !prev.good }))}
                          className="w-full bg-emerald-50/40 p-3.5 text-xs font-bold text-emerald-800 flex items-center justify-between border-b border-emerald-100"
                        >
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Passed Checks ({goods.length})</span>
                          </span>
                          {expandedDiagnostics.good ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>

                        {expandedDiagnostics.good && (
                          <div className="divide-y divide-emerald-100 bg-white">
                            {goods.map((item, idx) => (
                              <div key={idx} className="p-3.5 flex items-start gap-3 text-xs text-left">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                                <div className="space-y-0.5">
                                  <span className="font-bold text-[#17191C] mr-2">[{item.code}]</span>
                                  <p className="text-[#626A73] leading-relaxed">{item.message}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 2. Standard Metadata Table */}
                  {activeSection === "standard" && (
                    <div className="space-y-5">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-[#17191C]">Standard Webpage Tags</h4>
                        <p className="text-xs text-[#626A73]">Standard elements used by search engines and browsers for basic identification.</p>
                      </div>

                      <div className="border border-[#E1E5E9] rounded-lg overflow-hidden divide-y divide-[#E1E5E9]">
                        {/* Title */}
                        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-2 text-xs items-start">
                          <span className="font-bold text-[#626A73]">HTML Title</span>
                          <div className="md:col-span-2 select-all break-all text-[#17191C]">
                            {debugData.standard.title || <span className="italic text-[#8D959F]">Missing title tag</span>}
                          </div>
                          <div className="flex md:justify-end gap-1.5 items-center">
                            {debugData.standard.title && (
                              <button
                                type="button"
                                onClick={() => triggerCopyText(debugData.standard.title!, "standard-title")}
                                className="p-1 hover:bg-[#F5F7F9] rounded text-[#626A73] hover:text-[#17191C]"
                              >
                                {copiedField === "standard-title" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            )}
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${debugData.standard.title ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                              {debugData.standard.title ? "Good" : "Missing"}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-2 text-xs items-start">
                          <span className="font-bold text-[#626A73]">Meta Description</span>
                          <div className="md:col-span-2 select-all break-all text-[#17191C] leading-relaxed">
                            {debugData.standard.description || <span className="italic text-[#8D959F]">No meta description defined</span>}
                          </div>
                          <div className="flex md:justify-end gap-1.5 items-center">
                            {debugData.standard.description && (
                              <button
                                type="button"
                                onClick={() => triggerCopyText(debugData.standard.description!, "standard-desc")}
                                className="p-1 hover:bg-[#F5F7F9] rounded text-[#626A73] hover:text-[#17191C]"
                              >
                                {copiedField === "standard-desc" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            )}
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${debugData.standard.description ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                              {debugData.standard.description ? "Good" : "Missing"}
                            </span>
                          </div>
                        </div>

                        {/* Favicon */}
                        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-2 text-xs items-start">
                          <span className="font-bold text-[#626A73]">Favicon URL</span>
                          <div className="md:col-span-2 select-all break-all text-[#17191C]">
                            {debugData.standard.favicon || <span className="italic text-[#8D959F]">None resolved</span>}
                          </div>
                          <div className="flex md:justify-end gap-1.5 items-center">
                            {debugData.standard.favicon && (
                              <button
                                type="button"
                                onClick={() => triggerCopyText(debugData.standard.favicon!, "standard-favicon")}
                                className="p-1 hover:bg-[#F5F7F9] rounded text-[#626A73] hover:text-[#17191C]"
                              >
                                {copiedField === "standard-favicon" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            )}
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${debugData.standard.favicon ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                              {debugData.standard.favicon ? "Good" : "Missing"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. Open Graph Tags Display */}
                  {activeSection === "opengraph" && (
                    <div className="space-y-5">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-[#17191C]">Open Graph Share Metadata (og:*)</h4>
                        <p className="text-xs text-[#626A73]">Protocol properties originally designed by Facebook, now universally adopted.</p>
                      </div>

                      <div className="border border-[#E1E5E9] rounded-lg overflow-hidden divide-y divide-[#E1E5E9]">
                        {[
                          { key: "og:title", val: debugData.openGraph.title, req: true },
                          { key: "og:description", val: debugData.openGraph.description, req: true },
                          { key: "og:image", val: debugData.openGraph.image, req: true },
                          { key: "og:site_name", val: debugData.openGraph.siteName, req: false },
                          { key: "og:type", val: debugData.openGraph.type, req: false },
                          { key: "og:url", val: debugData.openGraph.url, req: false },
                        ].map((meta, idx) => (
                          <div key={idx} className="p-4 grid grid-cols-1 md:grid-cols-4 gap-2 text-xs items-start">
                            <div className="flex flex-col">
                              <span className="font-bold text-[#17191C]">{meta.key}</span>
                              {meta.req && <span className="text-[9px] text-[#D94A4A] font-bold tracking-wider uppercase mt-0.5">Required</span>}
                            </div>
                            <div className="md:col-span-2 select-all break-all text-[#17191C] leading-relaxed">
                              {meta.val || <span className="italic text-[#8D959F]">Not defined</span>}
                            </div>
                            <div className="flex md:justify-end gap-1.5 items-center">
                              {meta.val && (
                                <button
                                  type="button"
                                  onClick={() => triggerCopyText(meta.val!, meta.key)}
                                  className="p-1 hover:bg-[#F5F7F9] rounded text-[#626A73] hover:text-[#17191C]"
                                >
                                  {copiedField === meta.key ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              )}
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${meta.val ? "bg-emerald-100 text-emerald-800" : meta.req ? "bg-rose-100 text-rose-800" : "bg-gray-100 text-gray-800"}`}>
                                {meta.val ? "Good" : meta.req ? "Missing" : "Optional"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. X / Twitter Metadata Table */}
                  {activeSection === "twitter" && (
                    <div className="space-y-5">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-[#17191C]">X / Twitter Card Metadata (twitter:*)</h4>
                        <p className="text-xs text-[#626A73]">Custom properties used to tailor sharing formats specifically for social platform X.</p>
                      </div>

                      <div className="border border-[#E1E5E9] rounded-lg overflow-hidden divide-y divide-[#E1E5E9]">
                        {[
                          { key: "twitter:card", val: debugData.twitter.card, req: true },
                          { key: "twitter:title", val: debugData.twitter.title, req: false },
                          { key: "twitter:description", val: debugData.twitter.description, req: false },
                          { key: "twitter:image", val: debugData.twitter.image, req: false },
                        ].map((meta, idx) => (
                          <div key={idx} className="p-4 grid grid-cols-1 md:grid-cols-4 gap-2 text-xs items-start">
                            <div className="flex flex-col">
                              <span className="font-bold text-[#17191C]">{meta.key}</span>
                              {meta.req && <span className="text-[9px] text-[#0145F2] font-bold tracking-wider uppercase mt-0.5">Primary</span>}
                            </div>
                            <div className="md:col-span-2 select-all break-all text-[#17191C] leading-relaxed">
                              {meta.val || <span className="italic text-[#8D959F]">Not defined</span>}
                            </div>
                            <div className="flex md:justify-end gap-1.5 items-center">
                              {meta.val && (
                                <button
                                  type="button"
                                  onClick={() => triggerCopyText(meta.val!, meta.key)}
                                  className="p-1 hover:bg-[#F5F7F9] rounded text-[#626A73] hover:text-[#17191C]"
                                >
                                  {copiedField === meta.key ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              )}
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${meta.val ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"}`}>
                                {meta.val ? "Good" : "Missing"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 5. Canonical Diagnostics */}
                  {activeSection === "canonical" && (
                    <div className="space-y-5">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-[#17191C]">Canonical URL Tracing</h4>
                        <p className="text-xs text-[#626A73]">Prevents search indexing fragmentation and determines the single authoritative address.</p>
                      </div>

                      <div className="border border-[#E1E5E9] rounded-lg overflow-hidden divide-y divide-[#E1E5E9]">
                        {/* URL entered */}
                        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
                          <span className="font-bold text-[#626A73]">Requested URL</span>
                          <span className="md:col-span-3 break-all select-all font-mono text-[#17191C]">
                            {debugData.url}
                          </span>
                        </div>

                        {/* Redirect hops */}
                        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
                          <span className="font-bold text-[#626A73]">Redirect Hops</span>
                          <div className="md:col-span-3 space-y-1.5 text-xs text-[#626A73]">
                            {debugData.redirects.length === 0 ? (
                              <span className="text-emerald-600 font-semibold">None (Direct connection)</span>
                            ) : (
                              <div className="space-y-1">
                                <span className="font-bold text-amber-600">{debugData.redirects.length} hop(s) detected:</span>
                                <ul className="list-decimal pl-4 space-y-0.5 font-mono text-[11px] text-[#17191C]">
                                  {debugData.redirects.map((hop, hidx) => (
                                    <li key={hidx} className="break-all">{hop}</li>
                                  ))}
                                  <li className="break-all text-emerald-600 font-bold">Reached: {debugData.finalUrl}</li>
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Canonical values */}
                        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
                          <span className="font-bold text-[#626A73]">Canonical URL</span>
                          <span className="md:col-span-2 select-all break-all text-[#17191C] font-mono">
                            {debugData.canonical.url || <span className="italic text-[#8D959F]">Canonical link not declared</span>}
                          </span>
                          <div className="flex md:justify-end gap-1.5 items-center">
                            {debugData.canonical.url && (
                              <button
                                type="button"
                                onClick={() => triggerCopyText(debugData.canonical.url!, "canonical-val")}
                                className="p-1 hover:bg-[#F5F7F9] rounded text-[#626A73] hover:text-[#17191C]"
                              >
                                {copiedField === "canonical-val" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            )}
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${debugData.canonical.matches ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                              {debugData.canonical.matches ? "Matches" : "Mismatch/None"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 6. Image Diagnostic Statuses */}
                  {activeSection === "images" && (
                    <div className="space-y-5">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-[#17191C]">Image Server-Side Diagnostics</h4>
                        <p className="text-xs text-[#626A73]">Active checks verifying direct image URL syntax, protocol safety, and network reachability.</p>
                      </div>

                      {debugData.images.length === 0 ? (
                        <div className="text-center py-8 border border-dashed border-[#E1E5E9] rounded-lg text-xs text-[#8D959F] space-y-1">
                          <ImageIcon className="w-8 h-8 mx-auto text-[#CBD5E1]" />
                          <p className="font-bold">No preview images detected</p>
                          <p>Add og:image or twitter:image to generate share previews.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {debugData.images.map((img, idx) => (
                            <div key={idx} className="border border-[#E1E5E9] rounded-lg p-4 space-y-3">
                              <div className="flex items-center justify-between text-xs pb-2 border-b border-[#ECEEF1]">
                                <span className="font-bold text-[#17191C] truncate max-w-[400px]" title={img.url}>
                                  {img.url}
                                </span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => triggerCopyText(img.url, `image-copy-${idx}`)}
                                    className="p-1 hover:bg-[#F5F7F9] rounded text-[#626A73]"
                                  >
                                    {copiedField === `image-copy-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${img.status === "Good" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                                    {img.status}
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                <div>
                                  <span className="text-[#626A73] block">Reachability Status</span>
                                  <span className={`font-semibold ${img.reachable ? "text-emerald-600" : "text-rose-500"}`}>
                                    {img.reachable ? "✓ Reachable" : "✗ Blocked/Unreachable"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[#626A73] block">Returned Content-Type</span>
                                  <span className="font-semibold text-[#17191C]">
                                    {img.contentType || "Unavailable"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[#626A73] block">Dimensions status</span>
                                  <span className="font-semibold text-amber-600">
                                    Adaptive (Social Aspect-ratio 1.91:1)
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 7. JSON Raw Export */}
                  {activeSection === "json" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-[#17191C]">Raw Diagnostic Structured Data</h4>
                          <p className="text-xs text-[#626A73]">Complete diagnostic output parsed directly from variables without DOM rendering.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => triggerCopyText(JSON.stringify(debugData, null, 2), "raw-copied")}
                          className="px-3 h-8 bg-brand-soft hover:bg-opacity-80 rounded-lg text-xs font-semibold text-brand-primary flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          {copiedField === "raw-copied" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedField === "raw-copied" ? "Copied!" : "Copy JSON Schema"}</span>
                        </button>
                      </div>

                      <div className="bg-[#17191C] text-[#FAFBFD] p-4 rounded-xl text-[11px] font-mono max-h-[400px] overflow-y-auto overflow-x-auto select-all leading-relaxed whitespace-pre scrollbar-thin">
                        {JSON.stringify(debugData, null, 2)}
                      </div>
                    </div>
                  )}

                  {/* 8. Live Preview Frame Integration */}
                  {activeSection === "preview" && (
                    <div className="space-y-5">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-[#17191C]">Live Social Preview Approximation</h4>
                        <p className="text-xs text-[#626A73]">Approximated rendering simulation based on parsed page metadata variables.</p>
                      </div>

                      <div className="bg-[#EDF1F5]/40 border border-[#D0D7DE]/50 rounded-xl p-5 max-w-[500px] mx-auto">
                        {/* Map LinkMetadata output values for SocialPreviewCard */}
                        <SocialPreviewCard
                          metadata={{
                            url: debugData.url,
                            finalUrl: debugData.finalUrl,
                            title: debugData.openGraph.title || debugData.twitter.title || debugData.standard.title || "Untitled Website",
                            description: debugData.openGraph.description || debugData.twitter.description || debugData.standard.description || "No preview summary.",
                            siteName: debugData.openGraph.siteName || null,
                            canonicalUrl: debugData.canonical.url,
                            imageUrl: debugData.openGraph.image || debugData.twitter.image || null,
                            faviconUrl: debugData.standard.favicon,
                            twitter: debugData.twitter,
                            openGraph: debugData.openGraph,
                          }}
                          platform="x"
                        />
                      </div>
                    </div>
                  )}

                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white border border-[#E1E5E9] rounded-xl p-8 flex flex-col justify-center items-center min-h-[420px] text-center"
              >
                <div className="p-4 bg-brand-soft text-brand-primary rounded-full mb-4 animate-bounce">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-[#17191C]">No Active Inspection Diagnostic</h3>
                <p className="text-xs text-[#626A73] max-w-sm mt-1.5 leading-relaxed">
                  Enter a safe, public website URL on the left panel and click <strong>"Inspect link"</strong> to run metadata validations.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
