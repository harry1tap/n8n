/**
 * Creates a singleton Supabase browser client.
 *
 * In the v0 preview sandbox the two NEXT_PUBLIC_ variables might be undefined,
 * which would normally throw “supabaseUrl is required.”  We fall back to
 * placeholders so the UI can render while still warning the developer.
 */

import { createClient } from "@supabase/supabase-js"

/* ------------------------------------------------------------------
   If the NEXT_PUBLIC_ variables are missing (e.g. in a preview build)
   we fall back to harmless placeholders so createClient doesn’t throw.
------------------------------------------------------------------ */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "public-anon-key"

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    "[Supabase] Environment variables missing – using placeholders. " +
      "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY for a real connection.",
  )
}

// Singleton to avoid multiple client instances
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  }
  return supabaseInstance
})()

export default supabase
