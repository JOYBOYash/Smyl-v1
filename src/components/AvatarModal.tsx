import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IoClose, IoCloudUpload, IoCheckmark, IoTrash, IoPerson, IoImage } from "react-icons/io5";

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedAvatars: string[];
  currentAvatarUrl?: string;
  onSelectAvatar: (url: string) => void;
  onUploadAvatar: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDropAvatar: (e: React.DragEvent<HTMLDivElement>) => void;
  onDeleteAvatar: (url: string, e: React.MouseEvent) => void;
  onRemovePhoto: () => void;
}

export const AvatarModal: React.FC<AvatarModalProps> = ({
  isOpen,
  onClose,
  savedAvatars,
  currentAvatarUrl,
  onSelectAvatar,
  onUploadAvatar,
  onDropAvatar,
  onDeleteAvatar,
  onRemovePhoto,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#E1E5E9] overflow-hidden z-10"
        >
          {/* Header */}
          <div className="p-5 border-b border-[#E1E5E9] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-soft flex items-center justify-center text-brand-primary">
                <IoImage className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-[#17191C] text-base leading-snug">
                  Avatar Library
                </h3>
                <p className="text-xs text-[#626A73]">
                  Select a profile picture or upload your custom photo
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#626A73] hover:text-[#17191C] hover:bg-[#EDF1F5] transition-colors cursor-pointer"
            >
              <IoClose className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                onUploadAvatar(e);
              }}
              accept="image/*"
              className="hidden"
            />

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                setIsDragOver(false);
                onDropAvatar(e);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                isDragOver
                  ? "border-brand-primary bg-brand-soft/40 scale-[1.01]"
                  : "border-[#D0D7DE] bg-[#F8FAFC] hover:border-brand-primary hover:bg-white"
              }`}
            >
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-white border border-[#D0D7DE] flex items-center justify-center text-brand-primary shadow-xs">
                  <IoCloudUpload className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-[#17191C]">
                  Upload new avatar photo
                </span>
                <span className="text-[11px] text-[#8D959F]">
                  PNG, JPG, WebP or GIF up to 5MB (Drag & drop or click)
                </span>
              </div>
            </div>

            {/* Remove / Initials Action */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#626A73]">
                Available Avatars ({savedAvatars.length})
              </span>
              {currentAvatarUrl && (
                <button
                  type="button"
                  onClick={() => {
                    onRemovePhoto();
                  }}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <IoPerson className="w-3.5 h-3.5" />
                  <span>Use Initials (No Photo)</span>
                </button>
              )}
            </div>

            {/* Avatars Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {savedAvatars.map((url, idx) => {
                const isSelected = currentAvatarUrl === url;
                return (
                  <div
                    key={idx}
                    className="relative group/avatar aspect-square"
                  >
                    {/* Circle Image Container */}
                    <div
                      onClick={() => {
                        onSelectAvatar(url);
                      }}
                      className={`w-full h-full cursor-pointer rounded-full border-2 transition-all overflow-hidden relative ${
                        isSelected
                          ? "border-brand-primary ring-2 ring-brand-primary/30 shadow-xs"
                          : "border-[#D0D7DE] hover:border-brand-primary opacity-90 hover:opacity-100"
                      }`}
                      title="Select this avatar"
                    >
                      <img
                        src={url}
                        alt={`Avatar ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-brand-primary/40 flex items-center justify-center">
                          <IoCheckmark className="w-4 h-4 text-white font-bold" />
                        </div>
                      )}
                    </div>

                    {/* Delete Button (Floating on top of outer border ring) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteAvatar(url, e);
                      }}
                      className="absolute -top-1 -right-1 z-20 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-1 opacity-0 group-hover/avatar:opacity-100 transition-all cursor-pointer shadow-md border-2 border-white hover:scale-110"
                      title="Delete avatar"
                    >
                      <IoTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-[#F8FAFC] border-t border-[#E1E5E9] flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-brand-primary text-white font-semibold text-xs hover:bg-brand-hover transition-colors cursor-pointer shadow-xs"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
