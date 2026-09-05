import { supabase, isSupabaseConfigured, isTableMissingError } from "../lib/supabase";

export interface SavedQrCode {
  id: string;
  userId: string;
  name: string;
  url: string;
  configuration: {
    size: number;
    margin: number;
    foreground: string;
    background: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export const QrRepository = {
  // Fetch user QR codes from Supabase
  async getQrCodes(userId?: string | null): Promise<SavedQrCode[]> {
    if (isSupabaseConfigured && userId) {
      try {
        const { data, error } = await supabase
          .from("qr_codes")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) {
          if (!isTableMissingError(error)) {
            console.error("Supabase getQrCodes error:", error);
          }
          return [];
        }

        if (data && data.length > 0) {
          return data.map((row) => ({
            id: row.id,
            userId: row.user_id,
            name: row.name,
            url: row.url,
            configuration: row.configuration,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }));
        }
      } catch (e) {
        console.error("Failed to fetch cloud QR codes:", e);
      }
    }
    return [];
  },

  // Save or update a QR code in Supabase
  async saveQrCode(
    qrCode: Omit<SavedQrCode, "id"> & { id?: string },
    userId: string
  ): Promise<SavedQrCode | null> {
    if (isSupabaseConfigured && userId) {
      try {
        const payload: any = {
          user_id: userId,
          name: qrCode.name,
          url: qrCode.url,
          configuration: qrCode.configuration,
        };

        if (qrCode.id) {
          payload.id = qrCode.id;
        }

        const { data, error } = await supabase
          .from("qr_codes")
          .upsert(payload, { onConflict: "id" })
          .select()
          .single();

        if (error) {
          if (!isTableMissingError(error)) {
            console.error("Supabase saveQrCode error:", error);
          }
          return null;
        } else if (data) {
          return {
            id: data.id,
            userId: data.user_id,
            name: data.name,
            url: data.url,
            configuration: data.configuration,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        }
      } catch (e) {
        console.error("Error in cloud QR code save:", e);
      }
    }
    return null;
  },

  // Delete a QR code from Supabase
  async deleteQrCode(qrId: string, userId: string): Promise<boolean> {
    if (isSupabaseConfigured && userId) {
      try {
        const { error } = await supabase
          .from("qr_codes")
          .delete()
          .eq("id", qrId)
          .eq("user_id", userId);

        if (error) {
          if (!isTableMissingError(error)) {
            console.error("Supabase deleteQrCode error:", error);
          }
          return false;
        }
        return true;
      } catch (e) {
        console.error("Error in cloud QR code deletion:", e);
        return false;
      }
    }
    return false;
  },
};
