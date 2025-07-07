/**
 * In Vercel / production the two NEXT_PUBLIC_ variables will be defined.
 * When running in the v0 preview sandbox they may be undefined, which caused
 * “supabaseUrl is required.” to be thrown at import-time.
 *
 * We fall back to obvious placeholders so `createClient` can still run and
 * the rest of the UI renders.  A console warning lets developers know the
 * real values must be configured before shipping.
 */
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co /* ← set NEXT_PUBLIC_SUPABASE_URL */"

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "public-anon-key /* ← set NEXT_PUBLIC_SUPABASE_ANON_KEY */"

if (process.env.NEXT_PUBLIC_SUPABASE_URL === undefined || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === undefined) {
  // eslint-disable-next-line no-console
  console.warn(
    "[Supabase] Environment variables not found – using placeholders. " +
      "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY " +
      "to connect to your real project.",
  )
}

// Create a singleton instance to prevent multiple clients
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

// Export the instance for consistency
export default supabase
