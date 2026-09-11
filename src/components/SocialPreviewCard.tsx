import React, { useState } from "react";
import { LinkMetadata } from "../services/metadataService";
import { IoGlobe, IoPlayCircle } from "react-icons/io5";
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
  FaDiscord
} from "react-icons/fa6";
import { SiSubstack } from "react-icons/si";

export type PreviewPlatform =
  | "x"
  | "linkedin"
  | "facebook"
  | "slack"
  | "discord"
  | "whatsapp"
  | "yt"
  | "threads"
  | "substack"
  | "medium"
  | "tiktok"
  | "instagram";

interface SocialPreviewCardProps {
  metadata: LinkMetadata;
  platform: PreviewPlatform;
}

export const SocialPreviewCard: React.FC<SocialPreviewCardProps> = ({
  metadata,
  platform,
}) => {
  const [imageError, setImageError] = useState(false);

  const { title, description, siteName, imageUrl, faviconUrl, finalUrl } = metadata;

  // Extract hostname for display (e.g., "example.com")
  const getDomain = (urlStr: string): string => {
    try {
      const parsed = new URL(urlStr);
      return parsed.hostname.replace("www.", "");
    } catch {
      return "link";
    }
  };

  const domain = getDomain(finalUrl);

  const renderImageFallback = () => (
    <div className="w-full h-full min-h-[160px] bg-[#F1F3F5] flex flex-col items-center justify-center text-[#8D959F] p-4 text-center">
      <IoGlobe className="w-8 h-8 mb-2 animate-pulse text-[#CBD5E1]" />
      <span className="text-xs font-semibold tracking-wider uppercase opacity-80">{domain}</span>
    </div>
  );

  const renderFavicon = (sizeClass = "w-4 h-4") => {
    if (faviconUrl) {
      return (
        <img
          src={faviconUrl}
          alt="favicon"
          referrerPolicy="no-referrer"
          className={`${sizeClass} rounded-sm object-contain shrink-0`}
          onError={(e) => {
            (e.target as HTMLElement).style.display = "none";
          }}
        />
      );
    }
    return <IoGlobe className={`${sizeClass} text-[#8D959F] shrink-0`} />;
  };

  // 1. X (formerly Twitter) Render
  const renderX = () => {
    const isLargeImage = metadata.twitter.card !== "summary" && imageUrl;

    if (isLargeImage) {
      return (
        <div className="border border-[#CFD9DE] rounded-2xl overflow-hidden bg-white max-w-[500px] mx-auto text-left transition-colors hover:bg-[#F7F9F9] select-none shadow-xs">
          {/* Large Image Block */}
          <div className="relative aspect-[1.91/1] w-full border-b border-[#CFD9DE] overflow-hidden bg-[#F7F9F9]">
            {!imageError && imageUrl ? (
              <img
                src={imageUrl}
                alt={title || "Preview"}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              renderImageFallback()
            )}
          </div>
          {/* Content Block */}
          <div className="p-3 space-y-1">
            <span className="text-[13px] text-[#536471] block truncate">{domain}</span>
            <h4 className="text-[14px] font-bold text-[#0F1419] line-clamp-1 leading-snug">
              {title || "Untitled Link"}
            </h4>
            <p className="text-[14px] text-[#536471] line-clamp-2 leading-relaxed">
              {description || "No description provided."}
            </p>
          </div>
        </div>
      );
    }

    // Compact Summary Card (Square Image left, text right)
    return (
      <div className="border border-[#CFD9DE] rounded-2xl overflow-hidden bg-white max-w-[500px] mx-auto text-left flex h-[116px] transition-colors hover:bg-[#F7F9F9] select-none shadow-xs">
        <div className="w-[116px] h-full shrink-0 border-r border-[#CFD9DE] overflow-hidden bg-[#F7F9F9]">
          {!imageError && imageUrl ? (
            <img
              src={imageUrl}
              alt={title || "Preview"}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            renderImageFallback()
          )}
        </div>
        <div className="p-3 flex flex-col justify-center min-w-0 flex-1 space-y-0.5">
          <span className="text-[13px] text-[#536471] block truncate">{domain}</span>
          <h4 className="text-[14px] font-semibold text-[#0F1419] line-clamp-1 leading-tight">
            {title || "Untitled Link"}
          </h4>
          <p className="text-[13px] text-[#536471] line-clamp-2 leading-tight">
            {description || "No description provided."}
          </p>
        </div>
      </div>
    );
  };

  // 2. LinkedIn Render
  const renderLinkedIn = () => {
    return (
      <div className="border border-[#E7E9EC] bg-[#F9FAFB] rounded-sm overflow-hidden max-w-[550px] mx-auto text-left select-none shadow-xs">
        <div className="relative aspect-[1.91/1] w-full border-b border-[#E7E9EC] overflow-hidden bg-[#ECEEF1]">
          {!imageError && imageUrl ? (
            <img
              src={imageUrl}
              alt={title || "Preview"}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            renderImageFallback()
          )}
        </div>
        <div className="p-4 space-y-1 bg-white">
          <h4 className="text-[14px] font-semibold text-[#191919] line-clamp-2 leading-snug">
            {title || "Untitled Link"}
          </h4>
          <div className="flex items-center gap-1.5 text-[12px] text-[#666666] pt-0.5">
            <span className="font-medium tracking-wider uppercase">{domain}</span>
          </div>
        </div>
      </div>
    );
  };

  // 3. Facebook Render
  const renderFacebook = () => {
    return (
      <div className="border border-[#DADDE1] bg-white rounded-md overflow-hidden max-w-[500px] mx-auto text-left select-none shadow-xs">
        <div className="relative aspect-[1.91/1] w-full border-b border-[#DADDE1] overflow-hidden bg-[#F2F3F5]">
          {!imageError && imageUrl ? (
            <img
              src={imageUrl}
              alt={title || "Preview"}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            renderImageFallback()
          )}
        </div>
        <div className="p-3 bg-[#F2F3F5] space-y-0.5">
          <span className="text-[12px] text-[#606770] block uppercase tracking-wide truncate">
            {domain}
          </span>
          <h4 className="text-[14px] font-bold text-[#1d2129] line-clamp-2 leading-snug">
            {title || "Untitled Website"}
          </h4>
          <p className="text-[12px] text-[#606770] line-clamp-2 leading-normal">
            {description || "No preview information available."}
          </p>
        </div>
      </div>
    );
  };

  // 4. Slack Render
  const renderSlack = () => {
    return (
      <div className="max-w-[550px] mx-auto text-left p-3 border-l-4 border-[#D0D0D0] bg-[#FAF9F6]/20 pl-4 space-y-2 select-none shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {renderFavicon("w-4 h-4")}
            <span className="text-[14px] font-bold text-[#1D242B] tracking-tight">
              {siteName || domain}
            </span>
          </div>
          <h4 className="text-[15px] font-semibold text-[#1264A3] hover:underline cursor-pointer leading-snug">
            {title || "Untitled Link"}
          </h4>
          <p className="text-[14px] text-[#1D242B] leading-relaxed">
            {description || "No preview description available."}
          </p>
        </div>
        {imageUrl && !imageError && (
          <div className="max-w-[400px] rounded-lg border border-[#E1E5E9] overflow-hidden bg-[#F8FAFC]">
            <img
              src={imageUrl}
              alt="Slack Preview Attachment"
              referrerPolicy="no-referrer"
              className="max-h-[220px] w-full object-cover"
              onError={() => setImageError(true)}
            />
          </div>
        )}
      </div>
    );
  };

  // 5. Discord Render
  const renderDiscord = () => {
    return (
      <div className="max-w-[500px] mx-auto text-left rounded-md bg-[#2F3136] border-l-4 border-[#202225] p-3.5 space-y-2 select-none shadow-sm text-[#F6F6F6]">
        {siteName && (
          <span className="text-[12px] font-medium text-[#B9BBBE] tracking-tight block">
            {siteName}
          </span>
        )}
        <h4 className="text-[15px] font-bold text-[#00AFF4] hover:underline cursor-pointer leading-snug">
          {title || "Untitled Link"}
        </h4>
        <p className="text-[13px] text-[#DDC3C3] opacity-90 leading-relaxed font-sans font-light">
          {description || "No description provided."}
        </p>
        {imageUrl && !imageError && (
          <div className="rounded-md overflow-hidden border border-[#202225] max-h-[260px] bg-[#2F3136] mt-2">
            <img
              src={imageUrl}
              alt="Discord Preview Attachment"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain max-h-[260px]"
              onError={() => setImageError(true)}
            />
          </div>
        )}
      </div>
    );
  };

  // 6. WhatsApp Render
  const renderWhatsApp = () => {
    return (
      <div className="max-w-[450px] mx-auto select-none p-3 rounded-xl bg-[#E2F4C5] shadow-sm relative text-left">
        <div className="space-y-1.5">
          <div className="bg-[#D2EBA8]/50 hover:bg-[#C1DC96] rounded-lg overflow-hidden border border-[#B9D889] p-2.5 flex gap-3 cursor-pointer transition-colors items-start">
            <div className="flex-1 min-w-0 space-y-0.5">
              <span className="text-[12px] text-[#4A86E8] block truncate leading-tight">
                {finalUrl}
              </span>
              <h4 className="text-[14px] font-bold text-[#000000]/85 line-clamp-2 leading-tight">
                {title || "Untitled Website"}
              </h4>
              <p className="text-[12px] text-[#666666] line-clamp-2 leading-normal">
                {description || "No details provided."}
              </p>
            </div>
            {imageUrl && !imageError && (
              <div className="w-[64px] h-[64px] rounded bg-white overflow-hidden shrink-0 border border-[#CBD5E1]">
                <img
                  src={imageUrl}
                  alt="WhatsApp Preview Thumbnail"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-1.5 text-[10px] text-[#626A73] font-medium pt-0.5">
            <span>10:30 AM</span>
            <span className="text-emerald-600 font-bold">✓✓</span>
          </div>
        </div>
      </div>
    );
  };

  // 7. YouTube Render
  const renderYT = () => {
    return (
      <div className="border border-[#383838] bg-[#0F0F0F] rounded-xl overflow-hidden max-w-[500px] mx-auto text-left select-none text-white shadow-md">
        <div className="relative aspect-[16/9] w-full bg-[#1F1F1F] overflow-hidden">
          {!imageError && imageUrl ? (
            <img
              src={imageUrl}
              alt={title || "YouTube video"}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            renderImageFallback()
          )}
          {/* Overlay play button */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors cursor-pointer">
            <IoPlayCircle className="w-16 h-16 text-[#FF0000] drop-shadow-lg" />
          </div>
          {/* Simulated red progress bar */}
          <div className="absolute bottom-0 left-0 w-1/3 h-1 bg-[#FF0000]" />
          <div className="absolute bottom-0 left-1/3 right-0 h-1 bg-white/20" />
        </div>
        <div className="p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-[12px] text-[#AAAAAA] font-semibold">
            <FaYoutube className="text-[#FF0000] w-4 h-4" />
            <span>YouTube • {domain}</span>
          </div>
          <h4 className="text-[14px] font-bold text-white line-clamp-2 leading-snug">
            {title || "Video Preview Title"}
          </h4>
          <p className="text-[12px] text-[#AAAAAA] line-clamp-1 font-medium leading-normal">
            {description || "Extracting video description details..."}
          </p>
        </div>
      </div>
    );
  };

  // 8. Threads Render
  const renderThreads = () => {
    return (
      <div className="border border-[#E5E5E5] bg-[#FFFFFF] rounded-2xl p-4 max-w-[480px] mx-auto text-left select-none shadow-xs text-[#000000]">
        <div className="flex gap-3">
          {/* Mock Thread user avatar */}
          <div className="w-9 h-9 rounded-full bg-[#E5E5E5] shrink-0 overflow-hidden flex items-center justify-center border border-[#000000]/5">
            <FaThreads className="w-5 h-5 text-black" />
          </div>
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-bold hover:underline cursor-pointer">threads_user</span>
              <span className="text-[12px] text-[#999999]">2h</span>
            </div>
            <p className="text-[14px] leading-relaxed text-[#000000]/90">
              Shared from {domain}: {title || "threads content link preview"}
            </p>
            {/* Attachment Card */}
            <div className="border border-[#E5E5E5] rounded-xl overflow-hidden bg-[#FAFAFA] hover:bg-[#F5F5F5] transition-colors cursor-pointer mt-2">
              {imageUrl && !imageError && (
                <div className="relative aspect-[1.91/1] overflow-hidden bg-[#E5E5E5]">
                  <img
                    src={imageUrl}
                    alt={title || "Threads preview"}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                </div>
              )}
              <div className="p-3 space-y-0.5">
                <span className="text-[11px] text-[#999999] uppercase tracking-wider block">{domain}</span>
                <h5 className="text-[13px] font-bold text-black line-clamp-1">{title || "Link Preview"}</h5>
                <p className="text-[12px] text-[#777777] line-clamp-2 leading-relaxed">{description || "No description."}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 9. Substack Render
  const renderSubstack = () => {
    return (
      <div className="border border-[#E5E5E5] bg-white rounded-xl overflow-hidden max-w-[500px] mx-auto text-left select-none shadow-sm">
        <div className="p-4 border-b border-[#E5E5E5] bg-[#FFFBF7] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#FF6719]/10 rounded-lg text-[#FF6719]">
              <SiSubstack className="w-4 h-4" />
            </div>
            <span className="text-[12px] font-bold text-[#FF6719] tracking-wide uppercase">Substack</span>
          </div>
          <span className="text-[11px] text-[#888888] font-medium">{domain}</span>
        </div>
        <div className="p-5 space-y-3">
          <h4 className="text-[18px] font-serif font-bold text-[#151515] leading-snug tracking-tight">
            {title || "Untitled Substack Post"}
          </h4>
          <p className="text-[14px] text-[#4A4A4A] font-serif leading-relaxed line-clamp-3">
            {description || "No preview synopsis available."}
          </p>
          {imageUrl && !imageError && (
            <div className="rounded-lg overflow-hidden border border-[#ECEEF1] aspect-[1.91/1] bg-[#FAF9F5] mt-1">
              <img
                src={imageUrl}
                alt="Substack Feature Preview"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  // 10. Medium Render
  const renderMedium = () => {
    return (
      <div className="border border-[#ECEEF1] bg-white rounded-lg p-5 max-w-[500px] mx-auto text-left select-none shadow-xs text-[#242424]">
        <div className="flex items-center gap-2 pb-3 border-b border-[#F2F2F2] mb-3">
          <FaMedium className="w-5 h-5 text-black" />
          <span className="text-[12px] font-bold tracking-wider text-black uppercase">Medium</span>
          <span className="text-[12px] text-[#6B6B6B]">• {domain}</span>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="flex-1 min-w-0 space-y-1">
            <h4 className="text-[15px] font-bold text-[#242424] leading-snug line-clamp-2">
              {title || "Medium Article Preview"}
            </h4>
            <p className="text-[13px] text-[#6B6B6B] leading-relaxed line-clamp-3">
              {description || "Explore and read this narrative on the Medium writing community platform."}
            </p>
          </div>
          {imageUrl && !imageError && (
            <div className="w-24 h-24 rounded border border-[#E5E5E5] bg-[#FAF9F6] shrink-0 overflow-hidden">
              <img
                src={imageUrl}
                alt="Medium publication"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            </div>
          )}
        </div>
        <div className="pt-3 text-[11px] font-medium text-[#00AB6C] flex items-center gap-1">
          <span>Read more on Medium</span>
          <span>→</span>
        </div>
      </div>
    );
  };

  // 11. TikTok Render
  const renderTikTok = () => {
    return (
      <div className="border border-[#2F2F2F] bg-[#121212] rounded-xl overflow-hidden max-w-[420px] mx-auto text-left select-none text-white shadow-lg">
        <div className="p-3 border-b border-[#2F2F2F] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaTiktok className="w-4 h-4 text-[#00F2FE]" />
            <span className="text-[12px] font-bold tracking-wider text-[#FFFFFF] uppercase">TikTok</span>
          </div>
          <span className="text-[11px] text-[#8A8A8A]">{domain}</span>
        </div>
        <div className="relative aspect-[3/4] w-full bg-[#1F1F1F] overflow-hidden flex items-center justify-center">
          {!imageError && imageUrl ? (
            <img
              src={imageUrl}
              alt="TikTok post"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-80"
              onError={() => setImageError(true)}
            />
          ) : (
            renderImageFallback()
          )}
          {/* Overlay aesthetic element */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 space-y-1.5">
            <span className="bg-black/40 text-[11px] text-[#00F2FE] px-2.5 py-1 rounded-full border border-[#00F2FE]/20 font-bold inline-block">
              @tiktok_creator
            </span>
            <p className="text-sm font-bold text-white line-clamp-2 leading-snug drop-shadow-md">
              {title || "Original TikTok post preview"}
            </p>
            <p className="text-xs text-[#CCCCCC] line-clamp-1 drop-shadow-sm font-medium">
              ♬ {description || "Original Sound - creators playlist"}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // 12. Instagram Render
  const renderInstagram = () => {
    return (
      <div className="border border-[#DBDBDB] bg-white rounded-xl overflow-hidden max-w-[480px] mx-auto text-left select-none text-black shadow-sm">
        {/* Instagram Profile Header */}
        <div className="p-3 flex items-center gap-2 border-b border-[#DBDBDB] bg-white">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#F56040] to-[#E1306C] p-[1.5px]">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
              <FaInstagram className="w-4 h-4 text-[#C13584]" />
            </div>
          </div>
          <div className="flex-1">
            <span className="text-[13px] font-bold hover:underline cursor-pointer block">instagram_post</span>
            <span className="text-[10px] text-[#8E8E8E] block">Instagram • {domain}</span>
          </div>
        </div>
        {/* Post Image Body */}
        <div className="relative aspect-square w-full bg-[#FAFAFA] overflow-hidden">
          {!imageError && imageUrl ? (
            <img
              src={imageUrl}
              alt="Instagram visual post"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            renderImageFallback()
          )}
        </div>
        {/* Engagement row icons and caption */}
        <div className="p-4 space-y-1.5 bg-white">
          <div className="flex gap-3 text-lg text-black">
            <span>❤️</span>
            <span>💬</span>
            <span>✈️</span>
          </div>
          <h4 className="text-[13px] font-bold text-black mt-1">
            {title || "Link shared by instagram_post"}
          </h4>
          <p className="text-[12px] text-[#262626] line-clamp-2 leading-relaxed">
            {description || "See the rich media, insights, and stories on Instagram."}
          </p>
        </div>
      </div>
    );
  };

  const renderPlatformContent = () => {
    switch (platform) {
      case "x":
        return renderX();
      case "linkedin":
        return renderLinkedIn();
      case "facebook":
        return renderFacebook();
      case "slack":
        return renderSlack();
      case "discord":
        return renderDiscord();
      case "whatsapp":
        return renderWhatsApp();
      case "yt":
        return renderYT();
      case "threads":
        return renderThreads();
      case "substack":
        return renderSubstack();
      case "medium":
        return renderMedium();
      case "tiktok":
        return renderTikTok();
      case "instagram":
        return renderInstagram();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3" id={`social-preview-card-${platform}`}>
      <div className="flex items-center justify-between text-[11px] text-[#8D959F] border-b border-[#E1E5E9]/50 pb-1.5 mb-2">
        <span className="font-semibold tracking-wider uppercase text-[#626A73]">
          {platform === "x" ? "X / Twitter" : platform} Preview
        </span>
        <span className="italic">Preview based on available page metadata</span>
      </div>

      <div className="relative">
        {renderPlatformContent()}
      </div>
    </div>
  );
};
