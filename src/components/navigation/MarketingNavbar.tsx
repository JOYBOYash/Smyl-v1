import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X, ArrowRight } from "lucide-react";
import { SmylLogo } from "../SmylLogo";
import { useAuth } from "../../context/AuthContext";
import { NavDropdown } from "./NavDropdown";
import { MobileNav } from "./MobileNav";
import { TOOLS_ITEMS, SOLUTIONS_ITEMS, RESOURCES_ITEMS } from "../../constants/navigation";

interface MarketingNavbarProps {
  onTriggerAuth: () => void;
}

export const MarketingNavbar: React.FC<MarketingNavbarProps> = ({ onTriggerAuth }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  const [openMenu, setOpenMenu] = useState<null | "tools" | "solutions" | "resources">(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Active state calculations derived dynamically from current route path
  const isToolsActive = location.pathname.startsWith("/tools");
  const isSolutionsActive = location.pathname.startsWith("/for");
  const isResourcesActive = location.pathname.startsWith("/blog") || 
                           ["/how-it-works", "/pricing", "/help", "/examples"].includes(location.pathname);

  // Close dropdowns and mobile menu on location changes
  useEffect(() => {
    setOpenMenu(null);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleDropdown = (menu: "tools" | "solutions" | "resources") => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const getDropdownItems = () => {
    if (openMenu === "tools") return TOOLS_ITEMS;
    if (openMenu === "solutions") return SOLUTIONS_ITEMS;
    if (openMenu === "resources") return RESOURCES_ITEMS;
    return [];
  };

  return (
    <header className="fixed top-4 left-0 right-0 z-40 px-4 w-full flex justify-center pointer-events-none select-none">
      <div className="w-full max-w-[1180px] bg-white border border-[#E1E5E9] shadow-sm rounded-2xl pointer-events-auto flex items-center justify-between h-16 px-4 md:px-6 relative transition-all duration-300">
        
        {/* Brand Logo Link */}
        <div className="flex items-center">
          <Link to="/" aria-label="Smyl Home" className="flex items-center gap-2 group cursor-pointer">
            <SmylLogo className="h-6.5 w-auto text-[#0145F2] transition-transform group-hover:scale-[1.03]" />
          </Link>
        </div>

        {/* Desktop Navigation Links (Centered) */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 absolute left-1/2 -translate-x-1/2" aria-label="Marketing Navigation">
          
          {/* Tools Dropdown Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("tools")}
              aria-expanded={openMenu === "tools"}
              aria-controls="tools-nav-dropdown"
              className={`text-[13px] font-bold flex items-center gap-1.5 py-2 px-3.5 rounded-xl cursor-pointer transition-all focus-visible:outline-2 focus-visible:outline-brand-primary ${
                openMenu === "tools" || isToolsActive
                  ? "text-[#0145F2] bg-[#E8EEFF]/50"
                  : "text-[#626A73] hover:text-[#17191C] hover:bg-[#F5F7F9]"
              }`}
            >
              <span>Tools</span>
              <ChevronDown
                className={`w-4 h-4 text-[#626A73] transition-transform duration-200 ${
                  openMenu === "tools" ? "rotate-180" : ""
                }`}
              />
            </button>
            <NavDropdown
              isOpen={openMenu === "tools"}
              onClose={() => setOpenMenu(null)}
              items={TOOLS_ITEMS}
              type="tools"
            />
          </div>

          {/* Solutions Dropdown Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("solutions")}
              aria-expanded={openMenu === "solutions"}
              aria-controls="solutions-nav-dropdown"
              className={`text-[13px] font-bold flex items-center gap-1.5 py-2 px-3.5 rounded-xl cursor-pointer transition-all focus-visible:outline-2 focus-visible:outline-brand-primary ${
                openMenu === "solutions" || isSolutionsActive
                  ? "text-[#0145F2] bg-[#E8EEFF]/50"
                  : "text-[#626A73] hover:text-[#17191C] hover:bg-[#F5F7F9]"
              }`}
            >
              <span>Solutions</span>
              <ChevronDown
                className={`w-4 h-4 text-[#626A73] transition-transform duration-200 ${
                  openMenu === "solutions" ? "rotate-180" : ""
                }`}
              />
            </button>
            <NavDropdown
              isOpen={openMenu === "solutions"}
              onClose={() => setOpenMenu(null)}
              items={SOLUTIONS_ITEMS}
              type="solutions"
            />
          </div>

          {/* Resources Dropdown Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("resources")}
              aria-expanded={openMenu === "resources"}
              aria-controls="resources-nav-dropdown"
              className={`text-[13px] font-bold flex items-center gap-1.5 py-2 px-3.5 rounded-xl cursor-pointer transition-all focus-visible:outline-2 focus-visible:outline-brand-primary ${
                openMenu === "resources" || isResourcesActive
                  ? "text-[#0145F2] bg-[#E8EEFF]/50"
                  : "text-[#626A73] hover:text-[#17191C] hover:bg-[#F5F7F9]"
              }`}
            >
              <span>Resources</span>
              <ChevronDown
                className={`w-4 h-4 text-[#626A73] transition-transform duration-200 ${
                  openMenu === "resources" ? "rotate-180" : ""
                }`}
              />
            </button>
            <NavDropdown
              isOpen={openMenu === "resources"}
              onClose={() => setOpenMenu(null)}
              items={RESOURCES_ITEMS}
              type="resources"
            />
          </div>

        </nav>

        {/* Desktop Actions (Right-aligned) */}
        <div className="hidden md:flex items-center gap-3">
          {!isAuthenticated ? (
            <button
              type="button"
              onClick={onTriggerAuth}
              className="text-[13px] font-bold text-[#626A73] hover:text-[#17191C] px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Log In
            </button>
          ) : (
            <Link
              to="/history"
              className="text-[13px] font-bold text-[#626A73] hover:text-[#17191C] px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Dashboard
            </Link>
          )}

          <Link
            to="/tools/post-card-studio"
            className="h-10 px-4.5 rounded-xl bg-[#0145F2] text-white font-bold text-xs flex items-center gap-1.5 hover:bg-[#0039D4] active:bg-[#0030B8] transition-all cursor-pointer shadow-xs focus-visible:outline-2 focus-visible:outline-brand-primary"
          >
            <span>Create with Smyl</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen}
          aria-label="Toggle Mobile Menu"
          className="md:hidden p-2 text-[#8D959F] hover:text-[#17191C] hover:bg-[#F5F7F9] rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0 focus-visible:outline-2 focus-visible:outline-brand-primary"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5 text-[#17191C]" /> : <Menu className="w-5 h-5 text-[#626A73]" />}
        </button>

      </div>

      {/* Mobile Menu Panel */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onTriggerAuth={onTriggerAuth}
        isAuthenticated={isAuthenticated}
      />
    </header>
  );
};
