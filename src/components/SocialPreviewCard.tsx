import React, { useState } from "react";
import { LinkMetadata } from "../services/metadataService";
import { IoGlobe, IoWarning, IoChatboxEllipses } from "react-icons/io5";

interface SocialPreviewCardProps {
  metadata: LinkMetadata;
  platform: "x" | "linkedin" | "facebook" | "slack" | "discord" | "whatsapp";
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

  // Fallback image rendering
  const renderImageFallback = () => (
    <div className="w-full h-full min-h-[160px] bg-gradient-to-br from-[#ECEEF1] to-[#F5F7F9] flex flex-col items-center justify-center text-[#8D959F] p-4 text-center">
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
    // Check if wide (summary_large_image) or standard summary card
    const isLargeImage = metadata.twitter.card !== "summary" && imageUrl;

    if (isLargeImage) {
      return (
        <div className="border border-[#CFD9DE] rounded-2xl overflow-hidden bg-white max-w-[500px] mx-auto text-left transition-colors hover:bg-[#F7F9F9] select-none">
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
      <div className="border border-[#CFD9DE] rounded-2xl overflow-hidden bg-white max-w-[500px] mx-auto text-left flex h-[116px] transition-colors hover:bg-[#F7F9F9] select-none">
        {/* Left Side: Thumbnail */}
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
        {/* Right Side: Text content */}
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
        {/* Wide Image */}
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
        {/* Bottom Details block */}
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
      <div className="border border-[#DADDE1] bg-white rounded-md overflow-hidden max-w-[500px] mx-auto text-left select-none">
        {/* Standard Facebook Image */}
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
        {/* Facebook Info Footer */}
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
      <div className="max-w-[550px] mx-auto text-left p-3 border-l-4 border-[#D0D0D0] bg-[#FAF9F6]/20 pl-4 space-y-2 select-none">
        {/* Title, domain and favicon top block */}
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

        {/* Large attachment image */}
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
      <div className="max-w-[500px] mx-auto text-left rounded-md bg-[#2F3136] border-l-4 border-[#202225] p-3.5 space-y-2 select-none shadow-sm">
        {/* Site Name Metadata */}
        {siteName && (
          <span className="text-[12px] font-medium text-[#B9BBBE] tracking-tight block">
            {siteName}
          </span>
        )}

        {/* Title block */}
        <h4 className="text-[15px] font-bold text-[#00AFF4] hover:underline cursor-pointer leading-snug">
          {title || "Untitled Link"}
        </h4>

        {/* Description block */}
        <p className="text-[13px] text-[#DDC3C3] opacity-90 leading-relaxed font-sans font-light">
          {description || "No description provided."}
        </p>

        {/* Large Attachment Image */}
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
        {/* Received Speech Bubble structure */}
        <div className="space-y-1.5">
          {/* Main Attachment Inner Block */}
          <div className="bg-[#D2EBA8]/50 hover:bg-[#C1DC96] rounded-lg overflow-hidden border border-[#B9D889] p-2.5 flex gap-3 cursor-pointer transition-colors items-start">
            {/* Left side text */}
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

            {/* Right side thumbnail */}
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

          {/* Chat bubble bottom metadata */}
          <div className="flex items-center justify-end gap-1.5 text-[10px] text-[#626A73] font-medium pt-0.5">
            <span>10:30 AM</span>
            <span className="text-emerald-600 font-bold">✓✓</span>
          </div>
        </div>
      </div>
    );
  };

  // Switch wrapper based on platforms
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
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3" id={`social-preview-card-${platform}`}>
      {/* Header communicating visual approximation limit */}
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
