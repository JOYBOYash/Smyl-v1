import React from "react";
import { CanvasBackground } from "../types";

interface CanvasWrapperProps {
  background: CanvasBackground;
  padding: "0" | "16" | "32" | "48" | "64";
  backgroundBlur?: number;
  children: React.ReactNode;
}

export const CanvasWrapper: React.FC<CanvasWrapperProps> = ({
  background,
  padding,
  backgroundBlur = 0,
  children,
}) => {
  const isGradient = background.startsWith("gradient-") || background.startsWith("pattern-");

  // Map background keyword to styles
  const getBackgroundStyle = (): React.CSSProperties => {
    switch (background) {
      case "solid-white":
        return { backgroundColor: "#ffffff", border: "1px solid #E1E5E9" };
      case "solid-dark":
        return { backgroundColor: "#111418", border: "1px solid #27272a" };
      case "gradient-sunset":
        return { background: "linear-gradient(135deg, #ff7e5f 0%, #feb47b 50%, #ec4899 100%)" };
      case "gradient-ocean":
        return { background: "linear-gradient(135deg, #00c6ff 0%, #0072ff 50%, #3b82f6 100%)" };
      case "gradient-twilight":
        return { background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #581c87 100%)" };
      case "gradient-emerald":
        return { background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" };
      case "gradient-royal":
        return { background: "linear-gradient(135deg, #654ea3 0%, #eaafc8 100%)" };
      case "gradient-cyber":
        return { background: "linear-gradient(135deg, #8a2387 0%, #e94057 50%, #f27121 100%)" };
      case "pattern-dots-light":
        return {
          backgroundColor: "#ffffff",
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='3' cy='3' r='1.5' fill='%23626A73' fill-opacity='0.25'/%3E%3C/svg%3E")`,
          border: "1px solid #E1E5E9",
        };
      case "pattern-dots-dark":
        return {
          backgroundColor: "#111418",
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='3' cy='3' r='1.5' fill='%23ffffff' fill-opacity='0.20'/%3E%3C/svg%3E")`,
          border: "1px solid #27272a",
        };
      case "pattern-grid-light":
        return {
          backgroundColor: "#F8FAFC",
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 24 0 L 0 0 0 24' fill='none' stroke='%2317191C' stroke-width='1' stroke-opacity='0.08'/%3E%3C/svg%3E")`,
          border: "1px solid #E1E5E9",
        };
      case "pattern-grid-dark":
        return {
          backgroundColor: "#0B0F17",
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='28' height='28' viewBox='0 0 28 28' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 28 0 L 0 0 0 28' fill='none' stroke='%2338bdf8' stroke-width='1' stroke-opacity='0.15'/%3E%3C/svg%3E")`,
          border: "1px solid #1e293b",
        };
      case "pattern-lines-gradient":
        return {
          background: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20L20 0' stroke='%23ffffff' stroke-width='1.2' stroke-opacity='0.18'/%3E%3C/svg%3E"), linear-gradient(135deg, #ff7e5f 0%, #feb47b 50%, #ec4899 100%)`,
        };
      case "pattern-blueprint":
        return {
          background: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 32 L32 0 M0 0 L32 32' stroke='%23ffffff' stroke-width='0.75' stroke-opacity='0.12'/%3E%3C/svg%3E"), linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #581c87 100%)`,
        };
      case "pattern-crosses":
        return {
          background: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 8v8M8 12h8' stroke='%23ffffff' stroke-width='1.2' stroke-opacity='0.20'/%3E%3C/svg%3E"), linear-gradient(135deg, #654ea3 0%, #eaafc8 100%)`,
        };
      case "none":
      default:
        return { backgroundColor: "transparent" };
    }
  };

  // Map padding sizes with symmetric width and height insets
  const getPaddingClass = () => {
    switch (padding) {
      case "16":
        return "p-4";
      case "32":
        return "p-8";
      case "48":
        return "p-12";
      case "64":
        return "p-16";
      case "0":
      default:
        return "p-0";
    }
  };

  return (
    <div
      id="smyl-canvas"
      style={!isGradient || backgroundBlur === 0 ? getBackgroundStyle() : undefined}
      className={`transition-all flex items-center justify-center overflow-hidden rounded-2xl relative ${getPaddingClass()} box-border max-w-full shadow-xs`}
    >
      {/* Blurred gradient background layer when gradient blur is active */}
      {isGradient && backgroundBlur > 0 && (
        <div
          className="absolute -inset-4 pointer-events-none -z-0 transition-all duration-300"
          style={{
            ...getBackgroundStyle(),
            filter: `blur(${backgroundBlur}px)`,
            transform: "scale(1.12)",
          }}
        />
      )}

      <div className="w-full flex items-center justify-center relative z-10">{children}</div>

      {/* Persistent gradient corner watermark: 'generated using Smyl' with icon */}
      <div className="absolute bottom-3 right-4 z-20 flex items-center gap-1.5 pointer-events-none select-none">
        <span
          className={`text-[11px] font-medium tracking-tight ${
            background === "solid-white"
              ? "text-[#17191C]/45"
              : "text-white/60 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
          }`}
        >
          generated using Smyl
        </span>
        <img
          src="/smyl-icon.svg"
          alt="Smyl"
          className={`h-3.5 w-auto object-contain ${
            background === "solid-white"
              ? "opacity-45"
              : "opacity-60 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
          }`}
          style={{
            filter: background === "solid-white" ? "brightness(0)" : "brightness(0) invert(1)",
          }}
          draggable={false}
        />
      </div>
    </div>
  );
};

