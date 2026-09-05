import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ParsedPost, CardCustomization } from "../types";
import {
  IoLogoLinkedin,
  IoLogoTwitter,
  IoCheckmarkCircle,
  IoGlobeOutline,
} from "react-icons/io5";
import {
  MessageCircle,
  Repeat2,
  Heart,
  BarChart2,
  ThumbsUp,
  MessageSquare,
  Repeat,
  Send,
  Sparkles,
  Lightbulb,
  Hash,
} from "lucide-react";

interface PostCardProps {
  post: ParsedPost;
  customization: CardCustomization;
  onUpdatePost?: (updated: Partial<ParsedPost>) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, customization, onUpdatePost }) => {
  const {
    theme,
    platform,
    isEditable,
    borderRadius,
    shadowSize,
    showEngagement,
    showPlatformIcon,
    showHashtagCloud = false,
    fontFamily,
    orientation,
    textAlign = "left",
    fontSize = 15,
  } = customization;

  const updateAuthor = (fields: Partial<typeof post.author>) => {
    if (onUpdatePost) {
      onUpdatePost({
        author: { ...post.author, ...fields },
      });
    }
  };

  const updateContent = (text: string) => {
    if (onUpdatePost) {
      onUpdatePost({
        content: { ...post.content, text },
      });
    }
  };

  const updateEngagement = (fields: Partial<typeof post.engagement>) => {
    if (onUpdatePost) {
      onUpdatePost({
        engagement: { ...post.engagement, ...fields },
      });
    }
  };

  const getBorderRadiusClass = () => {
    switch (borderRadius) {
      case "none":
        return "rounded-none";
      case "sm":
        return "rounded-lg";
      case "md":
        return "rounded-xl";
      case "xl":
        return "rounded-3xl";
      case "lg":
      default:
        return "rounded-2xl";
    }
  };

  const getFontFamilyClass = () => {
    switch (fontFamily) {
      case "inter":
        return "font-card-inter";
      case "roboto":
        return "font-card-roboto";
      case "display":
        return "font-card-display";
      case "outfit":
        return "font-card-outfit";
      case "poppins":
        return "font-card-poppins";
      case "montserrat":
        return "font-card-montserrat";
      case "space":
        return "font-card-space";
      case "serif":
        return "font-card-serif";
      case "playfair":
        return "font-card-playfair";
      case "mono":
        return "font-card-mono";
      case "fira":
        return "font-card-fira";
      case "sans":
      default:
        return "font-card-sans";
    }
  };

  const getOrientationClass = () => {
    switch (orientation) {
      case "landscape":
        return "w-full max-w-[620px] min-h-[220px]";
      case "portrait":
        return "w-full max-w-[420px] min-h-[420px]";
      case "square":
        return "w-full max-w-[460px] aspect-square flex flex-col justify-between";
      case "auto":
      default:
        return "w-full max-w-[540px] h-fit";
    }
  };

  const getTextAlignClass = () => {
    switch (textAlign) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      case "left":
      default:
        return "text-left";
    }
  };

  // Modern ultra-soft smooth shadows without harshness
  const getShadowClass = () => {
    switch (shadowSize) {
      case "none":
        return "shadow-none";
      case "sm":
        return "shadow-[0_2px_8px_rgba(0,0,0,0.04)]";
      case "lg":
        return "shadow-[0_12px_28px_rgba(0,0,0,0.07)]";
      case "md":
      default:
        return "shadow-[0_6px_18px_rgba(0,0,0,0.05)]";
    }
  };

  // Theme color definitions: distinct Light vs. Dark vs. Holographic Retro
  const themeStyles = {
    light: {
      cardBg: "bg-white border-[#E1E5E9] text-[#17191C]",
      textPrimary: "text-[#17191C]",
      textSecondary: "text-[#626A73]",
      textMuted: "text-[#8D959F]",
      borderDivider: "border-[#ECEEF1]",
      hoverBg: "hover:bg-[#F5F7F9]",
      badgeBg: "bg-[#F5F7F9] text-[#626A73]",
      mentionColor: "text-[#0145F2]",
      metricsColor: "text-[#626A73]",
      platformIcon: "text-[#1D9BF0]",
      inputBg: "bg-transparent focus:bg-[#F5F7F9]",
      metricInputBg: "bg-[#F5F7F9] text-[#17191C] border-[#E1E5E9]",
    },
    dark: {
      cardBg: "bg-[#0A0D12] border-[#272C35] text-[#FFFFFF]",
      textPrimary: "text-[#FFFFFF]",
      textSecondary: "text-[#71767B]",
      textMuted: "text-[#536471]",
      borderDivider: "border-[#272C35]",
      hoverBg: "hover:bg-[#16181C]",
      badgeBg: "bg-[#16181C] text-[#71767B]",
      mentionColor: "text-[#38BDF8]",
      metricsColor: "text-[#71767B]",
      platformIcon: "text-[#1D9BF0]",
      inputBg: "bg-transparent focus:bg-[#16181C]",
      metricInputBg: "bg-[#16181C] text-white border-[#272C35]",
    },
    retro: {
      cardBg:
        "relative overflow-hidden bg-gradient-to-br from-[#0B0F19]/95 via-[#131926]/95 to-[#090D14]/95 border border-transparent shadow-[0_16px_36px_rgba(0,0,0,0.5),0_0_24px_rgba(59,130,246,0.2)] before:absolute before:inset-0 before:rounded-[inherit] before:p-[1.5px] before:bg-gradient-to-br before:from-[#FF2A85] before:via-[#00F0FF] before:via-30% before:via-[#9D4EDD] before:via-65% before:to-[#FFD000] before:-z-10 before:content-[''] after:absolute after:inset-0 after:bg-[radial-gradient(ellipse_75%_60%_at_50%_-15%,rgba(147,197,253,0.18),transparent)] after:pointer-events-none text-white",
      textPrimary: "text-white font-medium",
      textSecondary: "text-[#94A3B8]",
      textMuted: "text-[#64748B]",
      borderDivider: "border-white/10",
      hoverBg: "hover:bg-white/5",
      badgeBg: "bg-white/10 text-cyan-200 border border-white/10",
      mentionColor: "text-cyan-300 font-semibold drop-shadow-[0_0_8px_rgba(6,182,212,0.35)]",
      metricsColor: "text-[#94A3B8]",
      platformIcon: "text-[#1D9BF0] drop-shadow-[0_0_8px_rgba(29,155,240,0.5)]",
      inputBg: "bg-white/5 focus:bg-white/10 text-white",
      metricInputBg: "bg-white/10 text-white border-white/20",
    },
  };

  // Extract hashtags from post content or explicit hashtags array
  const extractedHashtags = React.useMemo(() => {
    const fromTags = post.content.hashtags || [];
    const textMatches = (post.content.text.match(/#[a-zA-Z0-9_\u0080-\uFFFF]+/g) || []).map((t) =>
      t.replace(/^#/, "")
    );
    const combined = Array.from(new Set([...fromTags, ...textMatches])).filter(Boolean);
    if (combined.length > 0) return combined;
    return ["buildinpublic", "design", "saas"];
  }, [post.content.hashtags, post.content.text]);

  const getHashtagBadgeStyle = () => {
    switch (theme) {
      case "dark":
        return "bg-[#1E293B] text-[#60A5FA] border border-[#334155]";
      case "retro":
        return "bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]";
      case "light":
      default:
        return "bg-[#EDF1F5] text-brand-primary border border-[#D0D7DE]/70";
    }
  };

  const sc = themeStyles[theme] || themeStyles.light;

  // Auto-resizing textarea ref to prevent shrinking or scrollbars in edit mode
  const xContentRef = React.useRef<HTMLTextAreaElement>(null);
  const liContentRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (xContentRef.current) {
      xContentRef.current.style.height = "auto";
      xContentRef.current.style.height = `${xContentRef.current.scrollHeight}px`;
    }
    if (liContentRef.current) {
      liContentRef.current.style.height = "auto";
      liContentRef.current.style.height = `${liContentRef.current.scrollHeight}px`;
    }
  }, [post.content.text, isEditable, platform, fontSize]);

  // Helper formatting for counts
  const formatCount = (num?: number): string => {
    if (!num && num !== 0) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
  };

  // Helper to format text with highlights (stripping hashtags if hashtag cloud is shown)
  const renderFormattedText = (rawText: string) => {
    let textToProcess = rawText;
    if (showHashtagCloud) {
      // Strip hashtags from the body text when the hashtag cloud badges are visible
      textToProcess = textToProcess
        .split("\n")
        .map((line) =>
          line
            .replace(/#[a-zA-Z0-9_\u0080-\uFFFF]+/g, "")
            .replace(/\s+/g, " ")
            .trim()
        )
        .filter((line, idx, arr) => line.length > 0 || (idx > 0 && idx < arr.length - 1))
        .join("\n")
        .trim();

      if (!textToProcess) {
        textToProcess = rawText.replace(/#[a-zA-Z0-9_\u0080-\uFFFF]+/g, "").trim();
      }
    }

    const lines = textToProcess.split("\n");
    return lines.map((line, lIdx) => {
      const words = line.split(" ");
      return (
        <p key={lIdx} className="min-h-[1.25em] m-0 p-0">
          {words.map((word, wIdx) => {
            const isTagOrMention =
              word.startsWith("#") ||
              word.startsWith("@") ||
              word.startsWith("http://") ||
              word.startsWith("https://");

            return (
              <span
                key={wIdx}
                className={isTagOrMention ? `${sc.mentionColor} font-medium` : undefined}
              >
                {word}{" "}
              </span>
            );
          })}
        </p>
      );
    });
  };

  // Render X-Style card layout
  const renderXLayout = () => {
    return (
      <div
        key="x-layout"
        className={`p-6 sm:p-7 text-left transition-colors duration-150 ${sc.cardBg} ${getFontFamilyClass()} ${getBorderRadiusClass()} ${getShadowClass()} border relative ${getOrientationClass()} mx-auto flex flex-col justify-between select-text`}
      >
        {/* Holographic light streak reflection for Retro theme */}
        {theme === "retro" && (
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-cyan-400/10 via-pink-500/10 to-transparent rounded-full blur-2xl pointer-events-none -z-0" />
        )}

        <div className="relative z-10">
          {/* Top bar with Author detail and Platform Icon aligned with author row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {post.author.avatarUrl ? (
                  <img
                    src={post.author.avatarUrl}
                    alt={post.author.name}
                    className="w-11 h-11 rounded-full object-cover border border-black/10"
                  />
                ) : (
                  <div
                    style={{ backgroundColor: post.author.avatarColor || "#0145F2" }}
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm"
                  >
                    {post.author.avatarText || "AR"}
                  </div>
                )}
              </div>

              {/* Author Name and Username */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 leading-tight flex-wrap">
                  {isEditable ? (
                    <input
                      type="text"
                      value={post.author.name}
                      onChange={(e) => updateAuthor({ name: e.target.value })}
                      className={`font-bold text-sm sm:text-base ${sc.textPrimary} border-b border-dashed border-[#B9C0C8] focus:outline-none focus:border-brand-primary ${sc.inputBg} rounded px-1 -mx-1 w-auto max-w-[200px]`}
                    />
                  ) : (
                    <span className={`font-bold text-sm sm:text-base ${sc.textPrimary} truncate`}>
                      {post.author.name}
                    </span>
                  )}

                  {post.author.isVerified && (
                    <IoCheckmarkCircle className="w-4 h-4 text-[#1D9BF0] flex-shrink-0" />
                  )}
                </div>

                <div className="text-xs text-left leading-tight mt-0.5">
                  {isEditable ? (
                    <input
                      type="text"
                      value={post.author.username}
                      onChange={(e) => updateAuthor({ username: e.target.value })}
                      className={`${sc.textSecondary} text-xs border-b border-dashed border-[#B9C0C8] focus:outline-none focus:border-brand-primary ${sc.inputBg} rounded px-1 -mx-1 w-auto max-w-[200px]`}
                    />
                  ) : (
                    <span className={`${sc.textSecondary} truncate block`}>
                      {post.author.username.startsWith("@") ? post.author.username : `@${post.author.username}`}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {showPlatformIcon && (
              <div className="flex-shrink-0 self-start mt-0.5">
                <IoLogoTwitter className={`w-5 h-5 ${sc.platformIcon}`} />
              </div>
            )}
          </div>

          {/* Post Text Content - exact matching metrics to eliminate jump on edit mode */}
          <div
            className={`mt-5 leading-relaxed break-words font-normal ${getTextAlignClass()}`}
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.55 }}
          >
            {isEditable ? (
              <textarea
                ref={xContentRef}
                rows={1}
                maxLength={500}
                value={post.content.text}
                onChange={(e) => {
                  updateContent(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                className={`w-full p-0 m-0 border-0 border-b border-dashed border-[#B9C0C8]/80 focus:border-brand-primary focus:outline-none ${sc.textPrimary} bg-transparent resize-none overflow-hidden block transition-none ${getTextAlignClass()}`}
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: 1.55,
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
                placeholder="Type your post content..."
              />
            ) : (
              <div>{renderFormattedText(post.content.text)}</div>
            )}
          </div>
          {/* Hashtag Cloud Badges */}
          {showHashtagCloud && extractedHashtags.length > 0 && (
            <div className={`mt-4 flex flex-wrap gap-1.5 ${getTextAlignClass() === "text-center" ? "justify-center" : getTextAlignClass() === "text-right" ? "justify-end" : "justify-start"}`}>
              {extractedHashtags.map((tag, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${getHashtagBadgeStyle()} shadow-2xs select-none`}
                >
                  <Hash className="w-2.5 h-2.5 opacity-70" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Section: Timestamp & Engagement */}
        <div className="mt-6 relative z-10">
          {/* Timestamp */}
          <div className="pt-3.5 border-t border-dashed border-[#ECEEF1]/30 text-[12px] flex items-center justify-between text-[#8D959F]">
            {isEditable ? (
              <input
                type="text"
                value={post.timestamp}
                onChange={(e) => onUpdatePost?.({ timestamp: e.target.value })}
                className={`text-[12px] text-[#8D959F] border-b border-dashed border-[#B9C0C8] ${sc.inputBg} focus:outline-none px-1 rounded max-w-[180px]`}
              />
            ) : (
              <span>{post.timestamp || "9:41 AM · Aug 24, 2026"}</span>
            )}
          </div>

          {/* Metrics Bar with modern Lucide icons */}
          {showEngagement && (
            <div className={`mt-3 pt-3 border-t ${sc.borderDivider} flex items-center justify-between text-xs ${sc.metricsColor}`}>
              {/* Comments */}
              <div className="flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 flex-shrink-0 opacity-80 stroke-[2]" />
                {isEditable ? (
                  <input
                    type="number"
                    value={post.engagement.comments || 0}
                    onChange={(e) => updateEngagement({ comments: parseInt(e.target.value) || 0 })}
                    className={`w-14 px-1.5 py-0.5 text-xs rounded border ${sc.metricInputBg} focus:outline-none focus:border-brand-primary text-left font-medium`}
                    title="Edit comments count"
                  />
                ) : (
                  <span>{formatCount(post.engagement.comments)}</span>
                )}
              </div>

              {/* Reposts */}
              <div className="flex items-center gap-1.5">
                <Repeat2 className="w-3.5 h-3.5 flex-shrink-0 opacity-80 stroke-[2]" />
                {isEditable ? (
                  <input
                    type="number"
                    value={post.engagement.reposts || 0}
                    onChange={(e) => updateEngagement({ reposts: parseInt(e.target.value) || 0 })}
                    className={`w-14 px-1.5 py-0.5 text-xs rounded border ${sc.metricInputBg} focus:outline-none focus:border-brand-primary text-left font-medium`}
                    title="Edit reposts count"
                  />
                ) : (
                  <span>{formatCount(post.engagement.reposts)}</span>
                )}
              </div>

              {/* Likes */}
              <div className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 flex-shrink-0 opacity-80 stroke-[2]" />
                {isEditable ? (
                  <input
                    type="number"
                    value={post.engagement.likes || 0}
                    onChange={(e) => updateEngagement({ likes: parseInt(e.target.value) || 0 })}
                    className={`w-14 px-1.5 py-0.5 text-xs rounded border ${sc.metricInputBg} focus:outline-none focus:border-brand-primary text-left font-medium`}
                    title="Edit likes count"
                  />
                ) : (
                  <span>{formatCount(post.engagement.likes)}</span>
                )}
              </div>

              {/* Views */}
              {(post.engagement.views !== undefined || isEditable) && (
                <div className="flex items-center gap-1.5">
                  <BarChart2 className="w-3.5 h-3.5 flex-shrink-0 opacity-80 stroke-[2]" />
                  {isEditable ? (
                    <input
                      type="number"
                      value={post.engagement.views || 0}
                      onChange={(e) => updateEngagement({ views: parseInt(e.target.value) || 0 })}
                      className={`w-16 px-1.5 py-0.5 text-xs rounded border ${sc.metricInputBg} focus:outline-none focus:border-brand-primary text-left font-medium`}
                      title="Edit views count"
                    />
                  ) : (
                    <span>{formatCount(post.engagement.views)}</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render LinkedIn-Style card layout
  const renderLinkedInLayout = () => {
    return (
      <div
        key="linkedin-layout"
        className={`p-6 sm:p-7 text-left transition-colors duration-150 ${sc.cardBg} ${getFontFamilyClass()} ${getBorderRadiusClass()} ${getShadowClass()} border relative flex flex-col justify-between gap-4 ${getOrientationClass()} mx-auto select-text`}
      >
        {/* Holographic light streak reflection for Retro theme */}
        {theme === "retro" && (
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-cyan-400/10 via-pink-500/10 to-transparent rounded-full blur-2xl pointer-events-none -z-0" />
        )}

        <div className="relative z-10">
          {/* Top bar with Author detail and Platform Icon aligned with author header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {post.author.avatarUrl ? (
                  <img
                    src={post.author.avatarUrl}
                    alt={post.author.name}
                    className="w-12 h-12 rounded-full object-cover border border-black/10"
                  />
                ) : (
                  <div
                    style={{ backgroundColor: post.author.avatarColor || "#0077B5" }}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base shadow-sm"
                  >
                    {post.author.avatarText || "LI"}
                  </div>
                )}
              </div>

              {/* Author Name and LinkedIn Headline */}
              <div className="min-w-0 flex-1 pr-1">
                <div className="flex items-center gap-1 leading-tight flex-wrap">
                  {isEditable ? (
                    <input
                      type="text"
                      value={post.author.name}
                      onChange={(e) => updateAuthor({ name: e.target.value })}
                      className={`font-bold text-sm sm:text-base ${sc.textPrimary} border-b border-dashed border-[#B9C0C8] focus:outline-none focus:border-brand-primary w-auto max-w-[200px] ${sc.inputBg} rounded px-1 -mx-1`}
                    />
                  ) : (
                    <span className={`font-bold text-sm sm:text-base ${sc.textPrimary} truncate`}>
                      {post.author.name}
                    </span>
                  )}
                  {post.author.isVerified && (
                    <IoCheckmarkCircle className="w-3.5 h-3.5 text-[#0A66C2] flex-shrink-0" />
                  )}
                  <span className="text-[11px] text-[#8D959F] font-normal">• 1st</span>
                </div>

                <div className="text-[11px] sm:text-xs text-left leading-snug mt-0.5">
                  {isEditable ? (
                    <input
                      type="text"
                      value={post.author.username}
                      onChange={(e) => updateAuthor({ username: e.target.value })}
                      className={`${sc.textSecondary} text-xs border-b border-dashed border-[#B9C0C8] focus:outline-none focus:border-brand-primary w-full max-w-[240px] ${sc.inputBg} rounded px-1 -mx-1`}
                    />
                  ) : (
                    <span className={`${sc.textSecondary} line-clamp-1 block text-xs`}>
                      {post.author.username}
                    </span>
                  )}
                </div>

                <div className="text-[10px] sm:text-[11px] text-[#8D959F] mt-1 flex items-center gap-1.5">
                  {isEditable ? (
                    <input
                      type="text"
                      value={post.timestamp}
                      onChange={(e) => onUpdatePost?.({ timestamp: e.target.value })}
                      className={`text-[11px] text-[#8D959F] border-b border-dashed border-[#B9C0C8] ${sc.inputBg} focus:outline-none px-1 rounded max-w-[90px]`}
                    />
                  ) : (
                    <span>{post.timestamp || "3h ago"}</span>
                  )}
                  <span>•</span>
                  <IoGlobeOutline className="w-3 h-3 text-[#8D959F]" />
                </div>
              </div>
            </div>

            {showPlatformIcon && (
              <div className="flex-shrink-0 self-start mt-0.5">
                <IoLogoLinkedin className="w-6 h-6 text-[#0A66C2]" />
              </div>
            )}
          </div>

          {/* Post Text Body - dynamically styled by textAlign & base fontSize */}
          <div
            className={`mt-5 leading-relaxed break-words font-normal ${getTextAlignClass()}`}
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.55 }}
          >
            {isEditable ? (
              <textarea
                ref={liContentRef}
                rows={1}
                maxLength={500}
                value={post.content.text}
                onChange={(e) => {
                  updateContent(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                className={`w-full p-0 m-0 border-0 border-b border-dashed border-[#B9C0C8]/80 focus:border-brand-primary focus:outline-none ${sc.textPrimary} bg-transparent resize-none overflow-hidden block transition-none ${getTextAlignClass()}`}
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: 1.55,
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
                placeholder="Type your post content..."
              />
            ) : (
              <div>{renderFormattedText(post.content.text)}</div>
            )}
          </div>
          {/* Hashtag Cloud Badges */}
          {showHashtagCloud && extractedHashtags.length > 0 && (
            <div className={`mt-4 flex flex-wrap gap-1.5 ${getTextAlignClass() === "text-center" ? "justify-center" : getTextAlignClass() === "text-right" ? "justify-end" : "justify-start"}`}>
              {extractedHashtags.map((tag, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${getHashtagBadgeStyle()} shadow-2xs select-none`}
                >
                  <Hash className="w-2.5 h-2.5 opacity-70" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Section: LinkedIn Engagement Bar */}
        {showEngagement && (
          <div className="space-y-3 pt-2 relative z-10">
            {/* Reaction counts using authentic Lucide icons */}
            <div className={`pt-2 border-t ${sc.borderDivider} flex items-center justify-between text-[11px] ${sc.textSecondary}`}>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-3.5 h-3.5 text-[#0A66C2] stroke-[2]" />
                  <Heart className="w-3.5 h-3.5 text-[#E0245E] stroke-[2]" />
                  <Sparkles className="w-3.5 h-3.5 text-[#059669] stroke-[2]" />
                  <Lightbulb className="w-3.5 h-3.5 text-[#D97706] stroke-[2]" />
                </div>
                {isEditable ? (
                  <input
                    type="number"
                    value={post.engagement.likes || 0}
                    onChange={(e) => updateEngagement({ likes: parseInt(e.target.value) || 0 })}
                    className={`w-14 px-1 py-0.5 text-xs rounded border ${sc.metricInputBg} focus:outline-none text-left font-medium`}
                    title="Edit reactions count"
                  />
                ) : (
                  <span className="font-medium">{formatCount(post.engagement.likes)}</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isEditable ? (
                  <>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={post.engagement.comments || 0}
                        onChange={(e) => updateEngagement({ comments: parseInt(e.target.value) || 0 })}
                        className={`w-12 px-1 py-0.5 text-xs rounded border ${sc.metricInputBg} focus:outline-none text-left font-medium`}
                      />
                      <span>comments</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={post.engagement.reposts || 0}
                        onChange={(e) => updateEngagement({ reposts: parseInt(e.target.value) || 0 })}
                        className={`w-12 px-1 py-0.5 text-xs rounded border ${sc.metricInputBg} focus:outline-none text-left font-medium`}
                      />
                      <span>reposts</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>{formatCount(post.engagement.comments)} comments</span>
                    <span>•</span>
                    <span>{formatCount(post.engagement.reposts)} reposts</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Icons Bar with authentic Lucide icons */}
            <div className={`pt-2 border-t ${sc.borderDivider} grid grid-cols-4 gap-1 text-[11px] font-semibold ${sc.textSecondary}`}>
              <div className="flex items-center justify-center gap-1 py-1 rounded">
                <ThumbsUp className="w-3.5 h-3.5 stroke-[1.75]" />
                <span className="hidden sm:inline">Like</span>
              </div>
              <div className="flex items-center justify-center gap-1 py-1 rounded">
                <MessageSquare className="w-3.5 h-3.5 stroke-[1.75]" />
                <span className="hidden sm:inline">Comment</span>
              </div>
              <div className="flex items-center justify-center gap-1 py-1 rounded">
                <Repeat className="w-3.5 h-3.5 stroke-[1.75]" />
                <span className="hidden sm:inline">Repost</span>
              </div>
              <div className="flex items-center justify-center gap-1 py-1 rounded">
                <Send className="w-3.5 h-3.5 stroke-[1.75]" />
                <span className="hidden sm:inline">Send</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return platform === "linkedin" ? renderLinkedInLayout() : renderXLayout();
};
