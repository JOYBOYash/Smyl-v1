import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Keyboard, LogOut, Settings, Bookmark, User, Compass } from "lucide-react";
import { SmylLogo } from "../SmylLogo";
import { useAuth } from "../../context/AuthContext";

interface StudioNavbarProps {
  shortcutsEnabled: boolean;
  historyCount: number;
  onTriggerShortcuts: () => void;
  onTriggerOnboarding: () => void;
  onTriggerAuth: () => void;
}

export const StudioNavbar: React.FC<StudioNavbarProps> = ({
  shortcutsEnabled,
  historyCount,
  onTriggerShortcuts,
  onTriggerOnboarding,
  onTriggerAuth,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, profile, signOut } = useAuth();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on navigation
  useEffect(() => {
    setIsProfileOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    setIsProfileOpen(false);
    await signOut();
    navigate("/");
  };

  const isStudioActive = location.pathname === "/tools/post-card-studio";
  const isToolsActive = location.pathname === "/tools";
  const isHistoryActive = location.pathname === "/history";

  return (
    <header className="fixed top-4 left-0 right-0 z-40 px-4 w-full flex justify-center pointer-events-none select-none">
      <div className="w-full max-w-[1180px] bg-white border border-[#E1E5E9] shadow-sm rounded-2xl pointer-events-auto flex items-center justify-between h-16 px-4 md:px-6 relative transition-all duration-300">
        
        {/* Left Side: Brand Logo */}
        <div className="flex items-center">
          <Link to="/" aria-label="Smyl Home" className="flex items-center gap-2 group cursor-pointer">
            <SmylLogo className="h-6.5 w-auto text-[#0145F2] transition-transform group-hover:scale-[1.03]" />
          </Link>
        </div>

        {/* Center: Studio Workspace Links */}
        <nav className="flex items-center gap-1 sm:gap-2 absolute left-1/2 -translate-x-1/2" aria-label="Workspace Navigation">
          <Link
            to="/tools/post-card-studio"
            className={`text-xs sm:text-[13px] font-bold py-2 px-3 sm:px-4 rounded-xl cursor-pointer transition-all ${
              isStudioActive
                ? "text-[#0145F2] bg-[#E8EEFF]/50"
                : "text-[#626A73] hover:text-[#17191C] hover:bg-[#F5F7F9]"
            }`}
          >
            Studio
          </Link>

          <Link
            to="/tools"
            className={`text-xs sm:text-[13px] font-bold py-2 px-3 sm:px-4 rounded-xl cursor-pointer transition-all ${
              isToolsActive
                ? "text-[#0145F2] bg-[#E8EEFF]/50"
                : "text-[#626A73] hover:text-[#17191C] hover:bg-[#F5F7F9]"
            }`}
          >
            Tools
          </Link>

          <Link
            to="/history"
            className={`text-xs sm:text-[13px] font-bold py-2 px-3 sm:px-4 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
              isHistoryActive
                ? "text-[#0145F2] bg-[#E8EEFF]/50"
                : "text-[#626A73] hover:text-[#17191C] hover:bg-[#F5F7F9]"
            }`}
          >
            <span>History</span>
            {historyCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                isHistoryActive ? "bg-[#0145F2] text-white" : "bg-[#EDF1F5] text-[#626A73]"
              }`}>
                {historyCount}
              </span>
            )}
          </Link>
        </nav>

        {/* Right Side: Keyboard toggles & Profile Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Keyboard Shortcuts Control */}
          <button
            type="button"
            onClick={onTriggerShortcuts}
            className="p-2 text-[#8D959F] hover:text-[#17191C] hover:bg-[#F5F7F9] rounded-xl transition-all cursor-pointer relative flex items-center justify-center focus-visible:outline-2 focus-visible:outline-brand-primary"
            title="Keyboard Shortcuts (Press ?)"
          >
            <Keyboard className="w-4 h-4" />
            <span
              className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${
                shortcutsEnabled ? "bg-emerald-500 animate-pulse" : "bg-[#8D959F]"
              }`}
            />
          </button>

          {/* User Account Controls */}
          {isAuthenticated && user ? (
            <div className="relative" ref={profileDropdownRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                aria-expanded={isProfileOpen}
                className="h-9 px-2.5 sm:px-3 rounded-xl border border-[#D0D7DE] bg-white text-xs font-bold text-[#17191C] flex items-center gap-2 hover:bg-[#F8FAFC] transition-all cursor-pointer shadow-2xs focus-visible:outline-2 focus-visible:outline-brand-primary"
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name || "Profile"}
                    className="w-5.5 h-5.5 rounded-full object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-5.5 h-5.5 rounded-full bg-[#0145F2] text-white text-[10px] font-black flex items-center justify-center shrink-0">
                    {(profile?.display_name || user.email || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline max-w-[90px] truncate text-xs font-bold text-[#17191C]">
                  {profile?.display_name || user.email?.split("@")[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#626A73] shrink-0" />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-[#E1E5E9] shadow-xl p-2 z-50 text-xs text-left space-y-0.5"
                  >
                    <div className="px-3 py-2 border-b border-[#E1E5E9]/50 mb-1">
                      <p className="font-extrabold text-[#17191C] truncate">
                        {profile?.display_name || "Account"}
                      </p>
                      <p className="text-[10px] text-[#626A73] truncate">{user.email}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate("/history");
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-[#17191C] hover:bg-[#F5F7F9] font-bold flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-[#0145F2]" />
                      <span>Saved Layouts</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        onTriggerOnboarding();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-[#17191C] hover:bg-[#F5F7F9] font-bold flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <User className="w-4 h-4 text-[#626A73]" />
                      <span>Edit Profile</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
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
              className="text-xs sm:text-[13px] font-bold text-[#626A73] hover:text-[#17191C] px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Log In
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
