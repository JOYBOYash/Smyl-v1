import React, { useState, useEffect } from "react";
import { 
  Link as LinkIcon, Compass, Plus, Trash2, Edit3, Save, Globe, Settings, 
  Share2, Copy, ExternalLink, Lock, Eye, EyeOff, Check, ChevronUp, 
  ChevronDown, User, Loader, ArrowLeft, Palette, Power
} from "lucide-react";
import { isSupabaseConfigured } from "../lib/supabase";

// 1. Definition of Link Hub Themes
export interface HubTheme {
  id: string;
  name: string;
  background: string; // Tailwind bg class
  buttonStyle: string; // Tailwind button styling
  textColor: string; // Tailwind title color
  bioColor: string; // Tailwind bio text color
  cardBg: string; // Live preview container background
}

export const THEMES: HubTheme[] = [
  {
    id: "light",
    name: "Clean Light",
    background: "bg-[#F8FAFC]",
    buttonStyle: "rounded-xl border border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-slate-50 transition-all shadow-sm",
    textColor: "text-[#0F172A]",
    bioColor: "text-slate-500",
    cardBg: "bg-white border border-[#F1F5F9]"
  },
  {
    id: "dark",
    name: "Minimal Dark",
    background: "bg-[#090D16]",
    buttonStyle: "rounded-xl border border-slate-800 bg-[#121A2E] text-slate-100 hover:bg-[#1A2642] transition-all shadow-md",
    textColor: "text-slate-100",
    bioColor: "text-slate-400",
    cardBg: "bg-[#0B111E] border border-slate-900"
  },
  {
    id: "sage",
    name: "Sage Warmth",
    background: "bg-[#F4F3EF]",
    buttonStyle: "rounded-xl bg-[#2D4A43] text-[#F4F3EF] hover:opacity-90 transition-all shadow-sm",
    textColor: "text-[#2D4A43]",
    bioColor: "text-[#4A6B5E]",
    cardBg: "bg-white/80 border border-[#E9E7DF]"
  },
  {
    id: "sunset",
    name: "Sunset Coral",
    background: "bg-[#FFF9F6]",
    buttonStyle: "rounded-xl border-2 border-[#E16D53] bg-transparent text-[#E16D53] hover:bg-[#E16D53] hover:text-white transition-all font-semibold",
    textColor: "text-[#E16D53]",
    bioColor: "text-orange-700/70",
    cardBg: "bg-[#FFF2EB] border border-[#FFE3D4]"
  },
  {
    id: "indigo",
    name: "Indigo Glow",
    background: "bg-slate-900",
    buttonStyle: "rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/30 font-medium",
    textColor: "text-white",
    bioColor: "text-slate-400",
    cardBg: "bg-slate-950 border border-slate-800"
  }
];

export interface LinkHubItem {
  id: string;
  title: string;
  description: string;
  destination_url: string;
  is_enabled: boolean;
  position: number;
  click_count?: number;
}

export interface LinkHubData {
  id: string;
  slug: string;
  display_name: string;
  bio: string;
  avatar_path: string | null;
  theme_config: {
    theme: string;
    background: string;
    button_style: string;
  };
  is_published: boolean;
}

// System Reserved Slugs to validate locally
const RESERVED_SLUGS = new Set([
  "landing", "customize", "history", "shortener", "qr", "preview", 
  "ogdebug", "utm", "api", "auth", "admin", "settings", "h", "s", 
  "public", "save", "redirect", "click", "assets", "static", "help", "hubs"
]);

// Helper to secure URLs
function validateUrlProtocol(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (err) {
    return false;
  }
}

// Safe formatting for URLs
function formatUrl(urlStr: string): string {
  let trimmed = urlStr.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = "https://" + trimmed;
  }
  return trimmed;
}


// ==========================================
// 1. PUBLIC VIEW COMPONENT (FOR /h/:slug)
// ==========================================
interface PublicLinkHubProps {
  slug: string;
}

export const PublicLinkHub: React.FC<PublicLinkHubProps> = ({ slug }) => {
  const [hub, setHub] = useState<LinkHubData | null>(null);
  const [items, setItems] = useState<LinkHubItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicHub = async () => {
      try {
        setLoading(true);
        // Add Bearer token from local storage if available so owners can preview drafts
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        const storedAuth = localStorage.getItem("sb-ais-dev-fhrypyy5a5uqhtxsyveiov-832675621924-auth-token");
        if (storedAuth) {
          try {
            const parsed = JSON.parse(storedAuth);
            if (parsed?.access_token) {
              headers["Authorization"] = `Bearer ${parsed.access_token}`;
            }
          } catch (_) {}
        }

        const res = await fetch(`/api/hubs/public/${encodeURIComponent(slug)}`, { headers });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Profile not found or draft mode restricted.");
        }
        
        const data = await res.json();
        setHub(data);
        setItems(data.items || []);
      } catch (err: any) {
        setError(err.message || "Failed to load Link Hub profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicHub();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 py-16 px-4 animate-pulse">
        <div className="w-full max-w-xl flex flex-col items-center text-center space-y-4">
          {/* Avatar Skeleton */}
          <div className="h-24 w-24 rounded-full bg-slate-200" />
          
          {/* Name & Bio Skeleton */}
          <div className="space-y-2 w-full flex flex-col items-center">
            <div className="h-6 bg-slate-200 rounded w-1/3" />
            <div className="h-4 bg-slate-200 rounded w-1/2" />
          </div>

          {/* Buttons Skeleton */}
          <div className="w-full space-y-4 pt-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 w-full rounded-xl bg-slate-200/80" />
            ))}
          </div>

          <div className="pt-6 flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-widest">
            <Loader className="h-4.5 w-4.5 animate-spin text-slate-400" />
            <span>Resolving Smyl Link Hub...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !hub) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="rounded-2xl bg-white p-8 max-w-md shadow-sm border border-slate-200">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-800">Profile Unavailable</h2>
          <p className="mt-2 text-slate-500 text-sm leading-relaxed">
            {error || "This custom Link Hub doesn't exist, is a draft, or was taken offline by its creator."}
          </p>
          <a
            href="/"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-800"
          >
            Create Your Own Hub
          </a>
        </div>
      </div>
    );
  }

  // Find matching active theme
  const selectedTheme = THEMES.find(t => t.id === hub.theme_config?.theme) || THEMES[0];

  return (
    <div className={`min-h-screen w-full flex flex-col items-center py-16 px-4 ${selectedTheme.background} transition-colors duration-300`}>
      <div className="w-full max-w-xl flex flex-col items-center text-center">
        {/* Avatar Profile */}
        <div className="relative mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-slate-200 shadow-sm border border-slate-200 overflow-hidden">
          {hub.avatar_path ? (
            <img 
              src={hub.avatar_path} 
              alt={hub.display_name} 
              className="h-full w-full object-cover" 
              referrerPolicy="no-referrer"
            />
          ) : (
            <User className="h-10 w-10 text-slate-400" />
          )}
        </div>

        {/* Name & Bio */}
        <h1 className={`text-2xl font-bold ${selectedTheme.textColor} mb-2`}>{hub.display_name}</h1>
        {hub.bio && (
          <p className={`text-sm max-w-sm mb-8 leading-relaxed font-medium ${selectedTheme.bioColor}`}>
            {hub.bio}
          </p>
        )}

        {/* Links Grid */}
        <div className="w-full space-y-4 mb-16">
          {items.length === 0 ? (
            <div className="rounded-2xl bg-white/40 border border-slate-200/40 p-10 text-center backdrop-blur-sm">
              <LinkIcon className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-2 text-slate-500 text-sm">No links published yet on this profile.</p>
            </div>
          ) : (
            items.map(item => (
              <a
                key={item.id}
                href={`/api/hubs/redirect/${item.id}`} // Resolves safely server-side for click count tracking and protocol checks
                target="_blank"
                rel="noopener noreferrer"
                className={`flex w-full items-center p-4 min-h-[64px] text-left leading-normal ${selectedTheme.buttonStyle}`}
              >
                <div className="flex-1 min-w-0 pr-4">
                  <span className="block font-semibold text-base truncate">{item.title}</span>
                  {item.description && (
                    <span className="block text-xs mt-1 font-normal opacity-80 truncate">{item.description}</span>
                  )}
                </div>
                <ExternalLink className="h-4 w-4 shrink-0 opacity-60" />
              </a>
            ))
          )}
        </div>

        {/* Smyl Footer Branding */}
        <a 
          href="/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 text-xs font-semibold px-4 py-2 rounded-full border border-slate-200 bg-white/70 shadow-sm hover:bg-white text-slate-600 transition-all hover:scale-105"
        >
          <span>Created with</span>
          <span className="text-brand-primary text-sm font-bold">Smyl</span>
        </a>
      </div>
    </div>
  );
};


// ==========================================
// 2. PRIMARY AUTHENTICATED EDITOR WORKSPACE
// ==========================================
interface LinkHubWorkspaceProps {
  token: string | null;
  onTriggerAuth: () => void;
}

export const LinkHubWorkspace: React.FC<LinkHubWorkspaceProps> = ({ token, onTriggerAuth }) => {
  // Hub state
  const [hubId, setHubId] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [avatarPath, setAvatarPath] = useState<string>("");
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [selectedThemeId, setSelectedThemeId] = useState<string>("light");

  // Items state
  const [items, setItems] = useState<LinkHubItem[]>([]);

  // Editor temporary link states
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkDesc, setLinkDesc] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  // System states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"synced" | "saving" | "unsaved" | "offline">("synced");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 1. Initial Load of Hub
  useEffect(() => {
    const loadHubData = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        // Fetch authenticated user's hubs
        let loaded = false;
        if (token) {
          try {
            const res = await fetch("/api/hubs", {
              headers: {
                "Authorization": `Bearer ${token}`
              }
            });
            if (res.ok) {
              const hubs = await res.json();
              if (hubs && hubs.length > 0) {
                const myHub = hubs[0]; // Fetch first hub
                setHubId(myHub.id);
                setSlug(myHub.slug);
                setDisplayName(myHub.display_name || "");
                setBio(myHub.bio || "");
                setAvatarPath(myHub.avatar_path || "");
                setIsPublished(myHub.is_published || false);
                setSelectedThemeId(myHub.theme_config?.theme || "light");
                setItems(myHub.items || []);
                loaded = true;
              }
            }
          } catch (err) {
            console.warn("Failed database link hubs retrieval, checking local fallback caches.", err);
          }
        }

        // Local Storage Cache fallback if offline or db unconfigured
        if (!loaded) {
          const cached = localStorage.getItem("smyl_local_link_hub");
          if (cached) {
            try {
              const myHub = JSON.parse(cached);
              setHubId(myHub.id || "");
              setSlug(myHub.slug || "");
              setDisplayName(myHub.display_name || "");
              setBio(myHub.bio || "");
              setAvatarPath(myHub.avatar_path || "");
              setIsPublished(myHub.is_published || false);
              setSelectedThemeId(myHub.theme_config?.theme || "light");
              setItems(myHub.items || []);
              setSyncStatus("unsaved");
            } catch (_) {}
          } else {
            // Generate blank initial state
            const randSlug = "hub-" + Math.random().toString(36).substring(2, 8);
            setSlug(randSlug);
            setDisplayName("");
            setBio("");
            setItems([]);
            setSyncStatus("unsaved");
          }
        }
      } catch (err: any) {
        setErrorMsg("Failed to initialize Link Hub panel.");
      } finally {
        setLoading(false);
      }
    };

    loadHubData();
  }, [token]);

  // 2. Keep local storage cached on changes
  useEffect(() => {
    if (loading) return;
    const cacheState = {
      id: hubId,
      slug,
      display_name: displayName,
      bio,
      avatar_path: avatarPath,
      theme_config: {
        theme: selectedThemeId,
        background: THEMES.find(t => t.id === selectedThemeId)?.background || THEMES[0].background,
        button_style: THEMES.find(t => t.id === selectedThemeId)?.buttonStyle || THEMES[0].buttonStyle
      },
      is_published: isPublished,
      items
    };
    localStorage.setItem("smyl_local_link_hub", JSON.stringify(cacheState));
  }, [hubId, slug, displayName, bio, avatarPath, selectedThemeId, isPublished, items, loading]);

  // 3. Trigger Save / Sync to Database
  const handleSaveHub = async (forcePublishState?: boolean) => {
    // Validate custom slug
    const cleanSlug = slug.trim().toLowerCase();
    if (cleanSlug.length < 3 || cleanSlug.length > 30) {
      setErrorMsg("Custom URL alias slug must be between 3 and 30 characters.");
      return;
    }
    if (!/^[a-z0-9-]+$/.test(cleanSlug)) {
      setErrorMsg("URL slug can only contain lowercase letters, numbers, and hyphens.");
      return;
    }
    if (RESERVED_SLUGS.has(cleanSlug)) {
      setErrorMsg("This slug is a reserved system route and cannot be used.");
      return;
    }

    // Validate URLs of all items
    for (const item of items) {
      if (!validateUrlProtocol(item.destination_url)) {
        setErrorMsg(`Invalid URL format for "${item.title}". Only http:// and https:// links are supported.`);
        return;
      }
    }

    try {
      setSaving(true);
      setSyncStatus("saving");
      setErrorMsg(null);
      setSuccessMsg(null);

      const targetPublish = forcePublishState !== undefined ? forcePublishState : isPublished;
      const themeInfo = THEMES.find(t => t.id === selectedThemeId) || THEMES[0];

      const payload = {
        hub: {
          id: hubId || undefined,
          slug: cleanSlug,
          display_name: displayName.trim() || cleanSlug,
          bio: bio.trim(),
          avatar_path: avatarPath.trim() || null,
          theme_config: {
            theme: selectedThemeId,
            background: themeInfo.background,
            button_style: themeInfo.buttonStyle
          },
          is_published: targetPublish
        },
        items: items.map((it, idx) => ({
          ...it,
          position: idx
        }))
      };

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/hubs/save", {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Server failed to save Link Hub.");
      }

      const responseData = await res.json();
      
      // Update ID states returned by server
      setHubId(responseData.id);
      if (responseData.items) {
        setItems(responseData.items);
      }
      setIsPublished(targetPublish);
      setSyncStatus("synced");
      setSuccessMsg(forcePublishState ? "Link Hub published live!" : "Draft changes saved successfully.");
    } catch (err: any) {
      console.error("Save error:", err);
      setErrorMsg(err.message || "Could not sync edits. Cached locally.");
      setSyncStatus("offline");
    } finally {
      setSaving(false);
    }
  };

  // 4. Link Item CRUD methods
  const handleOpenAddForm = () => {
    setEditingItemId(null);
    setLinkTitle("");
    setLinkDesc("");
    setLinkUrl("");
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (item: LinkHubItem) => {
    setEditingItemId(item.id);
    setLinkTitle(item.title);
    setLinkDesc(item.description);
    setLinkUrl(item.destination_url);
    setIsFormOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const titleClean = linkTitle.trim();
    if (!titleClean) {
      setErrorMsg("Link title is required.");
      return;
    }

    const formattedUrl = formatUrl(linkUrl);
    if (!validateUrlProtocol(formattedUrl)) {
      setErrorMsg("Link destination must be a valid http:// or https:// URL.");
      return;
    }

    if (editingItemId) {
      // Edit
      setItems(prev => prev.map(item => {
        if (item.id === editingItemId) {
          return {
            ...item,
            title: titleClean,
            description: linkDesc.trim(),
            destination_url: formattedUrl
          };
        }
        return item;
      }));
    } else {
      // Create new
      const newItem: LinkHubItem = {
        id: Math.random().toString(36).substring(2, 15),
        title: titleClean,
        description: linkDesc.trim(),
        destination_url: formattedUrl,
        is_enabled: true,
        position: items.length
      };
      setItems(prev => [...prev, newItem]);
    }

    // Reset Form
    setIsFormOpen(false);
    setEditingItemId(null);
    setLinkTitle("");
    setLinkDesc("");
    setLinkUrl("");
    setSyncStatus("unsaved");
  };

  const handleDeleteItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
    setSyncStatus("unsaved");
  };

  const handleToggleItemEnabled = (itemId: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, is_enabled: !item.is_enabled };
      }
      return item;
    }));
    setSyncStatus("unsaved");
  };

  const handleMoveItem = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === items.length - 1) return;

    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const reordered = [...items];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;

    // Reset correct positions
    const finalized = reordered.map((item, idx) => ({ ...item, position: idx }));
    setItems(finalized);
    setSyncStatus("unsaved");
  };

  const handleCopyPublicUrl = () => {
    const publicUrl = `${window.location.origin}/h/${slug}`;
    navigator.clipboard.writeText(publicUrl).then(() => {
      setSuccessMsg("Public Link Hub URL copied to clipboard!");
      setTimeout(() => setSuccessMsg(null), 3000);
    });
  };

  const selectedTheme = THEMES.find(t => t.id === selectedThemeId) || THEMES[0];

  if (!token) {
    return (
      <div className="mx-auto max-w-md p-6 sm:p-8 mt-12 bg-white rounded-2xl border border-[#E1E5E9] shadow-lg text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="mx-auto w-12 h-12 rounded-full bg-brand-soft/60 text-brand-primary flex items-center justify-center mb-4">
          <Lock className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-[#17191C] mb-2">Authentication Required</h2>
        <p className="text-sm text-[#626A73] mb-6 leading-relaxed">
          To build, customize, and publish your personal social landing page profile, you must be signed in with a Smyl account.
        </p>
        <button
          onClick={onTriggerAuth}
          className="w-full inline-flex items-center justify-center rounded-xl bg-brand-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary/90 cursor-pointer hover:shadow-md active:scale-[0.98]"
        >
          Sign In or Register Now
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-[#626A73]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      {/* Header and Sync Status Panel */}
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-[#E1E5E9] pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center space-x-2">
            <Compass className="h-6 w-6 text-brand-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-[#17191C]">Your Link Hub</h1>
          </div>
          <p className="mt-1 text-sm text-[#626A73]">Design a custom micro-landing page to share all your trackable socials in bio.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Sync Status Banner */}
          {syncStatus === "synced" && (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <Check className="mr-1 h-3.5 w-3.5" /> Changes synced to Cloud
            </span>
          )}
          {syncStatus === "unsaved" && (
            <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
              Unsaved draft changes
            </span>
          )}
          {syncStatus === "offline" && (
            <span className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 border border-rose-200">
              Offline Cache Mode
            </span>
          )}

          <button
            onClick={() => handleSaveHub(false)}
            disabled={saving}
            className="rounded-xl border border-[#D0D5DD] bg-white px-4 py-2.5 text-sm font-semibold text-[#344054] shadow-xs transition hover:bg-slate-50 disabled:opacity-50"
          >
            Save Draft
          </button>
          
          <button
            onClick={() => handleSaveHub(true)}
            disabled={saving}
            className="inline-flex items-center rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-brand-primary/90 disabled:opacity-50"
          >
            {saving ? "Publishing..." : "Publish Hub Live"}
          </button>
        </div>
      </div>

      {/* Notifications Bar */}
      {errorMsg && (
        <div className="mb-6 rounded-xl bg-rose-50 border border-rose-100 p-4 text-sm text-rose-800">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-sm text-emerald-800">
          {successMsg}
        </div>
      )}

      {/* Main 2-Column Editor + Live Preview Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Column 1: Config Panels (Span 7) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Section A: Profile */}
          <div className="rounded-2xl border border-[#E1E5E9] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#17191C] mb-4 flex items-center">
              <User className="mr-2 h-5 w-5 text-slate-500" />
              1. Profile Info
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#17191C] mb-1">Display Name</label>
                <input
                  type="text"
                  maxLength={50}
                  placeholder="e.g. Jane Doe"
                  value={displayName}
                  onChange={e => { setDisplayName(e.target.value); setSyncStatus("unsaved"); }}
                  className="w-full rounded-xl border border-[#D0D5DD] px-4 py-3 text-sm shadow-xs focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#17191C] mb-1">Bio Description</label>
                <textarea
                  rows={3}
                  maxLength={160}
                  placeholder="Share a short intro bio (max 160 characters)..."
                  value={bio}
                  onChange={e => { setBio(e.target.value); setSyncStatus("unsaved"); }}
                  className="w-full rounded-xl border border-[#D0D5DD] px-4 py-3 text-sm shadow-xs focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#17191C] mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or any static image link"
                  value={avatarPath}
                  onChange={e => { setAvatarPath(e.target.value); setSyncStatus("unsaved"); }}
                  className="w-full rounded-xl border border-[#D0D5DD] px-4 py-3 text-sm shadow-xs focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition"
                />
              </div>
            </div>
          </div>

          {/* Section B: Slug and Theme settings */}
          <div className="rounded-2xl border border-[#E1E5E9] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#17191C] mb-4 flex items-center">
              <Settings className="mr-2 h-5 w-5 text-slate-500" />
              2. Custom URL & Themes
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#17191C] mb-1">Custom Hub Alias Slug</label>
                <div className="flex rounded-xl shadow-xs">
                  <span className="inline-flex items-center rounded-l-xl border border-r-0 border-[#D0D5DD] bg-[#F8FAFC] px-3.5 text-sm font-medium text-slate-500 select-none">
                    smyl.link/h/
                  </span>
                  <input
                    type="text"
                    maxLength={30}
                    placeholder="your-brand-slug"
                    value={slug}
                    onChange={e => { setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-')); setSyncStatus("unsaved"); }}
                    className="block w-full min-w-0 flex-1 rounded-none rounded-r-xl border border-[#D0D5DD] px-4 py-3 text-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-400">Allowed: lowercase letters, numbers, hyphens. Min 3 chars.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#17191C] mb-3 flex items-center">
                  <Palette className="mr-1.5 h-4 w-4 text-slate-500" /> Choose Profile Palette Theme
                </label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {THEMES.map(theme => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => { setSelectedThemeId(theme.id); setSyncStatus("unsaved"); }}
                      className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                        selectedThemeId === theme.id 
                          ? "border-brand-primary ring-2 ring-brand-primary/10 bg-[#FAFAFE]" 
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-700">{theme.name}</span>
                      <div className="mt-2 flex space-x-1.5">
                        <div className={`h-4 w-4 rounded-full ${theme.background} border border-slate-200`}></div>
                        <div className="h-4 w-12 rounded bg-slate-300"></div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section C: Links items panel */}
          <div className="rounded-2xl border border-[#E1E5E9] bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#17191C] flex items-center">
                <LinkIcon className="mr-2 h-5 w-5 text-slate-500" />
                3. Manage Trackable Links
              </h2>
              <button
                type="button"
                onClick={handleOpenAddForm}
                className="inline-flex items-center space-x-1 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add New Link</span>
              </button>
            </div>

            {/* Form Drawer / Accordion inline */}
            {isFormOpen && (
              <form onSubmit={handleSaveItem} className="mb-6 rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 transition-all">
                <h3 className="text-sm font-bold text-slate-700 mb-3">
                  {editingItemId ? "Edit Link Configuration" : "Add Link Details"}
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Link Title *</label>
                    <input
                      type="text"
                      maxLength={80}
                      placeholder="e.g. Read My Latest Portfolio"
                      value={linkTitle}
                      onChange={e => setLinkTitle(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Sub-description (Optional)</label>
                    <input
                      type="text"
                      maxLength={140}
                      placeholder="Short descriptor text below link..."
                      value={linkDesc}
                      onChange={e => setLinkDesc(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Destination URL (HTTP/HTTPS) *</label>
                    <input
                      type="text"
                      placeholder="https://mywebsite.com/page"
                      value={linkUrl}
                      onChange={e => setLinkUrl(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* List of links */}
            <div className="space-y-3">
              {items.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-[#E1E5E9] py-10 text-center">
                  <LinkIcon className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-2 text-sm font-medium text-slate-500">No links registered yet.</p>
                  <p className="text-xs text-slate-400 mt-0.5">Click "Add New Link" above to build your list.</p>
                </div>
              ) : (
                items.map((item, index) => (
                  <div 
                    key={item.id} 
                    className={`flex items-center rounded-xl border p-4 bg-white transition-all shadow-sm ${
                      item.is_enabled ? "border-[#E1E5E9]" : "border-slate-100 opacity-60"
                    }`}
                  >
                    {/* Item Meta */}
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800 text-sm truncate">{item.title}</span>
                        {!item.is_enabled && (
                          <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                            Disabled
                          </span>
                        )}
                      </div>
                      <span className="block text-xs text-slate-400 truncate mt-0.5">{item.destination_url}</span>
                      
                      {/* Analytics Tracker */}
                      <span className="inline-block mt-1 text-[10px] font-bold text-brand-primary bg-brand-soft/40 px-2 py-0.5 rounded-full">
                        {item.click_count || 0} Click{(item.click_count || 0) === 1 ? "" : "s"}
                      </span>
                    </div>

                    {/* Quick position shift and settings */}
                    <div className="flex items-center space-x-1 shrink-0">
                      {/* Position Up */}
                      <button
                        type="button"
                        onClick={() => handleMoveItem(index, "up")}
                        disabled={index === 0}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 disabled:opacity-20"
                        title="Move Link Up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>

                      {/* Position Down */}
                      <button
                        type="button"
                        onClick={() => handleMoveItem(index, "down")}
                        disabled={index === items.length - 1}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 disabled:opacity-20"
                        title="Move Link Down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>

                      {/* Enable/Disable Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleItemEnabled(item.id)}
                        className={`rounded-lg p-1.5 ${
                          item.is_enabled ? "text-emerald-500 hover:bg-emerald-50" : "text-slate-300 hover:bg-slate-50"
                        }`}
                        title={item.is_enabled ? "Disable Link" : "Enable Link"}
                      >
                        <Power className="h-4 w-4" />
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditForm(item)}
                        className="rounded-lg p-1.5 text-blue-500 hover:bg-blue-50"
                        title="Edit Details"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50"
                        title="Delete Link"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Column 2: Live Phone Mockup Preview (Span 5) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="sticky top-6 w-full max-w-[340px]">
            <span className="block text-center text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Live Mockup Preview
            </span>

            {/* Smart Phone Shell Frame */}
            <div className="relative mx-auto h-[600px] w-full rounded-[40px] border-[10px] border-slate-900 bg-slate-950 p-2 shadow-2xl overflow-hidden ring-4 ring-slate-800">
              {/* Speaker pill notch */}
              <div className="absolute top-2 left-1/2 z-20 h-4 w-20 -translate-x-1/2 rounded-full bg-slate-900 flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-slate-800"></div>
              </div>

              {/* Internal Screen Content Container */}
              <div className={`h-full w-full rounded-[30px] p-4 flex flex-col items-center justify-between overflow-y-auto ${selectedTheme.background} transition-all duration-300 pt-8 pb-4`}>
                <div className="w-full flex flex-col items-center text-center">
                  {/* Mock Profile Avatar */}
                  <div className="relative mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 border border-slate-200 shadow-sm overflow-hidden shrink-0">
                    {avatarPath ? (
                      <img 
                        src={avatarPath} 
                        alt="Profile" 
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <User className="h-6 w-6 text-slate-400" />
                    )}
                  </div>

                  {/* Mock Name & Bio */}
                  <h3 className={`font-bold text-sm leading-tight tracking-tight max-w-[180px] truncate ${selectedTheme.textColor}`}>
                    {displayName.trim() || slug || "Your Name"}
                  </h3>
                  
                  <p className={`text-[10px] mt-1 max-w-[180px] line-clamp-3 leading-relaxed font-medium ${selectedTheme.bioColor}`}>
                    {bio.trim() || "Add display bio details..."}
                  </p>

                  {/* Mock Items list */}
                  <div className="mt-6 w-full space-y-2.5">
                    {items.filter(it => it.is_enabled).length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center bg-white/20">
                        <span className="block text-[10px] font-semibold text-slate-400">Your enabled links appear here</span>
                      </div>
                    ) : (
                      items.filter(it => it.is_enabled).map(item => (
                        <div
                          key={item.id}
                          className={`w-full p-2.5 flex items-center min-h-[44px] text-xs font-semibold text-center select-none ${selectedTheme.buttonStyle}`}
                        >
                          <div className="w-full text-center">
                            <span className="block font-bold text-[11px] truncate">{item.title}</span>
                            {item.description && (
                              <span className="block text-[8px] font-normal opacity-85 truncate leading-none mt-0.5">
                                {item.description}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Footer Smyl Badge */}
                <div className="mt-8 flex items-center justify-center">
                  <span className="inline-flex items-center space-x-1 rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 text-[8px] font-bold text-slate-500">
                    <span>Powered by</span>
                    <span className="text-brand-primary text-[9px] font-extrabold">Smyl</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Hub Quick Actions */}
            <div className="mt-4 flex flex-col space-y-2 bg-slate-50 border border-slate-200 p-3.5 rounded-2xl shadow-xs">
              <span className="block text-[10px] font-bold text-slate-400 tracking-wider">
                Hub Configuration Status
              </span>
              <div className="flex items-center justify-between text-xs font-bold text-[#17191C]">
                <span>Status:</span>
                <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold ${
                  isPublished 
                    ? "bg-emerald-50 text-emerald-700" 
                    : "bg-slate-100 text-slate-600"
                }`}>
                  {isPublished ? "Published Live" : "Unpublished Draft"}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyPublicUrl}
                className="w-full inline-flex items-center justify-center space-x-1.5 rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50"
              >
                <Share2 className="h-3.5 w-3.5 text-slate-500" />
                <span>Copy Shareable URL</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
