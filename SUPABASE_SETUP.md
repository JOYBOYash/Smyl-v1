# Supabase Setup & OAuth Configuration for Smyl

This document outlines the required configuration for deploying Smyl with Supabase and Google OAuth.

---

## 1. Environment Variables

Configure the following variables in your hosting environment (e.g. `.env` or deployment settings):

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...

# Gemini API Key (Server-side only)
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Security Note**: Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend bundles. All client interactions utilize `VITE_SUPABASE_ANON_KEY` combined with PostgreSQL Row Level Security (RLS).

---

## 2. Database Migrations

Apply the migration located at:
`supabase/migrations/20260901_initial_schema.sql`

This migration creates:
- `public.profiles` with RLS (Select, Insert, Update restricted to `auth.uid() = id`)
- `public.saved_cards` with RLS (Full CRUD restricted to `auth.uid() = user_id`)
- `public.user_assets` with RLS (Restricted to `auth.uid() = user_id`)
- Private storage bucket `user-assets` with folder-scoped policies (`avatars/<user_id>/*`)
- Public view `public.public_profiles` exposing strictly non-sensitive fields

---

## 3. Google OAuth Setup (Supabase Dashboard)

To enable Google Sign-In:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Navigate to **APIs & Services > Credentials**.
3. Create an **OAuth 2.0 Client ID**:
   - Application type: **Web application**
   - Authorized JavaScript origins:
     - `https://your-project-ref.supabase.co`
     - Your application domain (e.g. `https://your-app.run.app`)
   - Authorized redirect URIs:
     - `https://your-project-ref.supabase.co/auth/v1/callback`
4. Copy the **Client ID** and **Client Secret**.
5. In your **Supabase Dashboard**:
   - Navigate to **Authentication > Providers > Google**.
   - Toggle **Enable Google provider**.
   - Paste the **Client ID** and **Client Secret**.
   - Save changes.
6. In **Authentication > URL Configuration**:
   - Set **Site URL** to your production application URL.
   - Add your local and preview URLs to **Redirect URLs**.

---

## 4. Offline & Fallback Resiliency

When `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` are not configured or the network is offline:
- Smyl runs seamlessly in **Local Resilient Mode**.
- Saved cards and drafts automatically persist to browser `localStorage` / `IndexedDB`.
- When the user signs in or connects Supabase credentials, existing local cards are automatically migrated to their authenticated cloud account with collision prevention.
