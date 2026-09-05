import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import {
  IoLink,
  IoCopy,
  IoOpen,
  IoAdd,
  IoTrash,
  IoAlertCircle,
  IoCheckmarkCircle,
  IoTime,
  IoBarChart,
  IoGlobe,
} from "react-icons/io5";

interface ShortLink {
  id: string;
  slug: string;
  destination_url: string;
  click_count: number;
  created_at: string;
}

export const LinkShortener: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [longUrl, setLongUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // The newly created short link result
  const [result, setResult] = useState<{
    shortUrl: string;
    slug: string;
    destinationUrl: string;
    createdAt: string;
  } | null>(null);

  // History list state
  const [history, setHistory] = useState<ShortLink[]>([]);
  const [isCopied, setIsCopied] = useState<string | null>(null); // maps slug to copied state

  // Load history from Supabase (if authenticated) or LocalStorage
  const fetchHistory = async () => {
    if (isAuthenticated && user) {
      try {
        const { data, error: dbErr } = await supabase
          .from("short_links")
          .select("id, slug, destination_url, click_count, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (!dbErr && data) {
          setHistory(data as ShortLink[]);
        }
      } catch (err) {
        console.error("Failed to fetch cloud shortener history:", err);
      }
    } else {
      // Fallback: anonymous local storage
      const localData = localStorage.getItem("smyl_local_short_links");
      if (localData) {
        try {
          setHistory(JSON.parse(localData));
        } catch (err) {
          setHistory([]);
        }
      } else {
        setHistory([]);
      }
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user, isAuthenticated]);

  // Sync anonymous links to authenticated account if they log in
  useEffect(() => {
    const syncLocalLinks = async () => {
      if (isAuthenticated && user) {
        const localData = localStorage.getItem("smyl_local_short_links");
        if (localData) {
          try {
            const localLinks: ShortLink[] = JSON.parse(localData);
            if (localLinks.length > 0) {
              const { data: session } = await supabase.auth.getSession();
              const token = session?.session?.access_token;
              
              // Upload local links to user's database account via the API
              for (const link of localLinks) {
                try {
                  await fetch("/api/utilities/shorten", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({
                      url: link.destination_url,
                      slug: link.slug,
                    }),
                  });
                } catch (e) {
                  // Silent fallback for individual sync fails
                }
              }
              // Clear local storage list after synchronizing
              localStorage.removeItem("smyl_local_short_links");
              fetchHistory();
            }
          } catch (err) {
            console.error("Failed syncing local shortlinks:", err);
          }
        }
      }
    };
    syncLocalLinks();
  }, [user, isAuthenticated]);

  // Handle CTA Submit / Shorten
  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setResult(null);

    const trimmedUrl = longUrl.trim();
    if (!trimmedUrl) {
      setError("Please paste a valid long URL.");
      return;
    }

    // Basic client-side prefix matching
    if (!/^https?:\/\//i.test(trimmedUrl)) {
      setError("URL must start with http:// or https://");
      return;
    }

    setLoading(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;

      const response = await fetch("/api/utilities/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          url: trimmedUrl,
          slug: customSlug.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An error occurred while shortening the link.");
      }

      setResult({
        shortUrl: data.shortUrl,
        slug: data.slug,
        destinationUrl: data.destinationUrl,
        createdAt: data.createdAt || new Date().toISOString(),
      });

      setSuccess("Your Smyl link is ready!");

      // Append to local state / persistence
      const newShortLink: ShortLink = {
        id: Math.random().toString(), // local fallback ID
        slug: data.slug,
        destination_url: data.destinationUrl,
        click_count: 0,
        created_at: data.createdAt || new Date().toISOString(),
      };

      if (isAuthenticated && user) {
        // Authenticated history is auto-refreshed, but let's update immediately for instant UX
        setHistory((prev) => [newShortLink, ...prev]);
        fetchHistory(); // Sync fully
      } else {
        // Unauthenticated local storage persistence
        const currentLocal = localStorage.getItem("smyl_local_short_links");
        let localList: ShortLink[] = [];
        if (currentLocal) {
          try {
            localList = JSON.parse(currentLocal);
          } catch (e) {
            localList = [];
          }
        }
        // Check if slug already in local history to avoid duplicate items
        if (!localList.some((link) => link.slug === data.slug)) {
          const updatedList = [newShortLink, ...localList];
          localStorage.setItem("smyl_local_short_links", JSON.stringify(updatedList));
          setHistory(updatedList);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to shorten URL.");
    } finally {
      setLoading(false);
    }
  };

  // Delete Link (if authenticated)
  const handleDeleteLink = async (id: string, slug: string) => {
    if (isAuthenticated && user) {
      try {
        const { error: delErr } = await supabase
          .from("short_links")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (delErr) throw delErr;
        setHistory((prev) => prev.filter((item) => item.id !== id));
      } catch (err) {
        console.error("Failed to delete link:", err);
      }
    } else {
      // Local delete
      const updated = history.filter((item) => item.slug !== slug);
      localStorage.setItem("smyl_local_short_links", JSON.stringify(updated));
      setHistory(updated);
    }
  };

  const handleCopy = (text: string, slug: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(slug);
    setTimeout(() => {
      setIsCopied(null);
    }, 2000);
  };

  const resetForm = () => {
    setLongUrl("");
    setCustomSlug("");
    setResult(null);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8 space-y-8" id="link-shortener-container">
      {/* Title block */}
      <div className="text-center md:text-left space-y-1 pb-4 border-b border-[#D0D7DE]/60">
        <h1 className="text-2xl font-bold text-[#17191C] tracking-tight">Shorten a long link</h1>
        <p className="text-sm text-[#626A73]">Create a clean, shareable Smyl link in seconds.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Hand: Creation Card */}
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 450, damping: 35 }}
            className="bg-white border border-[#E1E5E9] shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-xl p-5 md:p-6 space-y-6"
          >
            <AnimatePresence mode="wait">
              {!result ? (
                <form onSubmit={handleShorten} className="space-y-5">
                  {/* Long URL Input */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#17191C]">
                      Paste your long URL
                    </label>
                    <div className="relative flex items-center">
                      <IoLink className="absolute left-3 w-5 h-5 text-[#8D959F]" />
                      <input
                        type="url"
                        required
                        value={longUrl}
                        onChange={(e) => setLongUrl(e.target.value)}
                        placeholder="https://example.com/very-long-url-path"
                        className="w-full h-10 pl-10 pr-3 bg-white border border-[#E1E5E9] rounded-lg text-sm text-[#17191C] placeholder-[#8D959F] hover:border-[#B9C0C8] focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Optional Custom Slug */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-[#17191C]">
                        Custom slug <span className="text-[#8D959F] font-normal">(Optional)</span>
                      </label>
                      <span className="text-[10px] text-[#8D959F]">a-z, 0-9, hyphens</span>
                    </div>
                    <div className="flex rounded-lg border border-[#E1E5E9] bg-[#EDF1F5] overflow-hidden focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary transition-all">
                      <span className="bg-[#EDF1F5] px-3 h-10 flex items-center text-xs font-medium text-[#626A73] border-r border-[#E1E5E9]">
                        smyl.link/
                      </span>
                      <input
                        type="text"
                        value={customSlug}
                        onChange={(e) => setCustomSlug(e.target.value)}
                        placeholder="my-custom-slug"
                        className="flex-1 h-10 px-3 bg-white text-sm text-[#17191C] placeholder-[#8D959F] outline-none border-none"
                      />
                    </div>
                  </div>

                  {/* Error State */}
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

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    type="submit"
                    className="w-full h-10 bg-brand-primary hover:bg-brand-hover active:bg-brand-pressed text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:bg-[#D6DEEF] disabled:text-[#8794AD] disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Shortening URL...</span>
                      </span>
                    ) : (
                      <>
                        <IoLink className="w-4 h-4" />
                        <span>Shorten URL</span>
                      </>
                    )}
                  </motion.button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="space-y-6"
                >
                  {/* Success Header */}
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-[#2E9B62]" />
                    <span>{success}</span>
                  </div>

                  {/* Short Link Card display */}
                  <div className="space-y-4">
                    <div className="p-4 bg-[#EDF1F5] rounded-xl border border-[#E1E5E9] space-y-3">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-[#626A73]">
                          Short URL
                        </span>
                        <p className="text-lg font-bold text-brand-primary select-all truncate mt-0.5">
                          {result.shortUrl}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#E1E5E9] space-y-1 text-xs text-[#626A73]">
                        <div className="flex justify-between">
                          <span className="font-medium">Original URL:</span>
                          <span className="max-w-[200px] truncate text-right text-[#17191C]" title={result.destinationUrl}>
                            {result.destinationUrl}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Created:</span>
                          <span className="text-[#17191C]">
                            {new Date(result.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleCopy(result.shortUrl, result.slug)}
                        className={`h-10 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 border transition-colors cursor-pointer ${
                          isCopied === result.slug
                            ? "bg-emerald-50 border-[#2E9B62] text-[#2E9B62]"
                            : "bg-white border-[#E1E5E9] text-[#17191C] hover:bg-[#F5F7F9]"
                        }`}
                      >
                        <IoCopy className="w-4 h-4" />
                        <span>{isCopied === result.slug ? "Copied!" : "Copy Link"}</span>
                      </button>

                      <a
                        href={result.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-10 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 border border-[#E1E5E9] bg-white text-[#17191C] hover:bg-[#F5F7F9] transition-colors"
                      >
                        <IoOpen className="w-4 h-4" />
                        <span>Open Link</span>
                      </a>
                    </div>

                    <button
                      onClick={resetForm}
                      className="w-full h-10 border border-brand-primary text-brand-primary hover:text-brand-hover font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <IoAdd className="w-4 h-4" />
                      <span>Create another</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Right Hand: Utility History list */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#D0D7DE]/60">
            <h3 className="font-bold text-sm text-[#17191C]">Shortened Links History</h3>
            <span className="text-xs bg-[#E8EEFF] text-brand-primary font-bold px-2.5 py-0.5 rounded-full">
              {history.length} links
            </span>
          </div>

          <div className="max-h-[480px] overflow-y-auto pr-1 space-y-3">
            <AnimatePresence initial={false}>
              {history.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-[#E1E5E9] rounded-xl text-xs text-[#626A73] space-y-2">
                  <IoGlobe className="w-8 h-8 mx-auto text-[#8D959F] opacity-60" />
                  <p>No shortened links found.</p>
                  <p className="text-[11px] text-[#8D959F]">Your generated links will appear here.</p>
                </div>
              ) : (
                history.map((item) => (
                  <motion.div
                    key={item.id || item.slug}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="group bg-white border border-[#E1E5E9] hover:border-[#B9C0C8] rounded-xl p-3.5 space-y-2 transition-all relative shadow-xs"
                  >
                    {/* Top Row: Slug & Copy & Open */}
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#17191C] truncate max-w-[150px]">
                        smyl.link/{item.slug}
                      </span>
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCopy(`${window.location.protocol}//${window.location.host}/s/${item.slug}`, item.slug)}
                          className="p-1.5 text-[#626A73] hover:text-brand-primary rounded hover:bg-[#EDF1F5] transition-colors"
                          title="Copy Link"
                        >
                          <IoCopy className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={`${window.location.protocol}//${window.location.host}/s/${item.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-[#626A73] hover:text-brand-primary rounded hover:bg-[#EDF1F5] transition-colors"
                          title="Open Link"
                        >
                          <IoOpen className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleDeleteLink(item.id, item.slug)}
                          className="p-1.5 text-[#8D959F] hover:text-rose-600 rounded hover:bg-[#EDF1F5] transition-colors"
                          title="Delete link"
                        >
                          <IoTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Bottom stats / details */}
                    <p className="text-xs text-[#626A73] truncate" title={item.destination_url}>
                      {item.destination_url}
                    </p>

                    <div className="pt-2 border-t border-[#ECEEF1] flex items-center justify-between text-[10px] text-[#8D959F]">
                      <span className="flex items-center gap-1">
                        <IoTime className="w-3 h-3" />
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-[#626A73]">
                        <IoBarChart className="w-3 h-3 text-[#2E9B62]" />
                        <span>{item.click_count || 0} Clicks</span>
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
