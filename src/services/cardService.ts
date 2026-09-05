import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { SavedCard } from "../utils/db";

const LOCAL_STORAGE_KEY = "smyl_saved_cards_db";
const MIGRATION_FLAG_KEY = "smyl_cards_migrated_to_cloud_";

export const CardRepository = {
  // Fetch user cards (from Supabase if authenticated, otherwise local)
  async getCards(userId?: string | null): Promise<SavedCard[]> {
    if (isSupabaseConfigured && userId) {
      try {
        const { data, error } = await supabase
          .from("saved_cards")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Supabase getCards error:", error);
          // Fallback to local storage on error
          return this.getLocalCards();
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

        // If cloud is empty, check if we need to migrate local cards
        const local = this.getLocalCards();
        return local;
      } catch (e) {
        console.error("Failed to fetch cloud cards:", e);
        return this.getLocalCards();
      }
    }

    return this.getLocalCards();
  },

  // Read raw local storage cards
  getLocalCards(): SavedCard[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data) as SavedCard[];
    } catch (e) {
      console.error("Error reading local cards:", e);
      return [];
    }
  },

  // Save or update a card
  async saveCard(
    card: Omit<SavedCard, "createdAt"> & { createdAt?: string },
    userId?: string | null
  ): Promise<SavedCard> {
    const now = card.createdAt || new Date().toISOString();
    const fullCard: SavedCard = {
      ...card,
      createdAt: now,
    };

    // Always mirror to local storage for instant responsiveness & offline resiliency
    const local = this.getLocalCards();
    const existingIdx = local.findIndex((c) => c.id === card.id);
    if (existingIdx > -1) {
      local[existingIdx] = fullCard;
    } else {
      local.unshift(fullCard);
    }
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(local));
    } catch (e) {
      console.error("Failed to mirror local card save:", e);
    }

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
          console.error("Supabase saveCard error:", error);
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

  // Delete a card
  async deleteCard(cardId: string, userId?: string | null): Promise<boolean> {
    // Delete from local
    const local = this.getLocalCards();
    const filtered = local.filter((c) => c.id !== cardId);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    } catch (e) {}

    // Delete from Supabase if authenticated
    if (isSupabaseConfigured && userId) {
      try {
        const { error } = await supabase
          .from("saved_cards")
          .delete()
          .eq("id", cardId)
          .eq("user_id", userId);

        if (error) {
          console.error("Supabase deleteCard error:", error);
        }
      } catch (e) {
        console.error("Error in cloud card deletion:", e);
      }
    }

    return true;
  },

  // Migrate local cards to authenticated Supabase account
  async migrateLocalCards(userId: string): Promise<number> {
    if (!isSupabaseConfigured || !userId) return 0;

    const migrationKey = `${MIGRATION_FLAG_KEY}${userId}`;
    if (localStorage.getItem(migrationKey)) {
      return 0; // Already migrated for this user
    }

    const localCards = this.getLocalCards();
    if (localCards.length === 0) {
      localStorage.setItem(migrationKey, "done");
      return 0;
    }

    try {
      let migratedCount = 0;
      for (const card of localCards) {
        const payload = {
          user_id: userId,
          name: card.name,
          platform: card.customization.platform || card.post.platform || "x",
          post: card.post,
          customization: card.customization,
        };

        const { error } = await supabase.from("saved_cards").insert(payload);
        if (!error) {
          migratedCount++;
        }
      }

      localStorage.setItem(migrationKey, "done");
      return migratedCount;
    } catch (e) {
      console.error("Migration error:", e);
      return 0;
    }
  },
};
