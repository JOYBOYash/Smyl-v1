import { supabase, isSupabaseConfigured, isTableMissingError } from "../lib/supabase";
import { SavedCard } from "../utils/db";

export const CardRepository = {
  // Fetch user cards from Supabase (if authenticated)
  async getCards(userId?: string | null): Promise<SavedCard[]> {
    if (isSupabaseConfigured && userId) {
      try {
        const { data, error } = await supabase
          .from("saved_cards")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) {
          if (!isTableMissingError(error)) {
            console.error("Supabase getCards error:", error);
          }
          return [];
        }

        if (data && data.length > 0) {
          return data.map((row) => ({
            id: row.id,
            name: row.name,
            post: row.post,
            customization: row.customization,
            createdAt: row.created_at,
          }));
        }
      } catch (e) {
        console.error("Failed to fetch cloud cards:", e);
      }
    }
    return [];
  },

  // No-op for local storage cards (returns empty array)
  getLocalCards(): SavedCard[] {
    return [];
  },

  // Save or update a card in Supabase
  async saveCard(
    card: Omit<SavedCard, "createdAt"> & { createdAt?: string },
    userId?: string | null
  ): Promise<SavedCard> {
    const now = card.createdAt || new Date().toISOString();
    const fullCard: SavedCard = {
      ...card,
      createdAt: now,
    };

    // Persist to Supabase if authenticated
    if (isSupabaseConfigured && userId) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(card.id);

        const payload: any = {
          user_id: userId,
          name: card.name,
          platform: card.customization.platform || card.post.platform || "x",
          post: card.post,
          customization: card.customization,
          source_url: card.post.content?.links?.[0] || null,
        };

        if (isUuid) {
          payload.id = card.id;
        }

        const { data, error } = await supabase
          .from("saved_cards")
          .upsert(payload, { onConflict: "id" })
          .select()
          .single();

        if (error) {
          if (!isTableMissingError(error)) {
            console.error("Supabase saveCard error:", error);
          }
        } else if (data) {
          return {
            id: data.id,
            name: data.name,
            post: data.post,
            customization: data.customization,
            createdAt: data.created_at,
          };
        }
      } catch (e) {
        console.error("Error in cloud card save:", e);
      }
    }

    return fullCard;
  },

  // Delete a card from Supabase
  async deleteCard(cardId: string, userId?: string | null): Promise<boolean> {
    if (isSupabaseConfigured && userId) {
      try {
        const { error } = await supabase
          .from("saved_cards")
          .delete()
          .eq("id", cardId)
          .eq("user_id", userId);

        if (error) {
          if (!isTableMissingError(error)) {
            console.error("Supabase deleteCard error:", error);
          }
          return false;
        }
        return true;
      } catch (e) {
        console.error("Error in cloud card deletion:", e);
        return false;
      }
    }
    return false;
  },

  // No-op migration since local storage support is removed
  async migrateLocalCards(userId: string): Promise<number> {
    return 0;
  },
};
