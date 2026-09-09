import React from "react";
import { Link } from "react-router-dom";
import { IoArrowBackOutline, IoDocumentTextOutline, IoInformationCircleOutline } from "react-icons/io5";

export const TermsOfService: React.FC = () => {
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
              <IoDocumentTextOutline className="w-5 h-5" />
              <span className="text-xs uppercase font-bold tracking-widest">Platform Agreement</span>
            </div>
            <h1 className="text-[32px] sm:text-[40px] leading-tight font-[800] text-[#17191C] tracking-[-0.03em]">
              Terms of Service
            </h1>
            <p className="text-xs sm:text-[14px] text-[#8D959F] font-medium">
              Last updated: September 9, 2026
            </p>
          </div>

          <div className="prose prose-slate max-w-none text-[#626A73] space-y-6 text-sm sm:text-[15px] leading-[1.6]">
            <p className="text-[16px] text-[#17191C] font-semibold">
              Welcome to Smyl. By accessing or using our link hub creator, postcard customizers, QR engines, or associated services, you agree to comply with and be bound by these Terms.
            </p>

            <section className="space-y-3 pt-4">
              <h2 className="text-[18px] sm:text-[20px] font-bold text-[#17191C] tracking-tight">
                1. Acceptance of Terms
              </h2>
              <p>
                By interacting with Smyl, you create a legally binding agreement with us. If you do not accept these provisions, you must immediately cease accessing all Smyl utilities, platforms, and pages.
              </p>
            </section>

            <section className="space-y-3 pt-4">
              <h2 className="text-[18px] sm:text-[20px] font-bold text-[#17191C] tracking-tight">
                2. Acceptable Platform Use
              </h2>
              <p>
                Smyl is designed to empower content creators, founders, growth teams, and digital builders. You represent and warrant that:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>You will not use Smyl to distribute malware, phishing schemes, illegal resources, or copyrighted contents without proper licensing.</li>
                <li>You will not leverage bots or automated scrapers to artificially query or overload our URL redirection endpoints.</li>
                <li>Your customized post card texts, graphics, and custom branding variables will respect standard decency and copyright frameworks.</li>
              </ul>
            </section>

            <section className="space-y-3 pt-4">
              <h2 className="text-[18px] sm:text-[20px] font-bold text-[#17191C] tracking-tight">
                3. Intellectual Property
              </h2>
              <p>
                The Smyl platform, logos, core layouts, styling logic, dynamic workspace modules, and associated branding assets are the exclusive property of Smyl Inc. You retain ownership of individual link data and original copywriting loaded or stored in your user-authored workspaces.
              </p>
            </section>

            <section className="space-y-3 pt-4">
              <h2 className="text-[18px] sm:text-[20px] font-bold text-[#17191C] tracking-tight">
                4. Disclaimer of Warranties
              </h2>
              <p>
                Smyl is provided on an "as-is" and "as-available" basis. We offer no warranties, express or implied, regarding link up-time, data persistence, canvas output rendering consistency, or search engine ranking outcomes.
              </p>
            </section>

            <section className="space-y-3 pt-4">
              <h2 className="text-[18px] sm:text-[20px] font-bold text-[#17191C] tracking-tight">
                5. Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by applicable frameworks, Smyl Inc. shall not be liable for any indirect, consequential, or incidental losses arising from service disruptions, missing database tracking indices, or incorrect Open Graph previews.
              </p>
            </section>
          </div>

          <div className="border-t border-[#ECEEF1] pt-6 flex items-center justify-between text-xs text-[#8D959F]">
            <span className="flex items-center gap-1">
              <IoInformationCircleOutline className="w-3.5 h-3.5" />
              Smyl Platform Agreement
            </span>
            <span>Contact: legal@smyl.co</span>
          </div>
        </div>
      </div>
    </div>
  );
};
