import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { supabase, isTableMissingError, isSupabaseConfigured } from "../lib/supabase";
import {
  IoLink,
  IoCopy,
  IoOpen,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoTrash,
  IoTime,
  IoRefresh,
  IoFlame,
  IoBookmark,
  IoSparkles,
} from "react-icons/io5";

interface SavedUtm {
  id: string;
  website_url: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term?: string;
  utm_content?: string;
  generated_url: string;
  created_at: string;
}

interface UtmBuilderProps {
  onShorten?: (url: string) => void;
  onProcessingChange?: (processing: boolean) => void;
}

export const UtmBuilder: React.FC<UtmBuilderProps> = ({ onShorten, onProcessingChange }) => {
  const { user, isAuthenticated } = useAuth();

  // Form Fields
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [utmTerm, setUtmTerm] = useState("");
  const [utmContent, setUtmContent] = useState("");

  // UI state
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<SavedUtm[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load history on mount or auth change
  const fetchHistory = async () => {
    if (!isSupabaseConfigured) {
      loadLocalHistory();
      return;
    }

    if (isAuthenticated && user) {
      setLoadingHistory(true);
      try {
        const { data, error: dbErr } = await supabase
          .from("utm_history")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (dbErr) {
          if (isTableMissingError(dbErr)) {
            // Table doesn't exist, fall back to local storage
            loadLocalHistory();
          } else {
            console.error("Supabase UTM fetch error:", dbErr);
            loadLocalHistory();
          }
        } else if (data) {
          setHistory(
            data.map((item: any) => ({
              id: item.id,
              website_url: item.website_url,
              utm_source: item.utm_source,
              utm_medium: item.utm_medium,
              utm_campaign: item.utm_campaign,
              utm_term: item.utm_term,
              utm_content: item.utm_content,
              generated_url: item.generated_url,
              created_at: item.created_at,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to fetch UTM history:", err);
        loadLocalHistory();
      } finally {
        setLoadingHistory(false);
      }
    } else {
      loadLocalHistory();
    }
  };

  const loadLocalHistory = () => {
    const localData = localStorage.getItem("smyl_utm_history");
    if (localData) {
      try {
        setHistory(JSON.parse(localData));
      } catch (err) {
        setHistory([]);
      }
    } else {
      setHistory([]);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user, isAuthenticated]);

  // Sync anonymous history to cloud account when user logs in
  useEffect(() => {
    const syncLocalHistory = async () => {
      if (isSupabaseConfigured && isAuthenticated && user) {
        const localData = localStorage.getItem("smyl_utm_history");
        if (localData) {
          try {
            const localList: SavedUtm[] = JSON.parse(localData);
            if (localList.length > 0) {
              for (const item of localList) {
                try {
                  await supabase.from("utm_history").insert({
                    user_id: user.id,
                    website_url: item.website_url,
                    utm_source: item.utm_source,
                    utm_medium: item.utm_medium,
                    utm_campaign: item.utm_campaign,
                    utm_term: item.utm_term || null,
                    utm_content: item.utm_content || null,
                    generated_url: item.generated_url,
                  });
                } catch (e) {
                  // Silent fallback
                }
              }
              localStorage.removeItem("smyl_utm_history");
              fetchHistory();
            }
          } catch (err) {
            console.error("Failed syncing local UTM links:", err);
          }
        }
      }
    };
    syncLocalHistory();
  }, [user, isAuthenticated]);

  // Handle Preset selection
  const handleApplyPreset = (preset: string) => {
    setError(null);
    setSuccess(null);
    switch (preset) {
      case "LinkedIn":
        setUtmSource("linkedin");
        setUtmMedium("social");
        break;
      case "X":
        setUtmSource("x");
        setUtmMedium("social");
        break;
      case "Newsletter":
        setUtmSource("newsletter");
        setUtmMedium("email");
        break;
      case "Email":
        setUtmSource("email");
        setUtmMedium("email");
        break;
      case "Paid Social":
        setUtmSource("social");
        setUtmMedium("cpc");
        break;
      default:
        // Clear or other
        setUtmSource("");
        setUtmMedium("");
        break;
    }
  };

  // Field Normalizer
  const normalizeInput = (urlInput: string): string => {
    let clean = urlInput.trim();

    // Accidental pasted quotes
    if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
      clean = clean.slice(1, -1).trim();
    }

    // Normalizing trailing punctuation only when clearly introduced by pasted text
    // (e.g. trailing periods, commas, or parentheses if they don't match open parenthesis)
    if (clean.endsWith(".") || clean.endsWith(",") || clean.endsWith(")") || clean.endsWith("]")) {
      const lastChar = clean.slice(-1);
      if (lastChar === ")" && clean.includes("(")) {
        // Legitimate URL part
      } else if (lastChar === "]" && clean.includes("[")) {
        // Legitimate URL part
      } else {
        clean = clean.slice(0, -1);
      }
    }

    return clean;
  };

  const handleBuild = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setGeneratedUrl("");
    setBuilding(true);
    onProcessingChange?.(true);

    // Standard field length limits
    const maxUrlLength = 2048;
    const maxParamLength = 256;

    const rawUrl = websiteUrl.trim();
    if (!rawUrl) {
      setError("Website URL is required.");
      setBuilding(false);
      onProcessingChange?.(false);
      return;
    }

    const cleanUrl = normalizeInput(rawUrl);

    if (cleanUrl.length > maxUrlLength) {
      setError(`URL exceeds sensible length limit of ${maxUrlLength} characters.`);
      setBuilding(false);
      onProcessingChange?.(false);
      return;
    }

    // Scheme Checks
    const lowerUrl = cleanUrl.toLowerCase();
    if (
      lowerUrl.startsWith("javascript:") ||
      lowerUrl.startsWith("data:") ||
      lowerUrl.startsWith("vbscript:") ||
      lowerUrl.startsWith("file:")
    ) {
      setError("Forbidden protocol. Only http:// or https:// URLs are allowed.");
      setBuilding(false);
      onProcessingChange?.(false);
      return;
    }

    if (!lowerUrl.startsWith("http://") && !lowerUrl.startsWith("https://")) {
      setError("Website URL must start with http:// or https://");
      setBuilding(false);
      onProcessingChange?.(false);
      return;
    }

    // Campaign Required params checks
    const sourceClean = utmSource.trim();
    const mediumClean = utmMedium.trim();
    const campaignClean = utmCampaign.trim();

    if (!sourceClean || !mediumClean || !campaignClean) {
      setError("Source, Medium, and Campaign name parameters are required.");
      setBuilding(false);
      onProcessingChange?.(false);
      return;
    }

    // Extreme field length limits for UTM parameters
    if (
      sourceClean.length > maxParamLength ||
      mediumClean.length > maxParamLength ||
      campaignClean.length > maxParamLength ||
      utmTerm.trim().length > maxParamLength ||
      utmContent.trim().length > maxParamLength
    ) {
      setError(`Campaign parameter values cannot exceed ${maxParamLength} characters.`);
      setBuilding(false);
      onProcessingChange?.(false);
      return;
    }

    try {
      // Use URL constructor for robust parsing & formatting
      const urlObj = new URL(cleanUrl);

      // Set standard parameters (preserving other parameters, replacing matching ones)
      urlObj.searchParams.set("utm_source", sourceClean);
      urlObj.searchParams.set("utm_medium", mediumClean);
      urlObj.searchParams.set("utm_campaign", campaignClean);

      // Set optional parameters if populated
      const termClean = utmTerm.trim();
      if (termClean) {
        urlObj.searchParams.set("utm_term", termClean);
      } else {
        urlObj.searchParams.delete("utm_term");
      }

      const contentClean = utmContent.trim();
      if (contentClean) {
        urlObj.searchParams.set("utm_content", contentClean);
      } else {
        urlObj.searchParams.delete("utm_content");
      }

      const finalUrl = urlObj.toString();
      setGeneratedUrl(finalUrl);
      setSuccess("UTM trackable link successfully generated!");

      // Save to persistence
      const newSavedItem: SavedUtm = {
        id: Math.random().toString(36).substr(2, 9),
        website_url: cleanUrl,
        utm_source: sourceClean,
        utm_medium: mediumClean,
        utm_campaign: campaignClean,
        utm_term: termClean || undefined,
        utm_content: contentClean || undefined,
        generated_url: finalUrl,
        created_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured && isAuthenticated && user) {
        try {
          const { data, error: dbErr } = await supabase
            .from("utm_history")
            .insert({
              user_id: user.id,
              website_url: cleanUrl,
              utm_source: sourceClean,
              utm_medium: mediumClean,
              utm_campaign: campaignClean,
              utm_term: termClean || null,
              utm_content: contentClean || null,
              generated_url: finalUrl,
            })
            .select()
            .single();

          if (!dbErr && data) {
            setHistory((prev) => [
              {
                id: data.id,
                website_url: data.website_url,
                utm_source: data.utm_source,
                utm_medium: data.utm_medium,
                utm_campaign: data.utm_campaign,
                utm_term: data.utm_term,
                utm_content: data.utm_content,
                generated_url: data.generated_url,
                created_at: data.created_at,
              },
              ...prev,
            ]);
          } else {
            // Dropdown missing table fallback
            saveLocalItem(newSavedItem);
          }
        } catch (e) {
          saveLocalItem(newSavedItem);
        }
      } else {
        saveLocalItem(newSavedItem);
      }
    } catch (err) {
      setError("Invalid website URL format. Please double check.");
    } finally {
      setBuilding(false);
      onProcessingChange?.(false);
    }
  };

  const saveLocalItem = (item: SavedUtm) => {
    const currentLocal = localStorage.getItem("smyl_utm_history");
    let localList: SavedUtm[] = [];
    if (currentLocal) {
      try {
        localList = JSON.parse(currentLocal);
      } catch (e) {
        localList = [];
      }
    }
    const updated = [item, ...localList].slice(0, 30); // limit local history to latest 30 items
    localStorage.setItem("smyl_utm_history", JSON.stringify(updated));
    setHistory(updated);
  };

  const handleDeleteHistoryItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSupabaseConfigured && isAuthenticated && user) {
      try {
        const { error: delErr } = await supabase
          .from("utm_history")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (!delErr) {
          setHistory((prev) => prev.filter((item) => item.id !== id));
        } else {
          // Local fallback
          deleteLocalItem(id);
        }
      } catch (err) {
        deleteLocalItem(id);
      }
    } else {
      deleteLocalItem(id);
    }
  };

  const deleteLocalItem = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    localStorage.setItem("smyl_utm_history", JSON.stringify(updated));
    setHistory(updated);
  };

  const handleCopyUrl = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleLoadHistory = (item: SavedUtm) => {
    setWebsiteUrl(item.website_url);
    setUtmSource(item.utm_source);
    setUtmMedium(item.utm_medium);
    setUtmCampaign(item.utm_campaign);
    setUtmTerm(item.utm_term || "");
    setUtmContent(item.utm_content || "");
    setGeneratedUrl(item.generated_url);
    setError(null);
    setSuccess("UTM Link loaded from history.");
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-8">
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E1E5E9]">
        <div>
          <h1 className="text-2xl font-bold text-[#17191C] tracking-tight">Build a trackable link</h1>
          <p className="text-xs text-[#626A73] mt-1 max-w-xl">
            Add campaign parameters to any URL without constructing UTM strings manually. Keep your analytics clean and consistent.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Inputs and presets */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleBuild} className="bg-white border border-[#E1E5E9] rounded-2xl shadow-xs p-6 space-y-6">
            <h2 className="text-sm font-bold text-[#17191C] border-b border-[#ECEEF1] pb-3">Campaign Details</h2>

            {/* Presets Row */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#8D959F] uppercase tracking-wider">Quick Presets</label>
              <div className="flex flex-wrap gap-2">
                {["LinkedIn", "X", "Newsletter", "Email", "Paid Social"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="h-8 px-3 rounded-lg border border-[#D0D7DE] bg-white hover:bg-[#F8FAFC] text-[#17191C] font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <span>{preset}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleApplyPreset("Other")}
                  className="h-8 px-3 rounded-lg border border-[#D0D7DE] bg-[#F5F7F9] hover:bg-[#E1E5E9] text-[#626A73] font-semibold text-xs transition-colors cursor-pointer"
                >
                  Clear Presets
                </button>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Destination URL */}
              <div className="md:col-span-2 space-y-1.5">
                <label htmlFor="website-url" className="text-xs font-bold text-[#17191C] flex items-center gap-1">
                  <span>Website URL</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8D959F]">
                    <IoLink className="w-4 h-4" />
                  </div>
                  <input
                    id="website-url"
                    type="text"
                    required
                    placeholder="https://example.com/page?query=1"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-[#D0D7DE] focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none text-xs font-medium placeholder-[#8D959F] text-[#17191C]"
                  />
                </div>
              </div>

              {/* Campaign Source */}
              <div className="space-y-1.5">
                <label htmlFor="utm-source" className="text-xs font-bold text-[#17191C] flex items-center gap-1">
                  <span>Campaign Source</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="utm-source"
                  type="text"
                  required
                  placeholder="e.g. google, newsletter, linkedin"
                  value={utmSource}
                  onChange={(e) => setUtmSource(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#D0D7DE] focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none text-xs font-medium placeholder-[#8D959F] text-[#17191C]"
                />
              </div>

              {/* Campaign Medium */}
              <div className="space-y-1.5">
                <label htmlFor="utm-medium" className="text-xs font-bold text-[#17191C] flex items-center gap-1">
                  <span>Campaign Medium</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="utm-medium"
                  type="text"
                  required
                  placeholder="e.g. cpc, email, social"
                  value={utmMedium}
                  onChange={(e) => setUtmMedium(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#D0D7DE] focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none text-xs font-medium placeholder-[#8D959F] text-[#17191C]"
                />
              </div>

              {/* Campaign Name */}
              <div className="md:col-span-2 space-y-1.5">
                <label htmlFor="utm-campaign" className="text-xs font-bold text-[#17191C] flex items-center gap-1">
                  <span>Campaign Name</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="utm-campaign"
                  type="text"
                  required
                  placeholder="e.g. black_friday, product_launch"
                  value={utmCampaign}
                  onChange={(e) => setUtmCampaign(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#D0D7DE] focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none text-xs font-medium placeholder-[#8D959F] text-[#17191C]"
                />
              </div>

              {/* Campaign Term (Optional) */}
              <div className="space-y-1.5">
                <label htmlFor="utm-term" className="text-xs font-bold text-[#17191C]">
                  <span>Campaign Term <span className="text-[#8D959F] font-normal text-[10px]">(Optional)</span></span>
                </label>
                <input
                  id="utm-term"
                  type="text"
                  placeholder="e.g. marketing_pills"
                  value={utmTerm}
                  onChange={(e) => setUtmTerm(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#D0D7DE] focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none text-xs font-medium placeholder-[#8D959F] text-[#17191C]"
                />
              </div>

              {/* Campaign Content (Optional) */}
              <div className="space-y-1.5">
                <label htmlFor="utm-content" className="text-xs font-bold text-[#17191C]">
                  <span>Campaign Content <span className="text-[#8D959F] font-normal text-[10px]">(Optional)</span></span>
                </label>
                <input
                  id="utm-content"
                  type="text"
                  placeholder="e.g. logolink_banner"
                  value={utmContent}
                  onChange={(e) => setUtmContent(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#D0D7DE] focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none text-xs font-medium placeholder-[#8D959F] text-[#17191C]"
                />
              </div>
            </div>

            {/* Error / Success Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700 text-xs font-medium overflow-hidden"
                >
                  <IoAlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-emerald-800 text-xs font-medium overflow-hidden"
                >
                  <IoCheckmarkCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form Actions */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto h-10 px-6 rounded-lg bg-brand-primary hover:bg-brand-hover text-white font-bold text-xs transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <IoSparkles className="w-4 h-4" />
                <span>Build UTM link</span>
              </button>
            </div>
          </form>

          {/* Generated Link Card */}
          <AnimatePresence mode="wait">
            {building ? (
              <motion.div
                key="building-skeleton"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white border border-[#E1E5E9] rounded-2xl shadow-sm p-6 space-y-4 relative overflow-hidden"
              >
                {/* Dimmed background pulsing skeleton layout */}
                <div className="space-y-4 opacity-40 select-none pointer-events-none animate-pulse">
                  <div className="flex items-center justify-between border-b border-[#ECEEF1] pb-3">
                    <div className="h-4 bg-[#EDF1F5] rounded w-1/3" />
                    <div className="h-5 bg-[#EDF1F5] rounded w-16" />
                  </div>
                  <div className="h-12 bg-[#EDF1F5]/60 rounded-xl w-full" />
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-10 bg-[#EDF1F5] rounded-lg w-full" />
                    <div className="h-10 bg-[#EDF1F5] rounded-lg w-full" />
                    <div className="h-10 bg-[#EDF1F5] rounded-lg w-full" />
                  </div>
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
                    Compiling UTM campaign string...
                  </span>
                </div>
              </motion.div>
            ) : generatedUrl && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="bg-white border border-[#E1E5E9] rounded-2xl shadow-sm p-6 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-[#ECEEF1] pb-3">
                  <h3 className="text-xs font-bold text-[#17191C] uppercase tracking-wider">Generated Trackable Link</h3>
                  <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest bg-brand-soft px-2 py-0.5 rounded">UTM Ready</span>
                </div>

                <div className="bg-[#F5F7F9] border border-[#E1E5E9] rounded-xl p-3.5 break-all text-xs font-mono font-medium text-[#17191C] select-all relative group">
                  {generatedUrl}
                </div>

                {/* Primary Actions Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Copy URL Button */}
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className={`h-10 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 border shadow-xs ${
                      copied
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                        : "bg-white border-[#D0D7DE] hover:bg-[#F8FAFC] text-[#17191C]"
                    }`}
                  >
                    {copied ? (
                      <>
                        <IoCheckmarkCircle className="w-4 h-4 text-emerald-500" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <IoCopy className="w-4 h-4 text-[#626A73]" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>

                  {/* Open URL Button */}
                  <a
                    href={generatedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 rounded-lg border border-[#D0D7DE] bg-white hover:bg-[#F8FAFC] text-[#17191C] font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                  >
                    <IoOpen className="w-4 h-4 text-[#626A73]" />
                    <span>Open URL</span>
                  </a>

                  {/* Shorten with Smyl */}
                  {onShorten && (
                    <button
                      type="button"
                      onClick={() => onShorten(generatedUrl)}
                      className="h-10 rounded-lg bg-[#E1E5E9]/60 hover:bg-[#E1E5E9] text-[#17191C] font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <IoLink className="w-4 h-4 text-[#626A73]" />
                      <span>Shorten with Smyl</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: UTM Presets / Saved History */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E1E5E9] rounded-2xl shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#ECEEF1] pb-3">
              <h2 className="text-xs font-bold text-[#17191C] uppercase tracking-wider flex items-center gap-2">
                <IoBookmark className="w-4 h-4 text-brand-primary" />
                <span>Presets & History</span>
              </h2>
              {history.length > 0 && (
                <span className="text-[10px] font-bold bg-[#F5F7F9] text-[#626A73] px-2 py-0.5 rounded-full">
                  {history.length}
                </span>
              )}
            </div>

            {loadingHistory ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-[10px] text-[#8D959F]">Syncing preset data...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="py-8 text-center space-y-2 border-2 border-dashed border-[#E1E5E9] rounded-xl">
                <IoTime className="w-5 h-5 text-[#8D959F] mx-auto opacity-60" />
                <p className="text-xs font-bold text-[#17191C]">No link history</p>
                <p className="text-[10px] text-[#626A73] max-w-xs mx-auto px-4">
                  Built UTM links are synced locally. Sign in to sync them to the cloud.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleLoadHistory(item)}
                    className="group border border-[#E1E5E9] hover:border-brand-primary/50 hover:bg-[#F8FAFC] rounded-xl p-3 space-y-2 transition-all cursor-pointer relative"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 pr-4">
                        <p className="text-xs font-bold text-[#17191C] truncate">{item.website_url}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="text-[9px] font-bold uppercase tracking-wide bg-indigo-50 text-indigo-600 px-1.5 py-0.2 rounded">
                            {item.utm_source}
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-wide bg-purple-50 text-purple-600 px-1.5 py-0.2 rounded">
                            {item.utm_medium}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                        className="text-[#8D959F] hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 absolute top-2.5 right-2.5"
                        title="Delete UTM history item"
                      >
                        <IoTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="pt-1.5 border-t border-[#ECEEF1]/60 flex items-center justify-between text-[10px] text-[#8D959F]">
                      <span className="font-semibold text-brand-primary capitalize">{item.utm_campaign}</span>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
