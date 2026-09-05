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
  // Get all cards
  getAll(): SavedCard[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data) as SavedCard[];
    } catch (e) {
      console.error("Database read error:", e);
      return [];
    }
  },

  // Save draft state for recovery on page refresh
  saveDraft(post: ParsedPost, customization: CardCustomization): void {
    try {
      const draft = {
        post,
        customization,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch (e) {
      console.error("Draft save error:", e);
    }
  },

  // Retrieve auto-saved draft state
  getDraft(): { post: ParsedPost; customization: CardCustomization; updatedAt?: string } | null {
    try {
      const data = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch (e) {
      console.error("Draft read error:", e);
      return null;
    }
  },

  // Clear auto-saved draft
  clearDraft(): void {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (e) {
      console.error("Draft clear error:", e);
    }
  },

  // Get a single card by ID
  getById(id: string): SavedCard | null {
    const cards = this.getAll();
    return cards.find((c) => c.id === id) || null;
  },

  // Save a new card or update an existing one
  save(card: Omit<SavedCard, "createdAt"> & { createdAt?: string }): SavedCard {
    const cards = this.getAll();
    const existingIndex = cards.findIndex((c) => c.id === card.id);

    const now = new Date().toISOString();
    const fullCard: SavedCard = {
      ...card,
      createdAt: card.createdAt || now,
    };

    if (existingIndex > -1) {
      cards[existingIndex] = fullCard;
    } else {
      cards.unshift(fullCard); // Add to the top
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch (e) {
      console.error("Database write error:", e);
    }

    return fullCard;
  },

  // Delete a card
  delete(id: string): boolean {
    const cards = this.getAll();
    const filtered = cards.filter((c) => c.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (e) {
      console.error("Database delete error:", e);
      return false;
    }
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
