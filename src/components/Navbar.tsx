import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { SmylLogo } from "./SmylLogo";
import {
  IoApps,
  IoChevronDown,
  IoKeypad,
  IoBookmark,
  IoPerson,
  IoLogOut,
  IoClose,
  IoMenu,
  IoLink,
  IoQrCode,
  IoGlobe,
  IoBug,
  IoCompass,
  IoImage,
  IoCreate,
  IoBookOutline,
  IoSparklesOutline,
} from "react-icons/io5";

interface NavbarProps {
  isAuthenticated: boolean;
  user: any;
  profile: any;
  shortcutsEnabled: boolean;
  historyCount: number;
  onSignOut: () => Promise<void>;
  onTriggerAuth: () => void;
  onTriggerOnboarding: () => void;
  onTriggerShortcuts: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isAuthenticated,
  user,
  profile,
  shortcutsEnabled,
  historyCount,
  onSignOut,
  onTriggerAuth,
  onTriggerOnboarding,
  onTriggerShortcuts,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [isSolutionsDropdownOpen, setIsSolutionsDropdownOpen] = useState(false);
  const [isResourcesDropdownOpen, setIsResourcesDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);

  const toolsDropdownRef = useRef<HTMLDivElement>(null);
  const solutionsDropdownRef = useRef<HTMLDivElement>(null);
  const resourcesDropdownRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  // Scroll visibility threshold logic
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsNavVisible(false); // scrolling down
      } else {
        setIsNavVisible(true); // scrolling up
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(target)) {
        setIsProductsDropdownOpen(false);
      }
      if (solutionsDropdownRef.current && !solutionsDropdownRef.current.contains(target)) {
        setIsSolutionsDropdownOpen(false);
      }
      if (resourcesDropdownRef.current && !resourcesDropdownRef.current.contains(target)) {
        setIsResourcesDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on path changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProductsDropdownOpen(false);
    setIsSolutionsDropdownOpen(false);
    setIsResourcesDropdownOpen(false);
    setIsProfileDropdownOpen(false);
  }, [location.pathname]);

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: isNavVisible ? 0 : -85 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="fixed top-3.5 left-0 right-0 z-40 px-4 w-full flex justify-center pointer-events-none"
    >
      <div className="w-full max-w-5xl bg-white/95 backdrop-blur-md border border-[#E1E5E9] shadow-xs rounded-2xl pointer-events-auto transition-all flex flex-col">
        <div className="h-13 w-full px-3.5 sm:px-5 grid grid-cols-3 items-center">
          {/* Logo Brand Link */}
          <div className="flex items-center justify-start">
            <Link to="/" className="flex items-center gap-2.5 select-none group">
              <SmylLogo className="h-6 sm:h-6.5 w-auto text-[#0145F2] transition-transform group-hover:scale-105" />
            </Link>
          </div>

          {/* Desktop Navigation Items (Centered) */}
          <div className="hidden md:flex items-center justify-center gap-6">
            
            {/* Products Dropdown */}
            <div className="relative" ref={toolsDropdownRef}>
              <button
                type="button"
                onClick={() => setIsProductsDropdownOpen(!isProductsDropdownOpen)}
                className={`text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer bg-transparent py-1 px-2.5 rounded-lg ${
                  isProductsDropdownOpen || location.pathname.startsWith("/tools")
                    ? "text-[#0145F2] font-bold bg-[#E8EEFF]/40"
                    : "text-[#626A73] hover:text-[#17191C]"
                }`}
              >
                <IoApps className="w-3.5 h-3.5 shrink-0" />
                <span>Tools</span>
                <IoChevronDown
                  className={`w-3 h-3 text-[#626A73] transition-transform duration-200 shrink-0 ${
                    isProductsDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isProductsDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute left-1/2 -translate-x-1/2 mt-2 w-[540px] bg-white border border-[#E1E5E9] rounded-2xl shadow-xl p-4 z-50 grid grid-cols-2 gap-4"
                  >
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-[#8D959F] uppercase tracking-wider border-b border-[#ECEEF1] pb-1.5">Visuals</p>
                      <div className="space-y-1">
                        <Link
                          to="/tools/post-card-studio"
                          className="p-1.5 rounded-lg flex items-start gap-2 text-left hover:bg-[#F5F7F9]"
                        >
                          <div className="w-6 h-6 rounded bg-[#E8EEFF] text-[#0145F2] flex items-center justify-center shrink-0">
                            <IoCreate className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-bold text-[11px] text-[#17191C]">Post Card Studio</p>
                            <p className="text-[9px] text-[#626A73] truncate">Visual LinkedIn/X card maker</p>
                          </div>
                        </Link>

                        <Link
                          to="/tools/qr-generator"
                          className="p-1.5 rounded-lg flex items-start gap-2 text-left hover:bg-[#F5F7F9]"
                        >
                          <div className="w-6 h-6 rounded bg-[#E8EEFF] text-[#0145F2] flex items-center justify-center shrink-0">
                            <IoQrCode className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-bold text-[11px] text-[#17191C]">QR Code Generator</p>
                            <p className="text-[9px] text-[#626A73] truncate">High quality custom vectors</p>
                          </div>
                        </Link>

                        <Link
                          to="/tools/screenshot-generator"
                          className="p-1.5 rounded-lg flex items-start gap-2 text-left hover:bg-[#F5F7F9]"
                        >
                          <div className="w-6 h-6 rounded bg-[#E8EEFF] text-[#0145F2] flex items-center justify-center shrink-0">
                            <IoImage className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-bold text-[11px] text-[#17191C]">Web Screenshot</p>
                            <p className="text-[9px] text-[#626A73] truncate">Capture URL views instantly</p>
                          </div>
                        </Link>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-[#8D959F] uppercase tracking-wider border-b border-[#ECEEF1] pb-1.5">Links & Analytics</p>
                      <div className="space-y-1">
                        <Link
                          to="/tools/link-shortener"
                          className="p-1.5 rounded-lg flex items-start gap-2 text-left hover:bg-[#F5F7F9]"
                        >
                          <div className="w-6 h-6 rounded bg-[#E8EEFF] text-[#0145F2] flex items-center justify-center shrink-0">
                            <IoLink className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-bold text-[11px] text-[#17191C]">Link Shortener</p>
                            <p className="text-[9px] text-[#626A73] truncate">Shorten URLs and track clicks</p>
                          </div>
                        </Link>

                        <Link
                          to="/tools/link-hub"
                          className="p-1.5 rounded-lg flex items-start gap-2 text-left hover:bg-[#F5F7F9]"
                        >
                          <div className="w-6 h-6 rounded bg-[#E8EEFF] text-[#0145F2] flex items-center justify-center shrink-0">
                            <IoCompass className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-bold text-[11px] text-[#17191C]">Link Hub Space</p>
                            <p className="text-[9px] text-[#626A73] truncate">Personalized analytics profile</p>
                          </div>
                        </Link>

                        <Link
                          to="/tools"
                          className="p-1.5 rounded-lg flex items-start gap-2 text-left hover:bg-[#F5F7F9]"
                        >
                          <div className="w-6 h-6 rounded bg-[#EDF1F5] text-[#626A73] flex items-center justify-center shrink-0">
                            <IoApps className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-bold text-[11px] text-[#17191C]">All Tool Suite</p>
                            <p className="text-[9px] text-[#626A73] truncate">Explore the full directory</p>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Pricing Link */}
            <Link
              to="/pricing"
              className={`text-xs font-semibold py-1 px-2.5 rounded-lg transition-colors ${
                location.pathname === "/pricing"
                  ? "text-[#0145F2] font-bold bg-[#E8EEFF]/40"
                  : "text-[#626A73] hover:text-[#17191C]"
              }`}
            >
              Pricing
            </Link>

            {/* Resources Dropdown */}
            <div className="relative" ref={resourcesDropdownRef}>
              <button
                type="button"
                onClick={() => setIsResourcesDropdownOpen(!isResourcesDropdownOpen)}
                className={`text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer bg-transparent py-1 px-2.5 rounded-lg ${
                  isResourcesDropdownOpen || location.pathname.startsWith("/blog")
                    ? "text-[#0145F2] font-bold bg-[#E8EEFF]/40"
                    : "text-[#626A73] hover:text-[#17191C]"
                }`}
              >
                <span>Resources</span>
                <IoChevronDown
                  className={`w-3 h-3 text-[#626A73] transition-transform duration-200 shrink-0 ${
                    isResourcesDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isResourcesDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute left-1/2 -translate-x-1/2 mt-2 w-56 bg-white border border-[#E1E5E9] rounded-2xl shadow-xl p-2 z-50 space-y-1"
                  >
                    <Link
                      to="/blog"
                      className="p-1.5 rounded-lg flex items-start gap-2 text-left hover:bg-[#F5F7F9]"
                    >
                      <div className="w-5 h-5 rounded bg-[#E8EEFF] text-[#0145F2] flex items-center justify-center shrink-0">
                        <IoBookOutline className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="font-bold text-[11px] text-[#17191C]">Strategy Blog</p>
                        <p className="text-[9px] text-[#626A73]">Guides & updates</p>
                      </div>
                    </Link>

                    <Link
                      to="/tools/og-debugger"
                      className="p-1.5 rounded-lg flex items-start gap-2 text-left hover:bg-[#F5F7F9]"
                    >
                      <div className="w-5 h-5 rounded bg-[#E8EEFF] text-[#0145F2] flex items-center justify-center shrink-0">
                        <IoBug className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="font-bold text-[11px] text-[#17191C]">OG Tag Inspector</p>
                        <p className="text-[9px] text-[#626A73]">Validate web headers</p>
                      </div>
                    </Link>

                    <Link
                      to="/tools/utm-builder"
                      className="p-1.5 rounded-lg flex items-start gap-2 text-left hover:bg-[#F5F7F9]"
                    >
                      <div className="w-5 h-5 rounded bg-[#E8EEFF] text-[#0145F2] flex items-center justify-center shrink-0">
                        <IoLink className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="font-bold text-[11px] text-[#17191C]">UTM Campaign Builder</p>
                        <p className="text-[9px] text-[#626A73]">Generate UTM URLs</p>
                      </div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Desktop Right Actions: Login & CTAs */}
          <div className="flex items-center justify-end gap-2 sm:gap-3">
            {/* Keyboard Shortcuts Button */}
            <button
              type="button"
              onClick={onTriggerShortcuts}
              className="p-1.5 text-[#8D959F] hover:text-[#17191C] hover:bg-[#F5F7F9] rounded-lg transition-colors cursor-pointer relative flex items-center justify-center"
              title="Keyboard Shortcuts (Press ?)"
            >
              <IoKeypad className="w-4 h-4 text-current opacity-70 hover:opacity-100" />
              <span
                className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${
                  shortcutsEnabled ? "bg-emerald-500 animate-pulse" : "bg-[#8D959F]"
                }`}
              />
            </button>

            {/* Authenticated user menu */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="h-8 px-2.5 rounded-lg border border-[#D0D7DE] bg-white text-xs font-semibold text-[#17191C] flex items-center gap-2 hover:bg-[#F8FAFC] transition-colors cursor-pointer shadow-xs"
                >
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.display_name || "Profile"}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[#0145F2] text-white text-[10px] font-bold flex items-center justify-center">
                      {(profile?.display_name || user.email || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden md:inline max-w-[100px] truncate text-[11px]">
                    {profile?.display_name || user.email?.split("@")[0]}
                  </span>
                  <IoChevronDown className="w-3 h-3 text-[#626A73]" />
                </button>

                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl border border-[#E1E5E9] shadow-xl p-1.5 z-50 text-xs text-left"
                    >
                      <div className="px-3 py-2 border-b border-[#ECEEF1] mb-1">
                        <p className="font-bold text-[#17191C] truncate">{profile?.display_name || "Account"}</p>
                        <p className="text-[10px] text-[#626A73] truncate">{user.email}</p>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          navigate("/history");
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-[#17191C] hover:bg-[#F5F7F9] font-medium flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <IoBookmark className="w-3.5 h-3.5 text-[#0145F2]" />
                        <span>Saved Layouts ({historyCount})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          onTriggerOnboarding();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-[#17191C] hover:bg-[#F5F7F9] font-medium flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <IoPerson className="w-3.5 h-3.5 text-[#626A73]" />
                        <span>Edit Profile</span>
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          setIsProfileDropdownOpen(false);
                          await onSignOut();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 font-medium flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <IoLogOut className="w-3.5 h-3.5 text-rose-600" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                type="button"
                onClick={onTriggerAuth}
                className="text-xs font-bold text-[#626A73] hover:text-[#17191C] px-3 py-1.5 rounded-lg transition-colors cursor-pointer bg-transparent"
              >
                Log In
              </button>
            )}

            {/* Launch App Studio Link */}
            <Link
              to="/tools/post-card-studio"
              className="h-8 px-3.5 rounded-lg bg-[#0145F2] text-white font-bold text-xs flex items-center gap-1.5 hover:bg-[#0039D4] active:bg-[#0030B8] transition-colors cursor-pointer shadow-xs"
            >
              <span>Create with Smyl</span>
            </Link>

            {/* Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 text-[#8D959F] hover:text-[#17191C] hover:bg-[#F5F7F9] rounded-lg transition-colors cursor-pointer flex items-center justify-center shrink-0"
            >
              {isMobileMenuOpen ? <IoClose className="w-5 h-5 text-[#17191C]" /> : <IoMenu className="w-5 h-5 text-[#626A73]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <div className="fixed inset-0 z-30 md:hidden bg-transparent" onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="absolute top-15 left-4 right-4 bg-white border border-[#E1E5E9] shadow-xl rounded-2xl overflow-hidden pointer-events-auto md:hidden z-40"
            >
              <div className="p-4 space-y-4 text-left">
                <div>
                  <p className="text-[10px] font-bold text-[#8D959F] uppercase tracking-wider mb-2 px-1">Studio</p>
                  <Link
                    to="/tools/post-card-studio"
                    className="w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-xs font-semibold text-[#17191C] hover:bg-[#F5F7F9]"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#E8EEFF] text-[#0145F2] flex items-center justify-center shrink-0">
                      <IoCreate className="w-4 h-4" />
                    </div>
                    <span>Post Card Studio</span>
                  </Link>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-[#8D959F] uppercase tracking-wider mb-2 px-1">Branding & Links</p>
                  <div className="grid grid-cols-1 gap-1">
                    <Link
                      to="/tools/link-shortener"
                      className="px-3 py-2.5 rounded-xl flex items-center gap-3 text-xs font-semibold text-[#17191C] hover:bg-[#F5F7F9]"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#E8EEFF] text-[#0145F2] flex items-center justify-center shrink-0">
                        <IoLink className="w-4 h-4" />
                      </div>
                      <span>Link Shortener</span>
                    </Link>

                    <Link
                      to="/tools/qr-generator"
                      className="px-3 py-2.5 rounded-xl flex items-center gap-3 text-xs font-semibold text-[#17191C] hover:bg-[#F5F7F9]"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#E8EEFF] text-[#0145F2] flex items-center justify-center shrink-0">
                        <IoQrCode className="w-4 h-4" />
                      </div>
                      <span>QR Code Generator</span>
                    </Link>

                    <Link
                      to="/tools/link-hub"
                      className="px-3 py-2.5 rounded-xl flex items-center gap-3 text-xs font-semibold text-[#17191C] hover:bg-[#F5F7F9]"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#E8EEFF] text-[#0145F2] flex items-center justify-center shrink-0">
                        <IoCompass className="w-4 h-4" />
                      </div>
                      <span>Link Hub Space</span>
                    </Link>

                    <Link
                      to="/tools"
                      className="px-3 py-2.5 rounded-xl flex items-center gap-3 text-xs font-semibold text-[#17191C] hover:bg-[#F5F7F9]"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#EDF1F5] text-[#626A73] flex items-center justify-center shrink-0">
                        <IoApps className="w-4 h-4" />
                      </div>
                      <span>All Tool Hub</span>
                    </Link>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-[#8D959F] uppercase tracking-wider mb-2 px-1">Resources</p>
                  <div className="grid grid-cols-1 gap-1">
                    <Link
                      to="/blog"
                      className="px-3 py-2.5 rounded-xl flex items-center gap-3 text-xs font-semibold text-[#17191C] hover:bg-[#F5F7F9]"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#E8EEFF] text-[#0145F2] flex items-center justify-center shrink-0">
                        <IoBookOutline className="w-4 h-4" />
                      </div>
                      <span>Strategy Blog</span>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
