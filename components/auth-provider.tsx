"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { clearFavoritesFromStorage } from "@/app/dashboard/page"

type AuthContextType = {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)

      // Handle successful sign in
      if (event === "SIGNED_IN" && session) {
        const redirectTo = new URLSearchParams(window.location.search).get("redirectTo")
        if (redirectTo) {
          router.push(redirectTo)
        } else {
          router.push("/dashboard")
        }
      }

      // Handle sign out
      if (event === "SIGNED_OUT") {
        clearFavoritesFromStorage()
        router.push("/")
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleSignOut = async () => {
    setLoading(true)
    clearFavoritesFromStorage()
    await supabase.auth.signOut()
    setLoading(false)
  }

  return <AuthContext.Provider value={{ user, loading, signOut: handleSignOut }}>{children}</AuthContext.Provider>
}
