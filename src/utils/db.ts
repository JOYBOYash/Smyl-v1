import { ParsedPost, CardCustomization } from "../types";

export interface SavedCard {
  id: string;
  name: string;
  post: ParsedPost;
  customization: CardCustomization;
  createdAt: string;
}

const STORAGE_KEY = "smyl_saved_cards_db";
const DRAFT_STORAGE_KEY = "smyl_generator_draft_v1";

export const CardDatabase = {
  // Get all cards (disabled local storage support)
  getAll(): SavedCard[] {
    return [];
  },

  // Save draft state (disabled local storage support)
  saveDraft(post: ParsedPost, customization: CardCustomization): void {
    // No-op: Local storage draft support removed
  },

  // Retrieve auto-saved draft state (disabled local storage support)
  getDraft(): { post: ParsedPost; customization: CardCustomization; updatedAt?: string } | null {
    return null;
  },

  // Clear auto-saved draft (disabled local storage support)
  clearDraft(): void {
    // No-op: Local storage draft support removed
  },

  // Get a single card by ID (disabled local storage support)
  getById(id: string): SavedCard | null {
    return null;
  },

  // Save a new card or update an existing one (disabled local storage support)
  save(card: Omit<SavedCard, "createdAt"> & { createdAt?: string }): SavedCard {
    const now = new Date().toISOString();
    return {
      ...card,
      createdAt: card.createdAt || now,
    };
  },

  // Delete a card (disabled local storage support)
  delete(id: string): boolean {
    return true;
  },

  // Generate a shareable link using Base64 encoded URL
  generateShareLink(post: ParsedPost, customization: CardCustomization): string {
    try {
      const state = { post, customization };
      const json = JSON.stringify(state);
      const b64 = btoa(encodeURIComponent(json));
      const url = new URL(window.location.href);
      url.searchParams.set("share", b64);
      return url.toString();
    } catch (e) {
      console.error("Failed to generate share link:", e);
      return window.location.href;
    }
  },

  // Decode a shareable link state
  decodeShareLink(hashOrQuery: string): { post: ParsedPost; customization: CardCustomization } | null {
    try {
      const json = decodeURIComponent(atob(hashOrQuery));
      return JSON.parse(json);
    } catch (e) {
      console.error("Failed to decode share link:", e);
      return null;
    }
  },
};
