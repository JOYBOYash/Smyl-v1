import React, { useState, useRef } from "react";
import JSZip from "jszip";
import { toPng } from "html-to-image";
import {
  IoClose,
  IoDownload,
  IoCheckmark,
  IoAlertCircle,
  IoBookmark,
  IoLayers,
} from "react-icons/io5";
import { SavedCard } from "../utils/db";
import { PostCard } from "./PostCard";
import { CanvasWrapper } from "./CanvasWrapper";

interface BatchExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedCards: SavedCard[];
}

export const BatchExportModal: React.FC<BatchExportModalProps> = ({
  isOpen,
  onClose,
  savedCards,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    savedCards.map((c) => c.id)
  );
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Hidden container for rendering individual cards sequentially for html-to-image
  const renderContainerRef = useRef<HTMLDivElement | null>(null);
  const [renderingCard, setRenderingCard] = useState<SavedCard | null>(null);

  if (!isOpen) return null;

  const handleToggleSelectAll = () => {
    if (selectedIds.length === savedCards.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(savedCards.map((c) => c.id));
    }
  };

  const handleToggleSelectCard = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBatchDownload = async () => {
    if (selectedIds.length === 0) {
      setErrorMsg("Please select at least one card to export.");
      return;
    }

    const cardsToExport = savedCards.filter((c) => selectedIds.includes(c.id));
    setIsExporting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setProgress({ current: 0, total: cardsToExport.length });

    try {
      const zip = new JSZip();
      const folder = zip.folder("smyl-cards");

      await document.fonts.ready;

      for (let i = 0; i < cardsToExport.length; i++) {
        const card = cardsToExport[i];
        setProgress({ current: i + 1, total: cardsToExport.length });

        // Mount card in the hidden offscreen container
        setRenderingCard(card);

        // Wait for React DOM mount and layout paint
        await new Promise((r) => setTimeout(r, 120));

        if (renderContainerRef.current) {
          const dataUrl = await toPng(renderContainerRef.current, {
            pixelRatio: 2,
            cacheBust: true,
          });

          // Convert dataURL to pure base64 binary
          const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");

          const cleanName = (card.name || `card-${i + 1}`)
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, "_")
            .slice(0, 40);

          const fileName = `${String(i + 1).padStart(2, "0")}_${cleanName}.png`;
          folder?.file(fileName, base64Data, { base64: true });
        }
      }

      // Generate the ZIP file
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `smyl-batch-cards-${new Date().toISOString().slice(0, 10)}.zip`;
      link.click();
      URL.revokeObjectURL(downloadUrl);

      setSuccessMsg(`Successfully exported ${cardsToExport.length} card${cardsToExport.length > 1 ? "s" : ""} as ZIP!`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("Batch export error:", err);
      setErrorMsg(err.message || "Failed to generate ZIP batch export.");
    } finally {
      setIsExporting(false);
      setRenderingCard(null);
      setProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-white rounded-2xl border border-[#E1E5E9] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#ECEEF1] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-soft text-brand-primary flex items-center justify-center text-lg">
              <IoLayers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#17191C] text-base">Batch Export Cards</h3>
              <p className="text-xs text-[#626A73]">Download multiple saved templates as a high-res ZIP archive</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="w-8 h-8 rounded-lg text-[#626A73] hover:bg-[#F5F7F9] hover:text-[#17191C] flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
          >
            <IoClose className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Notifications */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs flex items-center gap-2">
              <IoAlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
              <IoCheckmark className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Selection Toolbar */}
          <div className="flex items-center justify-between pb-2 border-b border-[#ECEEF1]">
            <span className="text-xs font-semibold text-[#17191C]">
              {selectedIds.length} of {savedCards.length} selected
            </span>
            <button
              type="button"
              onClick={handleToggleSelectAll}
              disabled={isExporting}
              className="text-xs font-bold text-brand-primary hover:text-brand-hover cursor-pointer disabled:opacity-50"
            >
              {selectedIds.length === savedCards.length ? "Deselect All" : "Select All"}
            </button>
          </div>

          {/* Cards List */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {savedCards.map((card) => {
              const isChecked = selectedIds.includes(card.id);
              return (
                <div
                  key={card.id}
                  onClick={() => !isExporting && handleToggleSelectCard(card.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                    isChecked
                      ? "border-brand-primary bg-brand-soft/30"
                      : "border-[#E1E5E9] bg-white hover:bg-[#F8FAFC]"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                      isChecked
                        ? "bg-brand-primary border-brand-primary text-white"
                        : "border-[#D0D7DE] bg-white"
                    }`}
                  >
                    {isChecked && <IoCheckmark className="w-3.5 h-3.5 stroke-[2]" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#17191C] truncate">{card.name}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-[#ECEEF1] text-[#626A73]">
                        {card.customization.platform}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#626A73] truncate mt-0.5 italic">
                      "{card.post.content.text}"
                    </p>
                  </div>

                  <span className="text-[10px] text-[#8D959F] shrink-0">
                    {new Date(card.createdAt).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress Indicator when exporting */}
          {isExporting && progress && (
            <div className="p-4 bg-brand-soft/40 border border-brand-primary/20 rounded-xl space-y-2">
              <div className="flex justify-between text-xs font-semibold text-brand-primary">
                <span>Rendering high-resolution cards...</span>
                <span>
                  {progress.current} / {progress.total}
                </span>
              </div>
              <div className="w-full bg-[#E1E5E9] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-brand-primary h-full transition-all duration-200"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#F8FAFC] border-t border-[#ECEEF1] flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="h-10 px-4 rounded-lg bg-white border border-[#E1E5E9] text-[#626A73] font-semibold text-xs hover:bg-[#F5F7F9] hover:text-[#17191C] transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleBatchDownload}
            disabled={isExporting || selectedIds.length === 0}
            className="h-10 px-5 rounded-lg bg-brand-primary text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-brand-hover active:bg-brand-pressed transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
          >
            <IoDownload className="w-4 h-4" />
            <span>{isExporting ? "Generating ZIP..." : `Export ${selectedIds.length} Cards (ZIP)`}</span>
          </button>
        </div>

        {/* Hidden offscreen canvas for rendering target card cleanly with html-to-image */}
        <div
          style={{
            position: "fixed",
            left: "-9999px",
            top: "-9999px",
            opacity: 1,
            pointerEvents: "none",
            zIndex: -1,
          }}
        >
          {renderingCard && (
            <div
              ref={renderContainerRef}
              style={{
                width: renderingCard.customization.orientation === "landscape" ? "880px" : "680px",
                boxSizing: "border-box",
              }}
            >
              <CanvasWrapper
                background={renderingCard.customization.canvasBackground}
                padding={renderingCard.customization.canvasPadding}
                backgroundBlur={renderingCard.customization.backgroundBlur}
              >
                <PostCard
                  post={renderingCard.post}
                  customization={{
                    ...renderingCard.customization,
                    isEditable: false,
                  }}
                  onUpdatePost={() => {}}
                />
              </CanvasWrapper>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
