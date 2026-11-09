export type BackendProvider = 'firebase' | 'supabase'

export const BACKEND_PROVIDER: BackendProvider =
  import.meta.env.VITE_BACKEND_PROVIDER === 'supabase' ? 'supabase' : 'firebase'

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
)

export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET &&
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID &&
    import.meta.env.VITE_FIREBASE_APP_ID
)

export const isBackendConfigured =
  BACKEND_PROVIDER === 'supabase' ? isSupabaseConfigured : isFirebaseConfigured

export const isSupabaseActive = BACKEND_PROVIDER === 'supabase' && isSupabaseConfigured
export const isFirebaseActive = BACKEND_PROVIDER === 'firebase' && isFirebaseConfigured
