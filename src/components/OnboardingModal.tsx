import React, { useState } from "react";
import { IoPersonOutline, IoCheckmarkCircle, IoAlertCircle } from "react-icons/io5";
import { useAuth } from "../context/AuthContext";
import { SmylLogo } from "./SmylLogo";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, onCompleted }) => {
  const { profile, updateProfile } = useAuth();
  const [username, setUsername] = useState(profile?.username || "");
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg("Username is required.");
      return;
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (cleanUsername.length < 3) {
      setErrorMsg("Username must be at least 3 alphanumeric characters.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const { error } = await updateProfile({
      username: cleanUsername,
      display_name: displayName.trim() || cleanUsername,
      bio: bio.trim(),
      onboarding_completed: true,
    });

    setIsLoading(false);

    if (error) {
      setErrorMsg(error.message || "Failed to save profile. Username might be taken.");
    } else {
      onCompleted?.();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-2xl border border-[#E1E5E9] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-[#ECEEF1] flex items-center gap-3">
          <SmylLogo className="h-6 w-auto" />
          <div>
            <h3 className="font-bold text-[#17191C] text-base">Complete Your Profile</h3>
            <p className="text-xs text-[#626A73]">Set your public handle and display preferences</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <IoAlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#17191C] mb-1">
              Username Handle <span className="text-brand-primary">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8D959F]">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="alexrivera"
                className="w-full h-9.5 pl-7 pr-3 text-xs rounded-xl border border-[#D0D7DE] bg-white text-[#17191C] focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17191C] mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Alex Rivera"
              className="w-full h-9.5 px-3 text-xs rounded-xl border border-[#D0D7DE] bg-white text-[#17191C] focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17191C] mb-1">Headline / Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              placeholder="Founder & Product Designer at Studio..."
              className="w-full p-2.5 text-xs rounded-xl border border-[#D0D7DE] bg-white text-[#17191C] focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-xl border border-[#D0D7DE] bg-white text-[#626A73] hover:text-[#17191C] text-xs font-medium cursor-pointer"
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="h-9 px-5 rounded-xl bg-brand-primary text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-brand-hover active:bg-brand-pressed transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <IoCheckmarkCircle className="w-4 h-4" />
              <span>{isLoading ? "Saving..." : "Finish Onboarding"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
