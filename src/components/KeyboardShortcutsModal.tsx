import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  IoClose,
  IoCheckmarkCircle,
  IoSparkles,
} from "react-icons/io5";
import { Keyboard } from "lucide-react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcutsEnabled: boolean;
  onToggleShortcuts: (enabled: boolean) => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  shortcutsEnabled,
  onToggleShortcuts,
}) => {
  if (!isOpen) return null;

  const isMac = typeof window !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const modKey = isMac ? "⌘" : "Ctrl";

  const shortcutsList = [
    {
      action: "Undo Style Change",
      description: "Revert the last card customization style change",
      keys: [modKey, "Z"],
    },
    {
      action: "Redo Style Change",
      description: "Reapply the reverted customization style change",
      keys: [modKey, "Y"],
    },
    {
      action: "Save Layout to History",
      description: "Save current card customization & content to local storage",
      keys: [modKey, "S"],
    },
    {
      action: "Toggle Text Edit Mode",
      description: "Switch between Live Preview and Direct Text Editing",
      keys: [modKey, "E"],
    },
    {
      action: "Switch Platform Format",
      description: "Quick toggle between Twitter/X and LinkedIn card layouts",
      keys: [modKey, "P"],
    },
    {
      action: "Close Modals / Overlays",
      description: "Dismiss active dialogs, export screens, and popovers",
      keys: ["Esc"],
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md max-h-[85vh] flex flex-col bg-white border border-[#E1E5E9] rounded-2xl shadow-xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#E1E5E9] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-soft flex items-center justify-center text-brand-primary">
                <Keyboard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-[#17191C] text-base leading-snug">
                  Keyboard Shortcuts
                </h3>
                <p className="text-xs text-[#626A73]">
                  Speed up your workflow in Smyl Studio
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8D959F] hover:text-[#17191C] hover:bg-[#F5F7F9] transition-colors cursor-pointer"
            >
              <IoClose className="w-5 h-5" />
            </button>
          </div>

          {/* Master Enable/Disable Toggle */}
          <div className="px-4 sm:px-5 py-3 bg-[#F8FAFC] border-b border-[#E1E5E9] flex items-center justify-between shrink-0">
            <div>
              <span className="text-xs font-bold text-[#17191C] block">
                Enable Keyboard Shortcuts
              </span>
              <span className="text-[11px] text-[#626A73]">
                {shortcutsEnabled
                  ? "Shortcuts are active in the Studio workspace."
                  : "Shortcuts are currently disabled."}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onToggleShortcuts(!shortcutsEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                shortcutsEnabled ? "bg-brand-primary" : "bg-[#D0D7DE]"
              }`}
              role="switch"
              aria-checked={shortcutsEnabled}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  shortcutsEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Shortcuts Table */}
          <div className="p-4 sm:p-5 space-y-2.5 flex-1 overflow-y-auto min-h-0 divide-y divide-[#F0F2F5]">
            {shortcutsList.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-4 py-2 border-b border-[#F0F2F5] last:border-0"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-[#17191C]">
                    {item.action}
                  </div>
                  <div className="text-[11px] text-[#8D959F]">
                    {item.description}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {item.keys.map((k, kIdx) => (
                    <React.Fragment key={kIdx}>
                      <kbd className="min-w-[24px] px-2 py-1 text-center font-mono font-bold text-xs bg-[#EDF1F5] text-[#17191C] rounded-md border border-[#D0D7DE] shadow-2xs">
                        {k}
                      </kbd>
                      {kIdx < item.keys.length - 1 && (
                        <span className="text-[#8D959F] text-xs">+</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Note */}
          <div className="p-4 bg-[#F8FAFC] border-t border-[#E1E5E9] flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-1.5 text-[#626A73] text-[11px]">
              <IoSparkles className="w-3.5 h-3.5 text-brand-primary" />
              <span>Tip: Press <kbd className="font-mono bg-white px-1 border border-[#D0D7DE] rounded">?</kbd> anytime to open this helper</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-white border border-[#D0D7DE] hover:bg-[#F0F2F5] text-[#17191C] font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
