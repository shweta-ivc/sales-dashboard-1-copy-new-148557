import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for use in client components and client-side operations
 * This client automatically handles auth state and token refresh
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

