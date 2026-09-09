import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  IoLink,
  IoQrCode,
  IoGlobe,
  IoBug,
  IoCompass,
  IoImage,
  IoCreate,
  IoArrowForwardOutline,
  IoSearchOutline,
} from "react-icons/io5";

interface ToolItem {
  id: string;
  name: string;
  description: string;
  path: string;
  category: "link" | "campaign" | "sharing";
  icon: React.ComponentType<{ className?: string }>;
}

const TOOLS: ToolItem[] = [
  {
    id: "post-card-studio",
    name: "Social Post Card Studio",
    description: "Transform raw LinkedIn and X text posts into gorgeous, highly-engaging visual post cards complete with custom themes, verified marks, custom avatars, and layout control.",
    path: "/tools/post-card-studio",
    category: "sharing",
    icon: IoCreate,
  },
  {
    id: "link-shortener",
    name: "Dynamic Link Shortener",
    description: "Shorten URLs cleanly and track real-time audience engagement. Add customized descriptions and redirect destinations with our secure, fast click-tracker.",
    path: "/tools/link-shortener",
    category: "link",
    icon: IoLink,
  },
  {
    id: "qr-generator",
    name: "Custom QR Code Generator",
    description: "Generate beautiful, customizable vector QR codes in PNG and SVG formats. Tailor pixel colors, background backdrops, and quiet zone padding for your scan campaigns.",
    path: "/tools/qr-generator",
    category: "link",
    icon: IoQrCode,
  },
  {
    id: "social-previewer",
    name: "Social Link Previewer",
    description: "Instantly preview exactly how your content links and images look when shared across Twitter/X, LinkedIn, Facebook, Slack, Discord, and messaging channels.",
    path: "/tools/social-previewer",
    category: "sharing",
    icon: IoGlobe,
  },
  {
    id: "og-debugger",
    name: "Open Graph Tags Inspector",
    description: "Diagnose, validate, and preview your meta open-graph properties. Confirm that your website is perfectly optimized for search crawler bots and social shares.",
    path: "/tools/og-debugger",
    category: "campaign",
    icon: IoBug,
  },
  {
    id: "utm-builder",
    name: "UTM Campaign Builder",
    description: "Generate structured, trackable campaign URLs with source, medium, terms, and custom campaign tags to measure lead sources precisely across any channel.",
    path: "/tools/utm-builder",
    category: "campaign",
    icon: IoLink,
  },
  {
    id: "link-hub",
    name: "Mobile-Optimized Link Hub",
    description: "Create a fully personalized, high-converting social hub. Display and track all of your digital profile links, assets, and branding under a custom biography page.",
    path: "/tools/link-hub",
    category: "sharing",
    icon: IoCompass,
  },
  {
    id: "screenshot-generator",
    name: "Webpage Screenshot Capture",
    description: "Instantly capture high-resolution web page screenshots from any live URL and hand them off directly into our customization studio for beautiful sharing structures.",
    path: "/tools/screenshot-generator",
    category: "sharing",
    icon: IoImage,
  },
];

export const ToolsHub: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "link" | "campaign" | "sharing">("all");

  const filteredTools = TOOLS.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || tool.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-[#EDF1F5] min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-[32px] sm:text-[64px] leading-tight sm:leading-[1.05] font-[800] text-[#17191C] tracking-[-0.04em]">
            Professional Branding & Link Tools
          </h1>
          <p className="text-[#626A73] text-[18px] leading-[1.6] font-normal">
            Equip your social marketing campaigns with our modular, client-side visual tool suite. Clean interfaces, zero tracking scripts, and offline-first data safety.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E1E5E9] shadow-xs">
          {/* Categories Tab Indicator */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-[#EDF1F5] rounded-xl w-full md:w-auto">
            {(["all", "link", "campaign", "sharing"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`relative px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  activeCategory === cat
                    ? "bg-white text-[#0145F2] shadow-xs"
                    : "text-[#626A73] hover:text-[#17191C]"
                }`}
              >
                {cat === "all" ? "All Tools" : cat === "link" ? "Link Tools" : cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools..."
              className="w-full h-10 pl-10 pr-4 text-xs sm:text-sm bg-white border border-[#E1E5E9] rounded-xl text-[#17191C] placeholder-[#8D959F] shadow-2xs focus:outline-none focus:border-[#0145F2] transition-colors"
            />
            <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8D959F] w-4 h-4" />
          </div>
        </div>

        {/* Grid of Tools */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.id}
                  className="bg-white border border-[#E1E5E9] rounded-2xl p-6 md:p-8 flex flex-col justify-between hover:shadow-md transition-shadow group text-left"
                >
                  <div className="space-y-4">
                    {/* Header: Icon & Category */}
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-[#E8EEFF] text-[#0145F2] flex items-center justify-center">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold tracking-wider text-[#8D959F] uppercase px-2.5 py-1 rounded-full bg-[#EDF1F5]">
                        {tool.category}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <h3 className="text-[20px] font-semibold text-[#17191C] leading-[1.25]">
                        {tool.name}
                      </h3>
                      <p className="text-[15px] sm:text-[16px] text-[#626A73] leading-[1.5] font-normal">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  {/* Call to action button */}
                  <div className="pt-6">
                    <button
                      onClick={() => {
                        navigate(tool.path);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="w-full h-10 px-4 rounded-lg border border-[#E1E5E9] bg-white text-[#17191C] hover:bg-[#F5F7F9] hover:border-[#B9C0C8] font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer group-hover:border-[#0145F2] group-hover:text-[#0145F2]"
                    >
                      <span>Launch Tool</span>
                      <IoArrowForwardOutline className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-[#E1E5E9] rounded-2xl py-16 text-center space-y-3">
            <div className="w-12 h-12 bg-[#EDF1F5] rounded-full flex items-center justify-center mx-auto text-[#8D959F]">
              <IoSearchOutline className="w-6 h-6" />
            </div>
            <p className="font-bold text-[#17191C] text-sm">No tools match your search</p>
            <p className="text-xs text-[#626A73]">Try adjusting your search keywords or filter category.</p>
          </div>
        )}
      </div>
    </div>
  );
};
