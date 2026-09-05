import { supabase, isSupabaseConfigured } from "../lib/supabase";

export const StorageService = {
  // Upload avatar image to user-specific storage bucket
  async uploadAvatar(file: File, userId: string): Promise<{ url?: string; path?: string; error?: Error }> {
    if (!file || !userId) {
      return { error: new Error("File and authenticated user ID are required") };
    }

    // Client-side file verification
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return { error: new Error("Only JPEG, PNG, WEBP, and GIF images are supported") };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { error: new Error("File size must be under 5MB") };
    }

    // If Supabase is not configured, return base64 Data URL
    if (!isSupabaseConfigured) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ url: reader.result as string });
        reader.onerror = () => resolve({ error: new Error("Failed to read image file") });
        reader.readAsDataURL(file);
      });
    }

    try {
      const fileExt = file.name.split(".").pop() || "png";
      const cleanExt = fileExt.toLowerCase().replace(/[^a-z0-9]/g, "");
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${cleanExt}`;
      const filePath = `avatars/${userId}/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from("user-assets")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        // Fallback to base64 data URL
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ url: reader.result as string, path: filePath });
          reader.onerror = () => resolve({ error: new Error("Fallback read failed") });
          reader.readAsDataURL(file);
        });
      }

      // Create signed URL or public URL
      const { data: signedData, error: signError } = await supabase.storage
        .from("user-assets")
        .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year signed URL

      if (signError || !signedData?.signedUrl) {
        // Try public url
        const { data: publicData } = supabase.storage.from("user-assets").getPublicUrl(filePath);
        return { url: publicData.publicUrl, path: filePath };
      }

      // Record in user_assets metadata table
      try {
        await supabase.from("user_assets").insert({
          user_id: userId,
          storage_path: filePath,
          type: "avatar",
          mime_type: file.type,
          size: file.size,
        });
      } catch (metaErr) {
        console.error("Asset metadata insert error:", metaErr);
      }

      return { url: signedData.signedUrl, path: filePath };
    } catch (e: any) {
      console.error("Storage operation exception:", e);
      return { error: e };
    }
  },
};
