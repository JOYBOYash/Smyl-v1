import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { IoBookOutline, IoTimeOutline, IoArrowForwardOutline } from "react-icons/io5";

export interface BlogPostData {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readingTime: string;
  publishedAt: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
}

export const BLOG_POSTS: BlogPostData[] = [
  {
    slug: "influence-open-graph-tags-ctr",
    title: "How Open Graph Tags Influence Your Click-Through Rates",
    excerpt: "A complete strategic guide to understanding Open Graph meta properties, social preview card rendering, and diagnostic metadata inspection to optimize feed distribution.",
    category: "Metadata SEO",
    readingTime: "5 min read",
    publishedAt: "Aug 22, 2026",
    author: {
      name: "Morgan Leigh",
      role: "SEO Architect",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    },
  },
  {
    slug: "linkedin-personal-brand-visual-strategy",
    title: "The Strategy Behind High-Converting Personal Brands on LinkedIn",
    excerpt: "How leading startup founders and creators leverage visual typography, crisp layouts, and post cards to command visual real estate, boost engagement, and drive newsletter subscribers.",
    category: "Growth Branding",
    readingTime: "7 min read",
    publishedAt: "Aug 18, 2026",
    author: {
      name: "Marcus Drake",
      role: "Founder, Smyl",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
  },
  {
    slug: "utm-campaign-tagging-naming-best-practices",
    title: "Campaign UTM Tagging Naming Conventions and Best Practices",
    excerpt: "Avoid fragmented analytics data. Implement standard campaign naming rules for UTM source, medium, and term parameters to measure your visual click-through rates precisely.",
    category: "Campaign Analytics",
    readingTime: "4 min read",
    publishedAt: "Aug 12, 2026",
    author: {
      name: "Sarah Jenkins",
      role: "Growth Marketer",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  },
  {
    slug: "custom-qr-codes-resurgence-growth-playbooks",
    title: "Why Custom QR Codes are Resurging in Modern Growth Playbooks",
    excerpt: "Offline-to-online attribution is essential for physical campaigns. Learn how to design elegant QR codes that align with your branding guidelines and track conversions flawlessly.",
    category: "Digital Marketing",
    readingTime: "6 min read",
    publishedAt: "Aug 05, 2026",
    author: {
      name: "Alex Rivera",
      role: "Product Designer",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    },
  },
];

export const BlogHub: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#EDF1F5] min-h-screen py-16 px-4 sm:px-6 lg:px-8 text-left">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header Block */}
        <div className="space-y-4 max-w-3xl">
          <span className="text-xs uppercase font-bold tracking-widest text-[#0145F2] bg-[#E8EEFF] px-3 py-1.5 rounded-lg inline-block">
            Resources & Blog
          </span>
          <h1 className="text-[32px] sm:text-[64px] leading-tight sm:leading-[1.05] font-[800] text-[#17191C] tracking-[-0.04em]">
            Branding, Tracking & SEO Strategy Guides
          </h1>
          <p className="text-[#626A73] text-[18px] leading-[1.6] font-normal">
            Actionable insights, deep dives, and expert tutorials on visual asset generation, social link shorteners, Open Graph optimization, and offline attribution playbooks.
          </p>
        </div>

        {/* Featured Post */}
        {BLOG_POSTS.length > 0 && (
          <div className="bg-white border border-[#E1E5E9] rounded-3xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-xs">
            <div className="lg:col-span-8 space-y-5">
              <div className="flex items-center gap-3 text-xs font-semibold text-[#626A73]">
                <span className="text-[#0145F2] font-bold bg-[#E8EEFF] px-2 py-1 rounded">
                  {BLOG_POSTS[0].category}
                </span>
                <span className="flex items-center gap-1.5">
                  <IoTimeOutline className="w-3.5 h-3.5" />
                  <span>{BLOG_POSTS[0].readingTime}</span>
                </span>
                <span>•</span>
                <span>{BLOG_POSTS[0].publishedAt}</span>
              </div>
              <h2 className="text-[24px] sm:text-[36px] leading-tight font-[700] text-[#17191C] tracking-[-0.025em] hover:text-[#0145F2] cursor-pointer transition-colors"
                  onClick={() => navigate(`/blog/${BLOG_POSTS[0].slug}`)}>
                {BLOG_POSTS[0].title}
              </h2>
              <p className="text-[#626A73] text-[15px] sm:text-[16px] leading-[1.5] font-normal">
                {BLOG_POSTS[0].excerpt}
              </p>
              <div className="flex items-center gap-3 pt-2">
                <img
                  src={BLOG_POSTS[0].author.avatar}
                  alt={BLOG_POSTS[0].author.name}
                  className="w-8 h-8 rounded-full object-cover border border-[#E1E5E9]"
                />
                <div>
                  <p className="text-xs font-semibold text-[#17191C]">{BLOG_POSTS[0].author.name}</p>
                  <p className="text-[10px] text-[#626A73]">{BLOG_POSTS[0].author.role}</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <button
                onClick={() => {
                  navigate(`/blog/${BLOG_POSTS[0].slug}`);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="h-11 px-6 rounded-lg bg-[#0145F2] text-white font-semibold text-xs hover:bg-[#0039D4] active:bg-[#0030B8] transition-colors cursor-pointer shadow-sm shadow-brand-primary/10 flex items-center gap-2"
              >
                <span>Read Featured Article</span>
                <IoArrowForwardOutline className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {BLOG_POSTS.slice(1).map((post) => (
            <div
              key={post.slug}
              className="bg-white border border-[#E1E5E9] rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#626A73]">
                  <span className="text-[#0145F2] font-bold bg-[#E8EEFF] px-2 py-0.5 rounded">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <IoTimeOutline className="w-3 h-3" />
                    <span>{post.readingTime}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base sm:text-[18px] font-semibold text-[#17191C] leading-[1.3] group-hover:text-[#0145F2] cursor-pointer transition-colors"
                      onClick={() => navigate(`/blog/${post.slug}`)}>
                    {post.title}
                  </h3>
                  <p className="text-xs sm:text-[14px] text-[#626A73] leading-[1.5] font-normal line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-[#ECEEF1] mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-[11px] font-semibold text-[#17191C]">{post.author.name}</p>
                    <p className="text-[9px] text-[#626A73]">{post.author.role}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    navigate(`/blog/${post.slug}`);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="p-1.5 text-[#0145F2] hover:text-[#0039D4] hover:bg-[#E8EEFF] rounded-lg transition-colors cursor-pointer"
                  title="Read Article"
                >
                  <IoArrowForwardOutline className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
