import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import * as Icons from "lucide-react";
import { TOOLS_ITEMS, SOLUTIONS_ITEMS, RESOURCES_ITEMS, NavItem } from "../../constants/navigation";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerAuth: () => void;
  isAuthenticated: boolean;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  onTriggerAuth,
  isAuthenticated,
}) => {
  const [activeGroup, setActiveGroup] = useState<null | "tools" | "solutions" | "resources">(null);

  // Esc key closes menu
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scrolling while open
  useEffect(() => {
    if (!isOpen) return;
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleGroup = (group: "tools" | "solutions" | "resources") => {
    setActiveGroup(activeGroup === group ? null : group);
  };

  const renderInlineGroup = (items: NavItem[], groupKey: "tools" | "solutions" | "resources") => {
    const isExpanded = activeGroup === groupKey;
    return (
      <div className="border-b border-[#E1E5E9]/60 py-2">
        <button
          type="button"
          onClick={() => toggleGroup(groupKey)}
          aria-expanded={isExpanded}
          className="w-full flex items-center justify-between py-2 text-sm font-bold text-[#17191C] text-left cursor-pointer"
        >
          <span className="capitalize">{groupKey}</span>
          <Icons.ChevronDown
            className={`w-4 h-4 text-[#626A73] transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mt-1 pl-2 space-y-1"
            >
              {items.map((item) => {
                const Icon = (Icons as any)[item.iconName || "ChevronRight"] || Icons.ChevronRight;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={onClose}
                    className="p-2 rounded-lg flex items-start gap-3 hover:bg-[#F5F7F9]"
                  >
                    <div className="w-6 h-6 rounded bg-[#E8EEFF] text-[#0145F2] flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#17191C]">{item.label}</p>
                      <p className="text-[10px] text-[#626A73]">{item.description}</p>
                    </div>
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs md:hidden"
        onClick={onClose}
      />

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="fixed top-18 left-4 right-4 bg-white border border-[#E1E5E9] shadow-xl rounded-2xl overflow-hidden pointer-events-auto md:hidden z-50 max-h-[80vh] flex flex-col"
      >
        <div className="p-4 overflow-y-auto space-y-4">
          <div className="space-y-1">
            {renderInlineGroup(TOOLS_ITEMS, "tools")}
            {renderInlineGroup(SOLUTIONS_ITEMS, "solutions")}
            {renderInlineGroup(RESOURCES_ITEMS, "resources")}
          </div>

          <div className="space-y-3 pt-2">
            {!isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onTriggerAuth();
                }}
                className="w-full h-11 rounded-xl border border-[#D0D7DE] text-[#17191C] font-bold text-xs flex items-center justify-center cursor-pointer hover:bg-[#F8FAFC]"
              >
                Log In
              </button>
            ) : null}

            <Link
              to="/tools/post-card-studio"
              onClick={onClose}
              className="w-full h-11 rounded-xl bg-[#0145F2] text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#0039D4] shadow-xs"
            >
              <span>Create with Smyl</span>
              <Icons.ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </motion.div>
    </>
  );
};
