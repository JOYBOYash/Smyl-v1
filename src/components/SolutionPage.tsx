import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  IoCreate,
  IoLink,
  IoQrCode,
  IoCompass,
  IoStatsChart,
  IoCheckmarkCircle,
  IoPeople,
  IoBusiness,
  IoRocket,
  IoColorPalette,
} from "react-icons/io5";

interface SolutionData {
  title: string;
  subtitle: string;
  heroText: string;
  benefitTitle: string;
  benefits: { title: string; desc: string; icon: React.ComponentType<{ className?: string }> }[];
  useCases: { label: string; details: string }[];
  ctaText: string;
  brandColor: string;
  image: string;
}

const SOLUTIONS: Record<string, SolutionData> = {
  creators: {
    title: "Smyl for Content Creators",
    subtitle: "Grow your platform and captivate your audience visually.",
    heroText: "Stop letting text posts get buried in feed algorithms. Turn your high-value ideas and newsletters into professional, media-rich visual post cards. Consolidate your digital assets under an analytical Link Hub.",
    benefitTitle: "How Smyl Elevates Your Creative Platform",
    brandColor: "#0145F2",
    image: "/assets/landing/Final_1_Creators.webp",
    benefits: [
      {
        title: "Pristine Post Card Studio",
        desc: "Convert text thoughts, threads, or quotes into stunning custom-bordered visual assets formatted perfectly for X and LinkedIn.",
        icon: IoCreate,
      },
      {
        title: "Your Custom Link Hub",
        desc: "Assemble your newsletter, podcast, courses, and social channels under a single, highly stylized visual profile index.",
        icon: IoCompass,
      },
      {
        title: "Clean Tracking & QR Links",
        desc: "Generate tracking links for sponsors or print merchandise codes without ugly tracking query parameters.",
        icon: IoQrCode,
      },
    ],
    useCases: [
      { label: "LinkedIn Newsletters", details: "Increase subscriber conversions by converting snippet summaries into elegant visual cards." },
      { label: "Sponsorship Reports", details: "Give premium sponsors reliable, clean reports of link clicks using our offline-first analytics profiles." },
      { label: "Podcast Distribution", details: "Distribute custom QR links on video streams to redirect mobile viewers smoothly to Apple Podcasts or Spotify." },
    ],
    ctaText: "Start Building Your Creator Asset Suite",
  },
  marketers: {
    title: "Smyl for Growth Marketers",
    subtitle: "Optimize social link distribution and tracking metrics.",
    heroText: "Empower your acquisition channels. Maintain complete control of campaign tracking, diagnose broken social tags before launching, and build short links that match your precise UTM attributes.",
    benefitTitle: "How Smyl Supports Growth Campaigns",
    brandColor: "#2E9B62",
    image: "/assets/landing/Final_3_Marketers.webp",
    benefits: [
      {
        title: "Robust Campaign UTMs",
        desc: "Build trackable landing page URLs with standardized source, campaign, and term tags. Keep your tracking consistent across sheets.",
        icon: IoLink,
      },
      {
        title: "Metadata & Social Audits",
        desc: "Scan and debug open-graph sharing structures before pushing ad budgets. Ensure your target links render rich previews.",
        icon: IoCompass,
      },
      {
        title: "Real-time Short Links",
        desc: "Shorten and track redirects with our client-centric link shortener. Clean pathways that improve click-through rates.",
        icon: IoStatsChart,
      },
    ],
    useCases: [
      { label: "Paid Campaign Audits", details: "Validate OG share tags for custom domains to avoid broken previews on social networks." },
      { label: "Structured Campaign Tracking", details: "Synthesize marketing links with clear campaign tracking naming conventions in seconds." },
      { label: "Interactive QRs in Ads", details: "Embed high-quality custom QR vectors inside offline billboard media to track digital engagement." },
    ],
    ctaText: "Unlock Complete Marketing Control",
  },
  founders: {
    title: "Smyl for Startup Founders",
    subtitle: "Command authority, build brand equity, and pitch cleanly.",
    heroText: "Your personal founder brand is your startup's strongest marketing asset. Share insights with elegant post-card visuals, direct readers through professional, secure link pathways, and track investor decks smoothly.",
    benefitTitle: "How Smyl Helps Startup Leaders Scale",
    brandColor: "#D99422",
    image: "/assets/landing/Final_2_Founders.webp",
    benefits: [
      {
        title: "Authority visual templates",
        desc: "Present your thought leadership in highly-polished, editorial layouts that command attention from investors and customers.",
        icon: IoRocket,
      },
      {
        title: "Secure link redirects",
        desc: "Share investor decks, beta links, and product mockups via clean pathways that record genuine visits without data leaks.",
        icon: IoLink,
      },
      {
        title: "Custom branding controls",
        desc: "Match your company's design system with exact custom colors, corner paddings, and font pairings in our studio.",
        icon: IoColorPalette,
      },
    ],
    useCases: [
      { label: "Thought Leadership Visuals", details: "Format high-value product insights and strategic pivots into readable cards that trend on LinkedIn." },
      { label: "Deck Sharing Pathways", details: "Protect and evaluate initial reviews of your pitch materials with trackable short paths." },
      { label: "Press Release Backlinks", details: "Create custom QR vectors to include in print or media kits for instantaneous, high-resolution redirections." },
    ],
    ctaText: "Elevate Your Startup Presence",
  },
  agencies: {
    title: "Smyl for Social Media Agencies",
    subtitle: "Deliver enterprise-grade visual client collateral.",
    heroText: "Manage and optimize link-sharing strategies and visual assets for multiple client accounts. From Link Hub portfolio landing pages to robust UTM structures, keep your agency's operations completely structured.",
    benefitTitle: "How Smyl Drives Agency Client Results",
    brandColor: "#0145F2",
    image: "/assets/landing/Final_4_Teams.webp",
    benefits: [
      {
        title: "Fast Client Mockups",
        desc: "Draft, customize, and finalize social post visuals for client approval with live drag-and-drop and image capabilities.",
        icon: IoPeople,
      },
      {
        title: "Robust UTM Campaigns",
        desc: "Design error-free campaigns for all client marketing teams. Maintain standard URL naming across your agency workspace.",
        icon: IoBusiness,
      },
      {
        title: "Client Brand Customizations",
        desc: "Construct fully custom colors and typography configurations tailored individually to each client's visual guidelines.",
        icon: IoColorPalette,
      },
    ],
    useCases: [
      { label: "Pre-approval Client Mockups", details: "Export perfect LinkedIn post cards directly to present to clients for draft review." },
      { label: "Client Account Link Hubs", details: "Design bespoke link portfolios for client authors to capture multiple redirect locations in a structured grid." },
      { label: "High-volume UTM Creation", details: "Leverage standard structures to easily build campaigns for various client landing pages." },
    ],
    ctaText: "Launch Your Agency Workspace",
  },
};

export const SolutionPage: React.FC = () => {
  const params = useParams<{ solution?: string; audience?: string }>();
  const navigate = useNavigate();

  const currentSlug = (params.solution || params.audience)?.toLowerCase() || "creators";
  const data = SOLUTIONS[currentSlug] || SOLUTIONS.creators;

  return (
    <div className="bg-[#EDF1F5] min-h-screen py-16 px-4 sm:px-6 lg:px-8 text-left">
      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-[#E1E5E9] rounded-3xl p-8 sm:p-12 shadow-xs">
          <div className="lg:col-span-8 space-y-6">
            <span className="text-xs uppercase font-bold tracking-widest text-[#0145F2] bg-[#E8EEFF] px-3 py-1.5 rounded-lg inline-block">
              Solutions
            </span>
            <div className="space-y-3">
              <h1 className="text-[32px] sm:text-[48px] leading-tight sm:leading-[1.1] font-[800] text-[#17191C] tracking-[-0.035em]">
                {data.title}
              </h1>
              <p className="text-[#626A73] text-[18px] sm:text-[20px] font-semibold leading-[1.3] leading-snug">
                {data.subtitle}
              </p>
            </div>
            <p className="text-[#626A73] text-[16px] sm:text-[18px] leading-[1.6] font-normal">
              {data.heroText}
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  navigate("/tools/post-card-studio");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="h-10 px-6 rounded-lg bg-[#0145F2] text-white font-semibold text-xs hover:bg-[#0039D4] active:bg-[#0030B8] transition-colors cursor-pointer shadow-sm shadow-brand-primary/10 inline-flex items-center justify-center"
              >
                {data.ctaText}
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 hidden lg:flex justify-center items-center">
            <img
              src={data.image}
              alt={data.title}
              className="w-full h-auto max-h-[340px] object-contain rounded-2xl drop-shadow-md hover:scale-[1.02] transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Benefits Grid Section */}
        <div className="space-y-10">
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-[28px] sm:text-[40px] leading-tight font-[700] text-[#17191C] tracking-[-0.025em]">
              {data.benefitTitle}
            </h2>
            <p className="text-[#626A73] text-[15px] sm:text-[16px] leading-[1.5]">
              Modular link and asset configurations designed for professional work environments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-[#E1E5E9] rounded-2xl p-6 flex flex-col justify-between hover:shadow-sm transition-shadow text-left"
                >
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-lg bg-[#E8EEFF] text-[#0145F2] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-base sm:text-[18px] text-[#17191C]">
                        {benefit.title}
                      </h3>
                      <p className="text-xs sm:text-[14px] text-[#626A73] leading-[1.5] font-normal">
                        {benefit.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Core Use Cases Section */}
        <div className="bg-white border border-[#E1E5E9] rounded-3xl p-8 sm:p-10 space-y-8 text-left">
          <div className="space-y-2">
            <h2 className="text-[24px] sm:text-[32px] leading-tight font-[700] text-[#17191C] tracking-[-0.02em]">
              Common Action Use Cases
            </h2>
            <p className="text-[#626A73] text-[15px] sm:text-[16px]">
              How real brand strategies are configured on our platforms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {data.useCases.map((useCase, idx) => (
              <div key={idx} className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <IoCheckmarkCircle className="w-5 h-5 text-[#2E9B62] shrink-0" />
                  <span className="font-semibold text-xs sm:text-[14px] text-[#17191C]">{useCase.label}</span>
                </div>
                <p className="text-xs text-[#626A73] leading-[1.5] pl-7">
                  {useCase.details}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
