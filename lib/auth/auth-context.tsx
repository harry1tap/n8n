"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase/client"

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("AuthProvider: Getting initial session...")
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log("AuthProvider: Initial session result:", { session: !!session, error })
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("AuthProvider: Auth state changed:", { event: _event, session: !!session })
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log("AuthProvider: Attempting sign in for:", email)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    console.log("AuthProvider: Sign in result:", { user: !!data.user, session: !!data.session, error })
    return { error }
  }

  const signOut = async () => {
    console.log("AuthProvider: Signing out...")
    await supabase.auth.signOut()
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signOut,
  }

  console.log("AuthProvider: Current state:", { user: !!user, session: !!session, loading })

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
