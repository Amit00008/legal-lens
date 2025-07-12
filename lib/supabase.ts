import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Types for our database
export type User = {
  id: string
  email: string
  created_at: string
  full_name?: string
}

export type Document = {
  id: string
  user_id: string
  title: string
  file_path: string
  status: string
  created_at: string
  processed_at: string | null
}

export type Analysis = {
  id: string
  document_id: string
  summary: string
  risk_score: string
  risks_detected: any
  categories: any
  suggested_questions: any
  created_at: string
}
