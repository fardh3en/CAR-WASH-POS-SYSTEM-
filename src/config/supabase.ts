import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { isSupabaseActive, isSupabaseConfigured } from './backend'

export { isSupabaseConfigured }

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase: SupabaseClient | null = isSupabaseActive && supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null

export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    throw new Error('Supabase is not the selected, configured backend.')
  }
  return supabase
}
