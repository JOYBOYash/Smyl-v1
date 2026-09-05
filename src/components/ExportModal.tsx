import React, { useState } from "react";
import {
  IoClose,
  IoDownload,
  IoShareSocial,
  IoBookmark,
  IoCheckmark,
  IoRefresh,
  IoGlobe,
  IoCopy,
} from "react-icons/io5";
import { ParsedPost } from "../types";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadPng: () => Promise<void>;
  isDownloading: boolean;
  onShareUrl: () => void;
  onSaveTemplate: (name: string) => void;
  onResetDefault: () => void;
  initialTemplateName?: string;
  post?: ParsedPost;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onDownloadPng,
  isDownloading,
  onShareUrl,
  onSaveTemplate,
  onResetDefault,
  initialTemplateName = "",
  post,
}) => {
  const [templateName, setTemplateName] = useState(initialTemplateName);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [socialPlatform, setSocialPlatform] = useState<"linkedin" | "x">("linkedin");
  const [copiedTags, setCopiedTags] = useState(false);

  if (!isOpen) return null;

  const handleShare = () => {
    onShareUrl();
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim()) return;
    onSaveTemplate(templateName.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Generate metadata strings based on card state
  const cleanTitle = post?.author?.name ? `${post.author.name} on ${post.platform === 'linkedin' ? 'LinkedIn' : 'X'}` : "Social Post Card";
  const rawText = post?.content?.text || "Turn your post links into branded visual cards with Smyl.";
  const cleanDescription = rawText.length > 140 ? `${rawText.slice(0, 137)}...` : rawText;
  const simulatedUrl = window.location.href.split("?")[0];

  const handleCopyMetaTags = () => {
    const metaTags = socialPlatform === "linkedin"
      ? `<!-- Open Graph / LinkedIn Preview Metadata -->
<meta property="og:type" content="article" />
<meta property="og:title" content="${cleanTitle.replace(/"/g, '&quot;')}" />
<meta property="og:description" content="${cleanDescription.replace(/"/g, '&quot;')}" />
<meta property="og:url" content="${simulatedUrl}" />
<meta property="og:image" content="${post?.author?.avatarUrl || `${simulatedUrl}/og-card.png`}" />`
      : `<!-- Twitter / X Card Preview Metadata -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${cleanTitle.replace(/"/g, '&quot;')}" />
<meta name="twitter:description" content="${cleanDescription.replace(/"/g, '&quot;')}" />
<meta name="twitter:image" content="${post?.author?.avatarUrl || `${simulatedUrl}/twitter-card.png`}" />`;

    navigator.clipboard.writeText(metaTags);
    setCopiedTags(true);
    setTimeout(() => setCopiedTags(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-2xl border border-[#E1E5E9] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#ECEEF1] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-soft text-brand-primary flex items-center justify-center text-lg">
              <IoShareSocial className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#17191C] text-base">Export & Share</h3>
              <p className="text-xs text-[#626A73]">Download 2x PNG or share layout link</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-[#626A73] hover:bg-[#F5F7F9] hover:text-[#17191C] flex items-center justify-center transition-colors cursor-pointer"
          >
            <IoClose className="w-5 h-5" />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Main Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onDownloadPng}
              disabled={isDownloading}
              className="h-10 px-4 rounded-lg bg-brand-primary text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-brand-hover active:bg-brand-pressed transition-all disabled:opacity-60 cursor-pointer shadow-sm"
            >
              <IoDownload className="w-5 h-5" />
              <span>{isDownloading ? "Exporting..." : "Download PNG"}</span>
            </button>

            <button
              onClick={handleShare}
              className="h-10 px-4 rounded-lg bg-white border border-[#E1E5E9] text-[#17191C] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#F5F7F9] hover:border-[#B9C0C8] active:bg-[#EEF1F4] transition-all cursor-pointer"
            >
              {copiedSuccess ? (
                <>
                  <IoCheckmark className="w-5 h-5 text-emerald-600" />
                  <span className="text-emerald-600">Copied Link!</span>
                </>
              ) : (
                <>
                  <IoShareSocial className="w-5 h-5 text-brand-primary" />
                  <span>Share URL</span>
                </>
              )}
            </button>
          </div>

          {/* SOCIAL PREVIEW METADATA SECTION */}
          <div className="bg-[#F8FAFC] border border-[#E1E5E9] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <IoGlobe className="w-4 h-4 text-brand-primary" />
                <span className="text-xs font-bold text-[#17191C]">Social Link Preview</span>
              </div>
              
              {/* Platform Switcher */}
              <div className="flex items-center bg-[#EDF1F5] p-0.5 rounded-lg text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setSocialPlatform("linkedin")}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    socialPlatform === "linkedin"
                      ? "bg-white text-brand-primary shadow-2xs font-bold"
                      : "text-[#626A73] hover:text-[#17191C]"
                  }`}
                >
                  LinkedIn
                </button>
                <button
                  type="button"
                  onClick={() => setSocialPlatform("x")}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    socialPlatform === "x"
                      ? "bg-white text-brand-primary shadow-2xs font-bold"
                      : "text-[#626A73] hover:text-[#17191C]"
                  }`}
                >
                  X / Twitter
                </button>
              </div>
            </div>

            {/* Visual Social Card Mockup */}
            <div className="bg-white border border-[#D0D7DE] rounded-xl overflow-hidden shadow-2xs text-left">
              <div className="h-28 bg-[#111418] relative flex items-center justify-center p-3 text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/25 via-[#111418] to-purple-950/40" />
                <div className="relative z-10 space-y-1">
                  <p className="text-xs font-bold text-white tracking-tight line-clamp-1">{cleanTitle}</p>
                  <p className="text-[11px] text-zinc-300 line-clamp-2 px-2 italic font-sans">
                    "{rawText}"
                  </p>
                </div>
              </div>
              <div className="p-3 bg-white space-y-1">
                <span className="text-[10px] font-semibold text-[#8D959F] uppercase tracking-wider block">
                  {simulatedUrl.replace(/^https?:\/\//, '')}
                </span>
                <p className="text-xs font-bold text-[#17191C] leading-snug truncate">
                  {cleanTitle}
                </p>
                <p className="text-[11px] text-[#626A73] line-clamp-2 leading-relaxed">
                  {cleanDescription}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-[10px] text-[#8D959F] italic">
                *Simulated {socialPlatform === "linkedin" ? "Open Graph" : "Twitter Card"} link representation
              </p>
              <button
                type="button"
                onClick={handleCopyMetaTags}
                className="text-[11px] font-semibold text-brand-primary hover:text-brand-hover flex items-center gap-1 cursor-pointer"
              >
                {copiedTags ? (
                  <>
                    <IoCheckmark className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied tags!</span>
                  </>
                ) : (
                  <>
                    <IoCopy className="w-3.5 h-3.5" />
                    <span>Copy HTML Meta Tags</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#ECEEF1]"></div>
            <span className="flex-shrink mx-3 text-[11px] font-bold text-[#8D959F] uppercase tracking-wider">
              Save Template
            </span>
            <div className="flex-grow border-t border-[#ECEEF1]"></div>
          </div>

          {/* Save to Local History Form */}
          <form onSubmit={handleSave} className="flex gap-2">
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Name this layout template..."
              className="flex-1 h-10 px-3 text-xs rounded-lg border border-[#E1E5E9] bg-white text-[#17191C] placeholder-[#8D959F] focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
            />
            <button
              type="submit"
              className="h-10 px-4 rounded-lg bg-[#F5F7F9] border border-[#E1E5E9] text-[#17191C] font-semibold text-xs flex items-center gap-1.5 hover:bg-[#EEF1F4] hover:border-[#B9C0C8] transition-all cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <IoCheckmark className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-600">Saved</span>
                </>
              ) : (
                <>
                  <IoBookmark className="w-4 h-4 text-brand-primary" />
                  <span>Save</span>
                </>
              )}
            </button>
          </form>

          {/* Reset Action */}
          <div className="pt-1 flex justify-center">
            <button
              type="button"
              onClick={() => {
                onResetDefault();
                onClose();
              }}
              className="text-xs text-[#626A73] hover:text-brand-primary flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <IoRefresh className="w-4 h-4" />
              <span>Reset to default template</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
