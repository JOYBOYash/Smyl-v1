import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { QrRepository, SavedQrCode } from "../services/qrService";
import {
  IoQrCode,
  IoCopy,
  IoDownload,
  IoTrash,
  IoAlertCircle,
  IoCheckmarkCircle,
  IoTime,
  IoSave,
  IoColorPalette,
  IoRefresh,
} from "react-icons/io5";

interface QrGeneratorProps {
  initialUrl?: string;
  onClearInitialUrl?: () => void;
}

export const QrGenerator: React.FC<QrGeneratorProps> = ({
  initialUrl,
  onClearInitialUrl,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [url, setUrl] = useState("");
  const [qrName, setQrName] = useState("");
  const [size, setSize] = useState(256);
  const [margin, setMargin] = useState(2);
  const [foreground, setForeground] = useState("#17191C");
  const [background, setBackground] = useState("#FFFFFF");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  // Live QR representation state
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);

  // Saved QR presets list
  const [savedQrs, setSavedQrs] = useState<SavedQrCode[]>([]);

  // Clipboard feedbacks
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedSavedId, setCopiedSavedId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Preset Colors
  const FOREGROUND_PRESETS = [
    { value: "#17191C", name: "Ink Black" },
    { value: "#0045F2", name: "Smyl Blue" },
    { value: "#2E9B62", name: "Emerald" },
    { value: "#4F46E5", name: "Royal Purple" },
    { value: "#D94A4A", name: "Crimson" },
  ];

  const BACKGROUND_PRESETS = [
    { value: "#FFFFFF", name: "Pure White" },
    { value: "#FAF9F6", name: "Alabaster" },
    { value: "#EDF1F5", name: "Cool Grey" },
    { value: "#F0F4FF", name: "Ice Blue" },
  ];

  // Pre-fill initial URL if provided
  useEffect(() => {
    if (initialUrl) {
      setUrl(initialUrl);
      setQrName("Shortened Link QR");
      if (onClearInitialUrl) {
        onClearInitialUrl();
      }
    }
  }, [initialUrl, onClearInitialUrl]);

  // Load saved QR codes from Supabase
  const fetchSavedQrs = async () => {
    if (isAuthenticated && user) {
      const qrs = await QrRepository.getQrCodes(user.id);
      setSavedQrs(qrs);
    }
  };

  useEffect(() => {
    fetchSavedQrs();
  }, [user, isAuthenticated]);

  // Validate URL scheme and parameters
  const validateUrl = (val: string): string | null => {
    if (!val.trim()) {
      return "URL cannot be empty";
    }

    const lower = val.toLowerCase().trim();

    if (!lower.startsWith("http://") && !lower.startsWith("https://")) {
      return "URL must start with http:// or https://";
    }

    if (
      lower.startsWith("javascript:") ||
      lower.startsWith("data:") ||
      lower.startsWith("vbscript:") ||
      lower.startsWith("file:")
    ) {
      return "Invalid or unsafe URL scheme";
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
        host.endsWith(".internal") ||
        host.startsWith("10.") ||
        host.startsWith("192.168.") ||
        host.startsWith("172.16.") ||
        host.startsWith("169.254.")
      ) {
        return "Localhost and internal private targets are not allowed";
      }

      if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)) {
        return "Internal private IP ranges are not allowed";
      }
    } catch (err) {
      return "Invalid URL format";
    }

    if (val.length > 2048) {
      return "URL exceeds maximum length of 2048 characters";
    }

    return null;
  };

  // Generate QR Code Reactively on canvas & state data URL
  const generateQrCode = async () => {
    setError(null);
    const validationErr = validateUrl(url);
    if (validationErr) {
      setQrCodeDataUrl(null);
      return;
    }

    try {
      setLoading(true);

      // 1. Render to DataURL for image previews
      const dataUrl = await QRCode.toDataURL(url.trim(), {
        width: size,
        margin: margin,
        color: {
          dark: foreground,
          light: background,
        },
      });
      setQrCodeDataUrl(dataUrl);

      // 2. Also draw to offline canvas for precise high-quality clipboard manipulation
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, url.trim(), {
          width: size,
          margin: margin,
          color: {
            dark: foreground,
            light: background,
          },
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate QR code.");
      setQrCodeDataUrl(null);
    } finally {
      setLoading(false);
    }
  };

  // Trigger regeneration on parameter change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (url.trim()) {
        generateQrCode();
      } else {
        setQrCodeDataUrl(null);
      }
    }, 200); // Small debounce

    return () => clearTimeout(timer);
  }, [url, size, margin, foreground, background]);

  // Handle Download PNG
  const handleDownloadPng = () => {
    if (!qrCodeDataUrl) return;
    const a = document.createElement("a");
    a.href = qrCodeDataUrl;
    a.download = `${qrName.trim().replace(/\s+/g, "-").toLowerCase() || "smyl-qr-code"}.png`;
    a.click();
    setSuccess("QR Code downloaded as PNG!");
  };

  // Handle Download SVG
  const handleDownloadSvg = async () => {
    if (!url.trim()) return;
    try {
      const svgString = await QRCode.toString(url.trim(), {
        type: "svg",
        width: size,
        margin: margin,
        color: {
          dark: foreground,
          light: background,
        },
      });

      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${qrName.trim().replace(/\s+/g, "-").toLowerCase() || "smyl-qr-code"}.svg`;
      a.click();
      URL.revokeObjectURL(downloadUrl);
      setSuccess("QR Code downloaded as SVG!");
    } catch (err: any) {
      setError("Failed to export SVG: " + err.message);
    }
  };

  // Handle Clipboard Copy of Image
  const handleCopyImage = async () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ "image/png": blob }),
            ]);
            setCopiedImage(true);
            setTimeout(() => setCopiedImage(false), 2000);
          } catch (clipErr) {
            setError("Direct copying is not supported on this browser.");
          }
        }
      }, "image/png");
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  // Handle Copy Raw Destination Link
  const handleCopyLink = (textToCopy: string, isFromHistory = false, itemId?: string) => {
    navigator.clipboard.writeText(textToCopy);
    if (isFromHistory && itemId) {
      setCopiedSavedId(itemId);
      setTimeout(() => setCopiedSavedId(null), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Save QR Code Preset to Supabase Account
  const handleSavePreset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      setError("Please sign in to save QR presets to your account.");
      return;
    }

    const validationErr = validateUrl(url);
    if (validationErr) {
      setError(validationErr);
      return;
    }

    setSaveLoading(true);
    setError(null);
    setSuccess(null);

    const nameToSave = qrName.trim() || `QR - ${new URL(url).hostname}`;

    try {
      const saved = await QrRepository.saveQrCode(
        {
          userId: user.id,
          name: nameToSave,
          url: url.trim(),
          configuration: {
            size,
            margin,
            foreground,
            background,
          },
        },
        user.id
      );

      if (saved) {
        setSuccess(`Saved preset: "${nameToSave}"`);
        fetchSavedQrs();
      } else {
        setError("Failed to save QR code preset.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while saving.");
    } finally {
      setSaveLoading(false);
    }
  };

  // Delete QR Code Preset
  const handleDeletePreset = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    try {
      const successDel = await QrRepository.deleteQrCode(id, user.id);
      if (successDel) {
        setSavedQrs((prev) => prev.filter((item) => item.id !== id));
        setSuccess("QR preset deleted successfully.");
      }
    } catch (err) {
      console.error("Failed to delete QR:", err);
    }
  };

  // Load Saved QR Preset
  const handleLoadPreset = (item: SavedQrCode) => {
    setUrl(item.url);
    setQrName(item.name);
    if (item.configuration) {
      setSize(item.configuration.size || 256);
      setMargin(item.configuration.margin !== undefined ? item.configuration.margin : 2);
      setForeground(item.configuration.foreground || "#17191C");
      setBackground(item.configuration.background || "#FFFFFF");
    }
    setSuccess(`Loaded QR configuration: "${item.name}"`);
  };

  const handleReset = () => {
    setUrl("");
    setQrName("");
    setSize(256);
    setMargin(2);
    setForeground("#17191C");
    setBackground("#FFFFFF");
    setQrCodeDataUrl(null);
    setError(null);
    setSuccess(null);
  };

  const isUrlInvalid = url.trim() !== "" && validateUrl(url) !== null;
  const currentValidationMessage = validateUrl(url);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-8" id="qr-generator-container">
      {/* Title Block */}
      <div className="text-center md:text-left space-y-1 pb-4 border-b border-[#D0D7DE]/60">
        <h1 className="text-2xl font-bold text-[#17191C] tracking-tight">Turn a link into a QR code</h1>
        <p className="text-sm text-[#626A73]">Create a QR code for any shareable link.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Hand: Controls & Creation */}
        <div className="lg:col-span-7 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 450, damping: 35 }}
            className="bg-white border border-[#E1E5E9] shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-xl p-5 md:p-6 space-y-6"
          >
            {/* Form Section */}
            <div className="space-y-5">
              {/* Target URL Input */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#17191C]">
                  Paste a URL
                </label>
                <div className="relative flex items-center">
                  <IoQrCode className="absolute left-3 w-5 h-5 text-[#8D959F]" />
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/your-destination"
                    className={`w-full h-10 pl-10 pr-3 bg-white border rounded-lg text-sm text-[#17191C] placeholder-[#8D959F] hover:border-[#B9C0C8] outline-none transition-all ${
                      isUrlInvalid
                        ? "border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                        : "border-E1E5E9 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                    }`}
                  />
                </div>
                {isUrlInvalid && currentValidationMessage && (
                  <p className="text-rose-600 text-[11px] font-medium flex items-center gap-1">
                    <IoAlertCircle className="w-3.5 h-3.5" />
                    <span>{currentValidationMessage}</span>
                  </p>
                )}
              </div>

              {/* Optional Name (Preset Label) */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#17191C]">
                  QR Code Name <span className="text-[#8D959F] font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={qrName}
                  onChange={(e) => setQrName(e.target.value)}
                  placeholder="e.g. Portfolio Website, Promo Link"
                  className="w-full h-10 px-3 bg-white border border-[#E1E5E9] rounded-lg text-sm text-[#17191C] placeholder-[#8D959F] hover:border-[#B9C0C8] focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                />
              </div>

              {/* Collapsible Design Controls Accordion-like block */}
              <div className="pt-4 border-t border-[#ECEEF1] space-y-5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#17191C]">
                  <IoColorPalette className="w-4 h-4 text-brand-primary" />
                  <span>Customize Settings</span>
                </div>

                {/* Grid for parameters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Size Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[#626A73]">Resolution / Size</span>
                      <span className="font-bold text-brand-primary">{size} × {size} px</span>
                    </div>
                    <input
                      type="range"
                      min="128"
                      max="1024"
                      step="64"
                      value={size}
                      onChange={(e) => setSize(Number(e.target.value))}
                      className="w-full h-1.5 bg-[#EDF1F5] rounded-lg appearance-none cursor-pointer accent-brand-primary"
                    />
                  </div>

                  {/* Quiet Zone Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[#626A73]">Quiet Zone (Margin)</span>
                      <span className="font-bold text-brand-primary">{margin} modules</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="8"
                      step="1"
                      value={margin}
                      onChange={(e) => setMargin(Number(e.target.value))}
                      className="w-full h-1.5 bg-[#EDF1F5] rounded-lg appearance-none cursor-pointer accent-brand-primary"
                    />
                  </div>
                </div>

                {/* Colors customizers */}
                <div className="space-y-4 pt-2">
                  {/* Foreground */}
                  <div className="space-y-2">
                    <span className="block text-xs font-semibold text-[#626A73]">Foreground Color (Blocks)</span>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={foreground}
                        onChange={(e) => setForeground(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-[#D0D7DE] shrink-0 overflow-hidden"
                      />
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {FOREGROUND_PRESETS.map((p) => (
                          <button
                            key={p.value}
                            type="button"
                            onClick={() => setForeground(p.value)}
                            style={{ backgroundColor: p.value }}
                            title={p.name}
                            className={`w-6 h-6 rounded-md border transition-all ${
                              foreground.toLowerCase() === p.value.toLowerCase()
                                ? "ring-2 ring-brand-primary ring-offset-1 border-white"
                                : "border-transparent opacity-90 hover:opacity-100"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Background */}
                  <div className="space-y-2">
                    <span className="block text-xs font-semibold text-[#626A73]">Background Color</span>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={background}
                        onChange={(e) => setBackground(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-[#D0D7DE] shrink-0 overflow-hidden"
                      />
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {BACKGROUND_PRESETS.map((p) => (
                          <button
                            key={p.value}
                            type="button"
                            onClick={() => setBackground(p.value)}
                            style={{ backgroundColor: p.value }}
                            title={p.name}
                            className={`w-6 h-6 rounded-md border transition-all ${
                              background.toLowerCase() === p.value.toLowerCase()
                                ? "ring-2 ring-brand-primary ring-offset-1 border-[#17191C]/20"
                                : "border-[#E1E5E9] hover:border-[#B9C0C8]"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Feedbacks */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-xs text-[#D94A4A] flex items-start gap-2.5"
                >
                  <IoAlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-xs text-emerald-800 flex items-start gap-2.5"
                >
                  <IoCheckmarkCircle className="w-4 h-4 mt-0.5 shrink-0 text-[#2E9B62]" />
                  <span>{success}</span>
                </motion.div>
              )}

              {/* Action Save CTA */}
              {isAuthenticated && url.trim() && !isUrlInvalid && (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={saveLoading}
                  onClick={handleSavePreset}
                  type="button"
                  className="w-full h-10 border border-[#D0D7DE] bg-white hover:bg-[#F8FAFC] text-[#17191C] text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {saveLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-brand-primary" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Saving to account...</span>
                    </span>
                  ) : (
                    <>
                      <IoSave className="w-4 h-4 text-brand-primary" />
                      <span>Save QR Preset</span>
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Hand: Interactive Preview Box & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-[#E1E5E9] shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-xl p-5 md:p-6 text-center space-y-5"
          >
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#626A73]">Live Preview</h3>

            {/* Canvas container with beautiful presentation layout */}
            <div className="bg-[#EDF1F5] p-6 rounded-2xl flex items-center justify-center min-h-[260px] max-h-[300px] border border-[#D0D7DE] shadow-inner relative overflow-hidden group">
              {qrCodeDataUrl ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-2.5 rounded-lg border border-[#D0D7DE] shadow-md flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                  onClick={handleCopyImage}
                  title="Click to copy image to clipboard"
                >
                  <img
                    src={qrCodeDataUrl}
                    alt="Live QR Code"
                    className="w-48 h-48 object-contain"
                  />
                </motion.div>
              ) : (
                <div className="text-center text-xs text-[#8D959F] space-y-2">
                  <IoQrCode className="w-12 h-12 mx-auto text-[#CBD5E1] animate-pulse" />
                  <p className="font-medium text-[#626A73]">Enter a URL to preview QR</p>
                </div>
              )}
            </div>

            {/* Offline Canvas used exclusively to get blob representations for copy features */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Action buttons */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  disabled={!qrCodeDataUrl || loading}
                  onClick={handleDownloadPng}
                  className="h-10 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border border-[#E1E5E9] bg-white text-[#17191C] hover:bg-[#F5F7F9] active:bg-[#EDF1F5] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                >
                  <IoDownload className="w-3.5 h-3.5" />
                  <span>Download PNG</span>
                </button>

                <button
                  disabled={!url.trim() || isUrlInvalid || loading}
                  onClick={handleDownloadSvg}
                  className="h-10 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border border-[#E1E5E9] bg-white text-[#17191C] hover:bg-[#F5F7F9] active:bg-[#EDF1F5] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                >
                  <IoDownload className="w-3.5 h-3.5 text-brand-primary" />
                  <span>Download SVG</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  disabled={!qrCodeDataUrl || loading}
                  onClick={handleCopyImage}
                  className={`h-10 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs ${
                    copiedImage
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                      : "bg-white border-[#E1E5E9] text-[#17191C] hover:bg-[#F5F7F9] active:bg-[#EDF1F5]"
                  }`}
                >
                  <IoCopy className="w-3.5 h-3.5" />
                  <span>{copiedImage ? "Copied Image!" : "Copy Image"}</span>
                </button>

                <button
                  disabled={!url.trim() || isUrlInvalid}
                  onClick={() => handleCopyLink(url.trim())}
                  className={`h-10 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs ${
                    copiedLink
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                      : "bg-white border-[#E1E5E9] text-[#17191C] hover:bg-[#F5F7F9] active:bg-[#EDF1F5]"
                  }`}
                >
                  <IoCopy className="w-3.5 h-3.5 text-brand-primary" />
                  <span>{copiedLink ? "Copied Link!" : "Copy Link"}</span>
                </button>
              </div>

              {url.trim() && (
                <button
                  onClick={handleReset}
                  className="w-full h-9 border border-dashed border-[#CBD5E1] hover:border-brand-primary hover:text-brand-primary text-xs font-semibold text-[#626A73] rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <IoRefresh className="w-4 h-4" />
                  <span>Create Another QR</span>
                </button>
              )}
            </div>
          </motion.div>

          {/* Synchronized Cloud Presets History */}
          {isAuthenticated && (
            <div className="space-y-3 pt-4 border-t border-[#D0D7DE]/60">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-[#17191C]">Saved QR Codes</h4>
                <span className="text-[10px] bg-brand-soft text-brand-primary font-bold px-2.5 py-0.5 rounded-full">
                  {savedQrs.length} saved
                </span>
              </div>

              <div className="max-h-[260px] overflow-y-auto pr-1 space-y-2.5">
                {savedQrs.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-[#E1E5E9] rounded-xl text-xs text-[#626A73] space-y-1">
                    <p>No saved QR codes found.</p>
                    <p className="text-[10px] text-[#8D959F]">Your saved presets will appear here.</p>
                  </div>
                ) : (
                  savedQrs.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleLoadPreset(item)}
                      className="group bg-white border border-[#E1E5E9] hover:border-brand-primary rounded-xl p-3 flex items-center justify-between transition-all cursor-pointer shadow-xs"
                    >
                      <div className="space-y-1 max-w-[200px] truncate">
                        <span className="font-bold text-xs text-[#17191C] block truncate">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-[#626A73] block truncate" title={item.url}>
                          {item.url}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyLink(item.url, true, item.id);
                          }}
                          className={`p-1.5 rounded transition-colors text-xs font-bold ${
                            copiedSavedId === item.id
                              ? "text-emerald-600 bg-emerald-50"
                              : "text-[#626A73] hover:text-brand-primary hover:bg-[#EDF1F5]"
                          }`}
                          title="Copy Destination URL"
                        >
                          <IoCopy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeletePreset(item.id, e)}
                          className="p-1.5 text-[#8D959F] hover:text-rose-600 rounded hover:bg-[#EDF1F5] transition-colors"
                          title="Delete Preset"
                        >
                          <IoTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
