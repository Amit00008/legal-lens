import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://bhormxhmsizpneyvlbok.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJob3JteGhtc2l6cG5leXZsYm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTQzNzgsImV4cCI6MjA2NzI5MDM3OH0.Z3eUBj9iKl-a8umVuOz9wCbJ3tKVMmkjZiz831mw_bI"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
  status: "processing" | "completed" | "failed"
  risk_level?: "low" | "medium" | "high"
  created_at: string
  updated_at: string
}

export type Analysis = {
  id: string
  document_id: string
  summary: string
  risk_score: number
  key_findings: any[]
  categories: any[]
  suggested_questions: string[]
  created_at: string
}
