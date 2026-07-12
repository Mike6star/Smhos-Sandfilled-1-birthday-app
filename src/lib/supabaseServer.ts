import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createServerClientForActions = () => {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

// Admin-only client using service role (bypasses RLS)
export const getAdminSupabase = () => {
    // Create the regular server client first
  const supabase = createServerClientForActions()

  // Instead of setAuth, we create a new client with the service role key
  // by directly using the Supabase client with the service role key
const { createClient } = require('@supabase/supabase-js')
const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

return adminClient
}