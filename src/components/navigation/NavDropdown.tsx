import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import * as Icons from "lucide-react";
import { NavItem } from "../../constants/navigation";

interface NavDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  items: NavItem[];
  type: "tools" | "solutions" | "resources";
}

export const NavDropdown: React.FC<NavDropdownProps> = ({
  isOpen,
  onClose,
  items,
  type,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Set dropdown container width based on type
  const getDropdownWidthClass = () => {
    if (type === "tools") return "w-[560px] grid grid-cols-2 gap-4";
    if (type === "resources") return "w-64 flex flex-col gap-1";
    return "w-56 flex flex-col gap-1";
  };

  return (
    <motion.div
      ref={dropdownRef}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={`absolute left-1/2 -translate-x-1/2 mt-2 bg-white border border-[#E1E5E9] rounded-2xl shadow-xl p-4 z-50 ${getDropdownWidthClass()}`}
    >
      {type === "tools" ? (
        <>
          {/* Visuals Column */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-[#8D959F] uppercase tracking-wider border-b border-[#E1E5E9]/50 pb-1.5">
              Visual Creation
            </p>
            <div className="space-y-1">
              <Link
                to="/tools/post-card-studio"
                onClick={onClose}
                className="p-2 rounded-xl flex items-start gap-3 text-left hover:bg-[#F5F7F9] focus-visible:outline-2 focus-visible:outline-brand-primary transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-[#E8EEFF] text-[#0145F2] flex items-center justify-center shrink-0">
                  <Icons.Paintbrush className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-xs text-[#17191C] group-hover:text-[#0145F2] transition-colors">Post Card Studio</p>
                  <p className="text-[10px] text-[#626A73] leading-normal">Visual LinkedIn/X card maker</p>
                </div>
              </Link>

              {items
                .filter((item) => ["/tools/qr-generator", "/tools/screenshot-generator"].includes(item.href))
                .map((item) => {
                  const Icon = (Icons as any)[item.iconName || "ChevronRight"] || Icons.ChevronRight;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={onClose}
                      className="p-2 rounded-xl flex items-start gap-3 text-left hover:bg-[#F5F7F9] focus-visible:outline-2 focus-visible:outline-brand-primary transition-all group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#E8EEFF] text-[#0145F2] flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-[#17191C] group-hover:text-[#0145F2] transition-colors">{item.label}</p>
                        <p className="text-[10px] text-[#626A73] leading-normal">{item.description}</p>
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>

          {/* Links & Optimization Column */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-[#8D959F] uppercase tracking-wider border-b border-[#E1E5E9]/50 pb-1.5">
              Optimizers & Hubs
            </p>
            <div className="space-y-1">
              {items
                .filter((item) => !["/tools/qr-generator", "/tools/screenshot-generator"].includes(item.href))
                .map((item) => {
                  const Icon = (Icons as any)[item.iconName || "ChevronRight"] || Icons.ChevronRight;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={onClose}
                      className="p-2 rounded-xl flex items-start gap-3 text-left hover:bg-[#F5F7F9] focus-visible:outline-2 focus-visible:outline-brand-primary transition-all group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#E8EEFF] text-[#0145F2] flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-[#17191C] group-hover:text-[#0145F2] transition-colors">{item.label}</p>
                        <p className="text-[10px] text-[#626A73] leading-normal">{item.description}</p>
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>
        </>
      ) : (
        items.map((item) => {
          const Icon = (Icons as any)[item.iconName || "ChevronRight"] || Icons.ChevronRight;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className="p-2 rounded-xl flex items-start gap-3 text-left hover:bg-[#F5F7F9] focus-visible:outline-2 focus-visible:outline-brand-primary transition-all group"
            >
              <div className="w-7 h-7 rounded-lg bg-[#E8EEFF] text-[#0145F2] flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs text-[#17191C] group-hover:text-[#0145F2] transition-colors truncate">{item.label}</p>
                <p className="text-[10px] text-[#626A73] leading-normal truncate">{item.description}</p>
              </div>
            </Link>
          );
        })
      )}
    </motion.div>
  );
};
