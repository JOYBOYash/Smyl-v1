import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { BLOG_POSTS } from "./BlogHub";
import { IoTimeOutline, IoArrowBackOutline, IoChevronForward, IoCalendarOutline, IoCreate, IoLink } from "react-icons/io5";

interface PostContentMap {
  title: string;
  body: React.ReactNode;
}

const POSTS_CONTENT: Record<string, PostContentMap> = {
  "influence-open-graph-tags-ctr": {
    title: "How Open Graph Tags Influence Your Click-Through Rates",
    body: (
      <div className="space-y-6 text-[#17191C] text-base leading-relaxed">
        <p>
          In the modern digital landscape, sharing links on social media is a core channel for organic discovery and customer acquisition. However, simply copying and pasting a URL into a feed editor is no longer sufficient. To optimize how your web pages are presented, you must master the <strong>Open Graph Protocol</strong>.
        </p>

        <h2 className="text-[24px] font-bold tracking-tight text-[#17191C] pt-4">1. What is the Open Graph Protocol?</h2>
        <p>
          Originally developed by Facebook in 2010, the Open Graph Protocol (OG) establishes a standardized set of meta tags that website administrators embed inside their HTML <code>&lt;head&gt;</code> blocks. These tags turn any standard web page into a rich object in a social graph, providing crawlers with exact, structured metadata to render.
        </p>
        <p>
          Without these instructions, social platform scraper bots (such as LinkedIn’s <code>LinkedInBot</code> or Twitter’s <code>Twitterbot</code>) are forced to guess. They randomly select title texts, snatch the first available square graphic asset, or clip arbitrary paragraph text. The result is often an unpolished share preview that users scroll past.
        </p>

        <h2 className="text-[24px] font-bold tracking-tight text-[#17191C] pt-4">2. The Crucial OG Meta Tags</h2>
        <p>
          To maintain absolute control of how your links render across LinkedIn, X, Slack, and Discord, you must correctly configure these five foundational tags:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong><code>og:title</code></strong>: The headline of your page (keep it under 60 characters for optimal, non-truncated social display).</li>
          <li><strong><code>og:description</code></strong>: A brief summary of the content (recommended between 110-150 characters).</li>
          <li><strong><code>og:image</code></strong>: The URL of the visual card that acts as the preview cover (typically a 1.91:1 ratio, e.g. 1200 x 630 pixels).</li>
          <li><strong><code>og:url</code></strong>: The canonical URL of the page (helps consolidate link equity and social shares).</li>
          <li><strong><code>og:type</code></strong>: The type of media object (usually <code>website</code>, <code>article</code>, or <code>profile</code>).</li>
        </ul>

        <h2 className="text-[24px] font-bold tracking-tight text-[#17191C] pt-4">3. Common Traps & Cache Bottlenecks</h2>
        <p>
          Many marketing teams update their OG tags only to find that social networks continue displaying old cached images. LinkedIn and X aggressively cache meta tags to reduce bandwidth. To clear these bottlenecks, use diagnostic crawlers and validation inspectors to refresh scraper memories:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>LinkedIn Post Inspector</strong>: Forces LinkedIn’s crawler to refetch the URL’s head markup and display the newly saved asset.</li>
          <li><strong>Smyl OG Inspector</strong>: Our secure client-side debugger checks redirect counts, evaluates image SSL safety, and lists exact raw tag structures in an elegant console view.</li>
        </ul>

        <p className="pt-4 font-semibold">
          Don't lose traffic to poor, guessed visual cards. Audit your URLs using Smyl's Open Graph Inspector before every campaign launch.
        </p>
      </div>
    ),
  },
  "linkedin-personal-brand-visual-strategy": {
    title: "The Strategy Behind High-Converting Personal Brands on LinkedIn",
    body: (
      <div className="space-y-6 text-[#17191C] text-base leading-relaxed">
        <p>
          LinkedIn is no longer a static repository for resumes. Today, it stands as the preeminent personal branding and B2B lead generation search platform. However, because the feed is flooded with plain text paragraphs and dry corporate links, standing out requires a deliberate <strong>visual content strategy</strong>.
        </p>

        <h2 className="text-[24px] font-bold tracking-tight text-[#17191C] pt-4">1. The 'Scroll-Stopper' visual advantage</h2>
        <p>
          When users scroll through a busy LinkedIn feed on mobile devices, their eyes move rapidly. Studies show that visual content (images, PDFs, carousel sliders) captures attention 2.5x faster than raw text blocks. But how do you introduce visuals if you aren't a professional graphic designer or illustrator?
        </p>
        <p>
          This is where post cards excel. By taking your best text insights, quotes, or tweet threads and packaging them inside elegant, high-contrast visual container canvases with stylized gradient backdrops, you instantly claim major visual real estate in the feed.
        </p>

        <h2 className="text-[24px] font-bold tracking-tight text-[#17191C] pt-4">2. Typography Pairings & Brand Recall</h2>
        <p>
          Visual authority is built on typography consistency. The fonts you select establish a psychological tone before the reader absorbs the first word:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Serif (e.g., Lora, Playfair)</strong>: Establishes a classic, authoritative, editorial vibe. Perfect for analytical, intellectual, or highly structured industry essays.</li>
          <li><strong>Clean Sans (e.g., Inter, DM Sans)</strong>: Delivers an ultra-modern, crisp, and high-tech feel. Highly readable on mobile screens.</li>
          <li><strong>Monospace (e.g., JetBrains Mono)</strong>: Gives an authentic, developer-friendly, engineering aesthetic. Great for sharing code snippets or shipping updates.</li>
        </ul>

        <h2 className="text-[24px] font-bold tracking-tight text-[#17191C] pt-4">3. Combining Content with Action</h2>
        <p>
          A beautiful post card is just the top of your marketing funnel. Once you stop the scroll, direct your audience to your primary call-to-action. Embed a trackable short link or customized QR code within your comments or biography section to convert that traffic into newsletter subscribers or lead prospects.
        </p>

        <p className="pt-4 font-semibold">
          By combining Smyl's Post Card Studio with our Link Hub landing builder, startup founders can capture, visual-brand, and track personal brand traction seamlessly.
        </p>
      </div>
    ),
  },
  "utm-campaign-tagging-naming-best-practices": {
    title: "Campaign UTM Tagging Naming Conventions and Best Practices",
    body: (
      <div className="space-y-6 text-[#17191C] text-base leading-relaxed">
        <p>
          If you don't know where your traffic is coming from, you cannot optimize your marketing channels. For modern marketers, <strong>UTM parameters</strong> are the standard telemetry framework for website attribution. Yet, many teams fail to implement standard conventions, leading to fragmented or unreadable dashboard reporting.
        </p>

        <h2 className="text-[24px] font-bold tracking-tight text-[#17191C] pt-4">1. Demystifying the Five Core UTM Fields</h2>
        <p>
          Urchin Tracking Monitor (UTM) parameters are simple key-value suffixes attached to a canonical URL. When a user clicks the link, web analytics suites (such as Google Analytics or Plausible) parse these values automatically:
        </p>
        <ul className="list-disc pl-5 space-y-2.5">
          <li><strong><code>utm_source</code></strong>: Identifies the specific platform or publisher sending the traffic (e.g., <code>newsletter</code>, <code>linkedin</code>, <code>twitter</code>).</li>
          <li><strong><code>utm_medium</code></strong>: Identifies the marketing channel or vehicle (e.g., <code>cpc</code>, <code>email</code>, <code>social</code>).</li>
          <li><strong><code>utm_campaign</code></strong>: Identifies the overall promotion or product campaign (e.g., <code>summer_sale</code>, <code>launch_v2</code>).</li>
          <li><strong><code>utm_term</code></strong>: Typically used to identify paid search keywords, or specifically target audience cohorts.</li>
          <li><strong><code>utm_content</code></strong>: Helps differentiate varying creative assets or button locations on a single page (e.g., <code>top_banner</code>, <code>footer_cta</code>).</li>
        </ul>

        <h2 className="text-[24px] font-bold tracking-tight text-[#17191C] pt-4">2. The Golden Rules of Tag Consistency</h2>
        <p>
          To maintain absolute data integrity inside your databases and reporting tools, enforce these strict guidelines across your entire growth team:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Always Use Lowercase</strong>: Analytics engines are case-sensitive. Traffic with <code>utm_source=Linkedin</code> and <code>utm_source=linkedin</code> will render in separate rows, corrupting your metrics.</li>
          <li><strong>Replace Spaces with Hyphens or Underscores</strong>: Spaces in links convert to messy URL-escaped structures like <code>%20</code>. Use underscores for consistency (e.g., <code>spring_promo</code>).</li>
          <li><strong>Keep it Simple & Factual</strong>: Do not insert sensitive information, internal terms, or credentials inside public UTM tags.</li>
        </ul>

        <h2 className="text-[24px] font-bold tracking-tight text-[#17191C] pt-4">3. Streamline Link Shortening</h2>
        <p>
          Long, UTM-stuffed URLs look bulky and untrustworthy in feed posts. Once you build your canonical trackable URL using Smyl's UTM builder, immediately shorten it with our integrated Link Shortener to share a clean, high-performing path.
        </p>

        <p className="pt-4 font-semibold">
          Standardize your team's tracking workflow. Leverage Smyl's UTM Builder to guarantee clean, structured UTM formats every time.
        </p>
      </div>
    ),
  },
  "custom-qr-codes-resurgence-growth-playbooks": {
    title: "Why Custom QR Codes are Resurging in Modern Growth Playbooks",
    body: (
      <div className="space-y-6 text-[#17191C] text-base leading-relaxed">
        <p>
          Quick Response (QR) codes have transitioned from niche tech novelties to absolute essentials for modern multi-device campaigns. Bridge the gap between offline physical interactions and digital, trackable conversions with beautiful, responsive, and brand-coherent <strong>QR Vector Systems</strong>.
        </p>

        <h2 className="text-[24px] font-bold tracking-tight text-[#17191C] pt-4">1. The Shift to High-Quality Custom Branded QRs</h2>
        <p>
          Traditional QR codes are generic, harsh black-and-white pixel grids. Today’s consumers expect higher design standards. Standard designs can cause visual friction in premium branding layouts.
        </p>
        <p>
          By generating custom QR codes with rounded corners, custom block colors (e.g., matching your brand primary blue), and adjusted quiet-zone spacing, you align these interactive triggers with your overall branding guidelines, increasing scanning conversions by up to 34%.
        </p>

        <h2 className="text-[24px] font-bold tracking-tight text-[#17191C] pt-4">2. Best Practices for Error Correction & Scan Reliability</h2>
        <p>
          QR codes utilize Reed-Solomon error correction matrices, which allow scanner apps to read the code even if a portion of the code is obscured, dirty, or stylized. However, to guarantee 100% scan reliability:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Maintain High Contrast</strong>: Ensure a clear luminance difference between the pixel blocks and the background. Avoid very light gray blocks on white canvas surfaces.</li>
          <li><strong>Respect the Quiet Zone</strong>: Provide comfortable white space around the QR perimeter to allow mobile cameras to isolate the pattern quickly.</li>
          <li><strong>Optimize Payload Density</strong>: Shorter URLs produce simpler, cleaner QR grids that scan faster at a distance. Always shorten long URLs before generating QR vectors.</li>
        </ul>

        <h2 className="text-[24px] font-bold tracking-tight text-[#17191C] pt-4">3. Real-world Offline Attribution Loops</h2>
        <p>
          Whether printing QR codes on conference badges, billboard graphics, business cards, or packaging boxes, combine them with unique UTM campaign parameters. This enables you to measure and compare exactly which offline locations or materials drive the highest digital engagement.
        </p>

        <p className="pt-4 font-semibold">
          Don't settle for generic, unbranded scan codes. Generate pristine vector QR codes matched to your design system with Smyl.
        </p>
      </div>
    ),
  },
};

export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const currentSlug = slug || "";
  const postMeta = BLOG_POSTS.find((p) => p.slug === currentSlug);
  const postContent = POSTS_CONTENT[currentSlug];

  if (!postMeta || !postContent) {
    return (
      <div className="bg-[#EDF1F5] min-h-screen py-24 px-4 text-center space-y-6">
        <p className="text-sm font-semibold text-rose-600">Article not found</p>
        <h1 className="text-[32px] sm:text-[48px] font-bold text-[#17191C]">Could not locate strategic guide</h1>
        <button
          onClick={() => navigate("/blog")}
          className="h-10 px-5 rounded-lg bg-brand-primary text-white font-semibold text-xs hover:bg-brand-hover cursor-pointer"
        >
          Return to Blog
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#EDF1F5] min-h-screen py-12 px-4 sm:px-6 lg:px-8 text-left">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Back Link */}
        <button
          onClick={() => {
            navigate("/blog");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="group text-xs sm:text-[14px] font-semibold text-[#626A73] hover:text-[#17191C] flex items-center gap-2 transition-colors cursor-pointer"
        >
          <IoArrowBackOutline className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to All Articles</span>
        </button>

        {/* Article Metadata Layout */}
        <div className="space-y-6 bg-white border border-[#E1E5E9] rounded-3xl p-6 sm:p-10 shadow-xs">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[#626A73]">
            <span className="text-[#0145F2] font-bold bg-[#E8EEFF] px-2.5 py-1 rounded-lg">
              {postMeta.category}
            </span>
            <span className="flex items-center gap-1.5">
              <IoTimeOutline className="w-4 h-4" />
              <span>{postMeta.readingTime}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <IoCalendarOutline className="w-4 h-4" />
              <span>{postMeta.publishedAt}</span>
            </span>
          </div>

          <h1 className="text-[32px] sm:text-[40px] leading-tight font-[800] text-[#17191C] tracking-[-0.03em]">
            {postContent.title}
          </h1>

          {/* Author info */}
          <div className="flex items-center gap-3.5 pt-4 border-t border-[#ECEEF1]">
            <img
              src={postMeta.author.avatar}
              alt={postMeta.author.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-semibold text-[#17191C]">{postMeta.author.name}</p>
              <p className="text-xs text-[#626A73]">{postMeta.author.role}</p>
            </div>
          </div>
        </div>

        {/* Main Content Body */}
        <article className="bg-white border border-[#E1E5E9] rounded-3xl p-6 sm:p-10 shadow-xs">
          {postContent.body}
        </article>

        {/* Dynamic CTA at Bottom */}
        <div className="bg-[#E8EEFF] border border-[#0145F2]/20 rounded-3xl p-8 text-center space-y-4">
          <h3 className="text-[20px] font-semibold text-[#17191C]">
            Ready to optimize your share assets?
          </h3>
          <p className="text-xs sm:text-[14px] text-[#626A73] max-w-xl mx-auto">
            Design beautiful visual posts, audit open graph tags, shorten urls, and generate customized brand QR codes. All on one secure, fast dashboard.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                navigate("/tools/post-card-studio");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="h-10 px-5 rounded-lg bg-[#0145F2] text-white font-semibold text-xs hover:bg-[#0039D4] active:bg-[#0030B8] transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <IoCreate className="w-4 h-4" />
              <span>Launch Card Studio</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
