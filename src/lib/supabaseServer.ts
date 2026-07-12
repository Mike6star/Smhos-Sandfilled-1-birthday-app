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
  const supabase = createServerClientForActions()
  // Set the service role key for admin operations
  supabase.auth.setAuth(process.env.SUPABASE_SERVICE_ROLE_KEY!)
  return supabase
}