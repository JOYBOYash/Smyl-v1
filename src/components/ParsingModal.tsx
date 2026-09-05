import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SmylLoader } from "./SmylLogo";
import { IoCheckmarkCircle, IoInformationCircleOutline } from "react-icons/io5";

interface ParsingModalProps {
  isOpen: boolean;
  inputContent: string;
}

const PARSING_STEPS = [
  "Detecting post platform & layout...",
  "Extracting author profile & badges...",
  "Formatting typography & rich content...",
  "Calculating engagement metrics & dimensions...",
  "Assembling high-DPI card preview...",
];

export const ParsingModal: React.FC<ParsingModalProps> = ({ isOpen, inputContent }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < PARSING_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 600);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-white border border-[#E1E5E9] rounded-2xl p-6 sm:p-7 shadow-2xl max-w-md w-full z-10 space-y-5"
        >
          {/* Header Animation */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-soft flex items-center justify-center shrink-0">
              <SmylLoader size="md" />
            </div>
            <div>
              <h3 className="font-bold text-[#17191C] text-base">Transforming Post</h3>
              <p className="text-xs text-[#626A73]">Parsing structure and building your card preview</p>
            </div>
          </div>

          {/* Input Preview Snippet */}
          {inputContent && (
            <div className="bg-[#F5F7FA] border border-[#E1E5E9] rounded-xl p-3 text-xs text-[#626A73] flex items-center gap-2 overflow-hidden">
              <IoInformationCircleOutline className="w-4 h-4 text-brand-primary shrink-0" />
              <span className="truncate font-mono">{inputContent}</span>
            </div>
          )}

          {/* Step Progress Checklist */}
          <div className="space-y-2.5 py-1">
            {PARSING_STEPS.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2.5 text-xs transition-colors duration-200 ${
                    isCompleted
                      ? "text-emerald-700 font-semibold"
                      : isCurrent
                      ? "text-brand-primary font-bold"
                      : "text-[#8D959F]"
                  }`}
                >
                  {isCompleted ? (
                    <IoCheckmarkCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : isCurrent ? (
                    <div className="w-4 h-4 rounded-full border-2 border-brand-primary border-t-transparent animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-[#D0D7DE] shrink-0" />
                  )}
                  <span>{step}</span>
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#EDF1F5] h-1.5 rounded-full overflow-hidden">
            <motion.div
              className="bg-brand-primary h-full rounded-full"
              initial={{ width: "10%" }}
              animate={{ width: `${Math.min(95, ((currentStepIndex + 1) / PARSING_STEPS.length) * 100)}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
