import React from "react";
import { Link } from "react-router-dom";
import { IoArrowBackOutline, IoLockClosedOutline, IoShieldCheckmarkOutline } from "react-icons/io5";

export const PrivacyPolicy: React.FC = () => {
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="bg-[#EDF1F5] min-h-screen py-16 px-4 sm:px-6 lg:px-8 text-left">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Back Link */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#626A73] hover:text-[#0145F2] font-semibold text-[14px] transition-colors"
          >
            <IoArrowBackOutline className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Content Card */}
        <div className="bg-white border border-[#E1E5E9] rounded-3xl p-8 sm:p-12 shadow-xs space-y-8">
          <div className="border-b border-[#ECEEF1] pb-6 space-y-3">
            <div className="flex items-center gap-2 text-[#0145F2]">
              <IoShieldCheckmarkOutline className="w-5 h-5" />
              <span className="text-xs uppercase font-bold tracking-widest">Trust & Security</span>
            </div>
            <h1 className="text-[32px] sm:text-[40px] leading-tight font-[800] text-[#17191C] tracking-[-0.03em]">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-[14px] text-[#8D959F] font-medium">
              Last updated: September 9, 2026
            </p>
          </div>

          <div className="prose prose-slate max-w-none text-[#626A73] space-y-6 text-sm sm:text-[15px] leading-[1.6]">
            <p className="text-[16px] text-[#17191C] font-semibold">
              At Smyl, we believe in radical privacy and utility. This Policy explains how we protect your information in our privacy-first link customization environment.
            </p>

            <section className="space-y-3 pt-4">
              <h2 className="text-[18px] sm:text-[20px] font-bold text-[#17191C] tracking-tight">
                1. Information We Collect
              </h2>
              <p>
                We minimize data footprint by processing tracking analytics locally where possible. We collect:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Account Information:</strong> If you sign up, we save your email address, avatar, and authentication references.</li>
                <li><strong>Link Metadata:</strong> Destination URLs, customized post card texts, visual themes, and generated QR configurations you build inside Smyl.</li>
                <li><strong>Anonymous Interaction Stats:</strong> Aggregated, non-identifying counts of link views to support your dashboard statistics.</li>
              </ul>
            </section>

            <section className="space-y-3 pt-4">
              <h2 className="text-[18px] sm:text-[20px] font-bold text-[#17191C] tracking-tight">
                2. How We Use Your Information
              </h2>
              <p>
                We do not sell, license, or rent your database records to advertising third parties. We use your variables to:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Deliver interactive link redirection workspaces and customized post cards.</li>
                <li>Track client-centric social previews and debug OG metadata tags.</li>
                <li>Maintain the continuous security, speed, and health of the Smyl microservices.</li>
              </ul>
            </section>

            <section className="space-y-3 pt-4">
              <h2 className="text-[18px] sm:text-[20px] font-bold text-[#17191C] tracking-tight">
                3. Cookies and Browser Cache
              </h2>
              <p>
                Smyl leverages client-side storage technologies (such as standard browser cache, LocalStorage, and session configurations) to enable smooth offline-first editing of your customized post card previews and draft settings without constant server roundtrips.
              </p>
            </section>

            <section className="space-y-3 pt-4">
              <h2 className="text-[18px] sm:text-[20px] font-bold text-[#17191C] tracking-tight">
                4. Data Security & Storage
              </h2>
              <p>
                We employ standard SSL encryption pipelines across all connection states. While we implement high-integrity infrastructure controls to shield your configurations, no electronic web communication or database system can guarantee absolute 100% invulnerability.
              </p>
            </section>

            <section className="space-y-3 pt-4">
              <h2 className="text-[18px] sm:text-[20px] font-bold text-[#17191C] tracking-tight">
                5. Changes to This Privacy Policy
              </h2>
              <p>
                We may periodically revise this document to match product improvements or regulatory requirements. We will update the top-aligned "Last updated" date to indicate any structural modifications.
              </p>
            </section>
          </div>

          <div className="border-t border-[#ECEEF1] pt-6 flex items-center justify-between text-xs text-[#8D959F]">
            <span className="flex items-center gap-1">
              <IoLockClosedOutline className="w-3.5 h-3.5" />
              Secure Client Sandbox
            </span>
            <span>Contact: support@smyl.co</span>
          </div>
        </div>
      </div>
    </div>
  );
};
