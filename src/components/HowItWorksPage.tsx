import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Link2, Sparkles, Share2, CheckCircle2, ArrowLeft } from "lucide-react";

export const HowItWorksPage: React.FC = () => {
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const steps = [
    {
      id: "step-1",
      num: "01",
      title: "Input & Source Selection",
      icon: Link2,
      description: "Paste your destination URL or copy your post content. Smyl instantly parses and fetches rich metadata (Open Graph tags, title, description, and visual assets) in milliseconds directly from the live web.",
      details: [
        "Real-time URL parsing",
        "Automated Open Graph tag retrieval",
        "Fallback asset handling for zero-tag sites"
      ]
    },
    {
      id: "step-2",
      num: "02",
      title: "Dynamic Visual Tuning",
      icon: Sparkles,
      description: "Tailor the aesthetics to fit your brand identity perfectly. Select professional backdrop gradients, configure high-contrast color palettes, edit text copy in-line, toggle engagement metrics, and pick from clean typography options.",
      details: [
        "Interactive canvas customization",
        "Premium Ocean, Sunset, & Sunset backdrops",
        "Direct inline typography & size edits"
      ]
    },
    {
      id: "step-3",
      num: "03",
      title: "Instant White-Label Export",
      icon: Share2,
      description: "Generate and download pristine, high-resolution visual cards. Smyl supports watermark-free exports in PNG and SVG vector formats. Your customized links are fully optimized to grab eyes and boost click-throughs.",
      details: [
        "Watermark-free high-res downloads",
        "Multiple export formats (PNG, SVG)",
        "Optimized sharing for LinkedIn & X"
      ]
    }
  ];

  return (
    <div id="how-it-works-page" className="bg-[#EDF1F5] min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8 text-left">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Back navigation */}
        <div id="how-it-works-back-nav">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#626A73] hover:text-[#0145F2] font-semibold text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Hero title block */}
        <div id="how-it-works-hero-header" className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#17191C] tracking-[-0.03em] leading-tight">
            How Smyl Works
          </h1>
          <p className="text-lg text-[#626A73] max-w-2xl leading-relaxed">
            Smyl bridges the gap between raw links and eye-catching visual cards. Learn how our technology turns everyday bookmarks into premium sharing assets.
          </p>
        </div>

        {/* Process Flow Cards */}
        <div id="how-it-works-process-list" className="space-y-6">
          {steps.map((step, idx) => {
            const IconComponent = step.icon;
            return (
              <div
                key={step.id}
                id={`how-it-works-card-${step.id}`}
                className="bg-white border border-[#E1E5E9] rounded-3xl p-6 sm:p-10 shadow-xs flex flex-col md:flex-row gap-6 md:gap-10 hover:shadow-md transition-all duration-300"
              >
                {/* Visual Number Indicator */}
                <div className="flex items-center justify-between md:flex-col md:justify-start shrink-0">
                  <span className="text-5xl font-extrabold text-[#E1E5E9] tracking-tight md:mb-4 leading-none">
                    {step.num}
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-[#E8EEFF] text-[#0145F2] flex items-center justify-center">
                    <IconComponent className="w-6 h-6" />
                  </div>
                </div>

                {/* Text explanation */}
                <div className="space-y-4 flex-1">
                  <h2 className="text-2xl font-bold text-[#17191C] tracking-tight">
                    {step.title}
                  </h2>
                  <p className="text-[#626A73] leading-relaxed text-[15px]">
                    {step.description}
                  </p>

                  {/* Bullet specifics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {step.details.map((detail, dIdx) => (
                      <div
                        key={dIdx}
                        className="flex items-center gap-2 text-xs font-semibold text-[#17191C]"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#0145F2] shrink-0" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action Banner */}
        <div
          id="how-it-works-cta-banner"
          className="bg-gradient-to-tr from-[#0145F2] to-[#0039D4] rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-md relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent)] pointer-events-none" />
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to stand out in the feed?
            </h3>
            <p className="text-white/80 text-[15px] leading-relaxed">
              Ditch default gray metadata boxes. Level up your reach with custom visual brand assets. Free to use, no account required to try.
            </p>
          </div>
          <div className="flex justify-center pt-2 relative z-10">
            <Link
              to="/tools/post-card-studio"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-white text-[#0145F2] font-bold text-sm shadow-sm hover:bg-[#F5F7F9] transition-all"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
