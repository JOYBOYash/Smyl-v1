import React from "react";
import { Link } from "react-router-dom";
import { SmylLogo } from "./SmylLogo";
import {
  FaXTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaFacebookF,
  FaMedium,
} from "react-icons/fa6";
import { IoArrowForwardOutline } from "react-icons/io5";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[#E1E5E9] pt-16 pb-12 text-[#626A73] text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-12 pb-12 border-b border-[#ECEEF1]">
          {/* Column 1: Brand & Identity Block */}
          <div className="col-span-2 md:col-span-4 space-y-5 text-left">
            <Link
              to="/"
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0145F2]/20 rounded-md inline-block"
              aria-label="Smyl Home"
            >
              <SmylLogo className="h-6 w-auto text-[#0145F2]" />
            </Link>
            <p className="text-[16px] sm:text-[18px] text-[#626A73] font-normal leading-[1.6]">
              Share your links. Make them worth sharing.
            </p>
            <div className="pt-2">
              <Link
                to="/tools/post-card-studio"
                className="h-10 px-5 rounded-lg bg-[#0145F2] text-white font-semibold text-xs inline-flex items-center justify-center gap-1.5 hover:bg-[#0039D4] active:bg-[#0030B8] transition-all cursor-pointer shadow-xs shadow-brand-primary/10"
              >
                <span>Create with Smyl</span>
                <IoArrowForwardOutline className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Accessible Social Navigation */}
            <nav aria-label="Social links" className="flex items-center gap-4 pt-2">
              <a
                href="https://x.com"
                target="_blank"
                referrerPolicy="no-referrer"
                rel="noopener noreferrer"
                aria-label="X (formerly Twitter)"
                className="p-1.5 rounded-md hover:text-[#0145F2] transition-colors"
              >
                <FaXTwitter className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                referrerPolicy="no-referrer"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-1.5 rounded-md hover:text-[#0145F2] transition-colors"
              >
                <FaInstagram className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                referrerPolicy="no-referrer"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="p-1.5 rounded-md hover:text-[#0145F2] transition-colors"
              >
                <FaLinkedinIn className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                referrerPolicy="no-referrer"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="p-1.5 rounded-md hover:text-[#0145F2] transition-colors"
              >
                <FaYoutube className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                referrerPolicy="no-referrer"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="p-1.5 rounded-md hover:text-[#0145F2] transition-colors"
              >
                <FaFacebookF className="w-4 h-4" />
              </a>
              <a
                href="https://medium.com"
                target="_blank"
                referrerPolicy="no-referrer"
                rel="noopener noreferrer"
                aria-label="Medium"
                className="p-1.5 rounded-md hover:text-[#0145F2] transition-colors"
              >
                <FaMedium className="w-4 h-4" />
              </a>
            </nav>
          </div>

          {/* Column 2: Product Navigation */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <h3 className="text-[14px] font-semibold tracking-wider text-[#17191C] uppercase">
              Product
            </h3>
            <nav aria-label="Product links">
              <ul className="space-y-2.5">
                <li>
                  <Link
                    to="/tools/post-card-studio"
                    className="text-xs sm:text-[14px] font-semibold text-[#626A73] hover:text-[#0145F2] transition-colors"
                  >
                    Post Card Studio
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tools/link-shortener"
                    className="text-xs sm:text-[14px] font-semibold text-[#626A73] hover:text-[#0145F2] transition-colors"
                  >
                    Link Shortener
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tools/qr-generator"
                    className="text-xs sm:text-[14px] font-semibold text-[#626A73] hover:text-[#0145F2] transition-colors"
                  >
                    QR Generator
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tools/link-hub"
                    className="text-xs sm:text-[14px] font-semibold text-[#626A73] hover:text-[#0145F2] transition-colors"
                  >
                    Link Hub Space
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Column 3: Solutions Navigation */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <h3 className="text-[14px] font-semibold tracking-wider text-[#17191C] uppercase">
              Solutions
            </h3>
            <nav aria-label="Solutions links">
              <ul className="space-y-2.5">
                <li>
                  <Link
                    to="/for/creators"
                    className="text-xs sm:text-[14px] font-semibold text-[#626A73] hover:text-[#0145F2] transition-colors"
                  >
                    For Creators
                  </Link>
                </li>
                <li>
                  <Link
                    to="/for/marketers"
                    className="text-xs sm:text-[14px] font-semibold text-[#626A73] hover:text-[#0145F2] transition-colors"
                  >
                    For Marketers
                  </Link>
                </li>
                <li>
                  <Link
                    to="/for/founders"
                    className="text-xs sm:text-[14px] font-semibold text-[#626A73] hover:text-[#0145F2] transition-colors"
                  >
                    For Founders
                  </Link>
                </li>
                <li>
                  <Link
                    to="/for/agencies"
                    className="text-xs sm:text-[14px] font-semibold text-[#626A73] hover:text-[#0145F2] transition-colors"
                  >
                    For Agencies
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Column 4: Resources Navigation */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <h3 className="text-[14px] font-semibold tracking-wider text-[#17191C] uppercase">
              Resources
            </h3>
            <nav aria-label="Resources links">
              <ul className="space-y-2.5">
                <li>
                  <Link
                    to="/tools"
                    className="text-xs sm:text-[14px] font-semibold text-[#626A73] hover:text-[#0145F2] transition-colors"
                  >
                    All Tools Hub
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog"
                    className="text-xs sm:text-[14px] font-semibold text-[#626A73] hover:text-[#0145F2] transition-colors"
                  >
                    Strategy Blog
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tools/social-previewer"
                    className="text-xs sm:text-[14px] font-semibold text-[#626A73] hover:text-[#0145F2] transition-colors"
                  >
                    Social Previewer
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tools/screenshot-generator"
                    className="text-xs sm:text-[14px] font-semibold text-[#626A73] hover:text-[#0145F2] transition-colors"
                  >
                    Web Screenshot
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Column 5: Utility Diagnostics */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <h3 className="text-[14px] font-semibold tracking-wider text-[#17191C] uppercase">
              Utility
            </h3>
            <nav aria-label="Utility diagnostic links">
              <ul className="space-y-2.5">
                <li>
                  <Link
                    to="/tools/og-debugger"
                    className="text-xs sm:text-[14px] font-semibold text-[#626A73] hover:text-[#0145F2] transition-colors"
                  >
                    OG Tag Debugger
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tools/utm-builder"
                    className="text-xs sm:text-[14px] font-semibold text-[#626A73] hover:text-[#0145F2] transition-colors"
                  >
                    UTM Builder
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Lower Footer Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[14px] text-[#8D959F] font-normal">
            &copy; {new Date().getFullYear()} Smyl Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-[14px] font-semibold">
            <Link
              to="/privacy"
              className="text-[#626A73] hover:text-[#0145F2] transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-[#626A73] hover:text-[#0145F2] transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
