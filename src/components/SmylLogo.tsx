import React from "react";
import { motion } from "motion/react";
import { CardTheme } from "../types";

interface LogoProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  variant?: "brand" | "white" | "dark" | "monochrome";
}

// Helper to calculate exact CSS filter style to convert any color to target
export const getBrandFilterStyle = (variant: "brand" | "white" | "dark" | "monochrome" = "brand") => {
  if (variant === "white") return "brightness(0) invert(1)";
  if (variant === "dark") return "brightness(0)";
  if (variant === "monochrome") return "grayscale(1)";
  // Target Brand Blue: #0145F2 (converts any vector/raster color into exact brand blue)
  return "brightness(0) saturate(100%) invert(18%) sepia(96%) saturate(6850%) hue-rotate(227deg) brightness(98%) contrast(105%)";
};

// Standalone Brand Logo Icon (Native asset styling without coloring filters)
export const SmylLogo: React.FC<LogoProps> = ({
  className = "h-7 w-auto",
  width,
  height,
  variant,
}) => {
  return (
    <img
      src="/smyl-logo.svg"
      alt="Smyl Logo"
      className={`inline-block object-contain select-none ${className}`}
      style={{
        width,
        height,
        filter: variant && variant !== "brand" ? getBrandFilterStyle(variant) : undefined,
      }}
      draggable={false}
    />
  );
};

// Standalone Brand Text Logo
export const SmylTextLogo: React.FC<LogoProps> = ({
  className = "h-5 w-auto",
  width,
  height,
  variant = "brand",
}) => {
  return (
    <img
      src="/smyl-text-logo.svg"
      alt="Smyl Text"
      className={`inline-block object-contain select-none ${className}`}
      style={{
        width,
        height,
        filter: getBrandFilterStyle(variant),
      }}
      draggable={false}
    />
  );
};

// Standalone Brand Icon/Accent (the clip loop graphic)
export const SmylIcon: React.FC<LogoProps> = ({
  className = "h-6 w-auto",
  width,
  height,
  variant = "brand",
}) => {
  return (
    <img
      src="/smyl-icon.svg"
      alt="Smyl Icon"
      className={`inline-block object-contain select-none ${className}`}
      style={{
        width,
        height,
        filter: getBrandFilterStyle(variant),
      }}
      draggable={false}
    />
  );
};

// Combined Header Logo (Uncolored Icon Logo + Colored Text Logo) for Header/Navbar
export const SmylHeaderLogo: React.FC<LogoProps & { gap?: string }> = ({
  className = "h-7 w-auto",
  gap = "gap-2.5",
  variant = "brand",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -2 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 2 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`inline-flex items-center ${gap}`}
    >
      <SmylLogo className={className} />
      <SmylTextLogo className="h-4.5 w-auto" variant={variant} />
    </motion.div>
  );
};

// Combined Footer Logo (pure Text Logo) as requested
export const SmylFooterLogo: React.FC<LogoProps> = ({
  className = "h-5 w-auto",
  variant = "brand",
}) => {
  return (
    <div className="inline-flex items-center">
      <SmylTextLogo className={className} variant={variant} />
    </div>
  );
};

// Custom Brand Loader incorporating the Smyl Icon
export const SmylLoader: React.FC<{ size?: "sm" | "md" | "lg" }> = ({ size = "md" }) => {
  const sizeClass = size === "sm" ? "h-6 w-auto" : size === "lg" ? "h-14 w-auto" : "h-9 w-auto";
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.08, 1],
        }}
        transition={{
          rotate: { repeat: Infinity, duration: 1.8, ease: "linear" },
          scale: { repeat: Infinity, duration: 1.8, ease: "easeInOut" },
        }}
        className="flex items-center justify-center"
      >
        <SmylIcon className={sizeClass} variant="brand" />
      </motion.div>
    </div>
  );
};

// Watermark using the standalone icon (scaled and faded)
export const SmylWatermark: React.FC<{
  className?: string;
  theme?: CardTheme;
}> = ({ className = "h-5 w-auto", theme = "light" }) => {
  const isDark = theme === "dark";
  return (
    <div
      className={`inline-flex items-center select-none pointer-events-none transition-opacity duration-300 ${
        isDark ? "opacity-20" : "opacity-25"
      }`}
    >
      <SmylIcon className={className} variant={isDark ? "white" : "brand"} />
    </div>
  );
};
