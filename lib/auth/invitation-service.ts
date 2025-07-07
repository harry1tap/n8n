import { supabase } from "@/lib/supabase/client"

export interface CreateUserData {
  email: string
  fullName: string
  role: "admin" | "user"
}

export interface UserCreationResult {
  success: boolean
  message: string
  user?: {
    id: string
    email: string
    full_name: string
    role: string
  }
  credentials?: {
    email: string
    temporary_password: string
  }
}

export interface InvitationData {
  id: string
  email: string
  role: "admin" | "user"
  token: string
  status: "pending" | "accepted" | "expired"
  expires_at: string
  created_at: string
  invited_by: {
    email: string
    full_name: string
  }
}

export class InvitationService {
  static async createUserWithCredentials(data: CreateUserData): Promise<UserCreationResult> {
    console.log("🚀 InvitationService.createUserWithCredentials called with:", data)

    // Get current user and session
    const {
      data: { user, session },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("👤 Current authentication state:", {
      user: user?.email,
      session: !!session,
      authError,
    })

    if (!user || !session) {
      throw new Error("Authentication required: Please log in again")
    }

    // Verify admin role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    console.log("🔐 User profile check:", { profile, profileError })

    if (profileError) {
      throw new Error(`Profile verification failed: ${profileError.message}`)
    }

    if (profile?.role !== "admin") {
      throw new Error("Admin privileges required to create users")
    }

    // Call the Vercel Edge Function
    console.log("📡 Calling Vercel Edge Function...")

    try {
      const response = await fetch("/api/create-user-with-credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email: data.email,
          fullName: data.fullName,
          role: data.role,
        }),
      })

      const result = await response.json()

      console.log("📨 Edge Function response:", {
        status: response.status,
        result,
      })

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      if (!result.success) {
        throw new Error(result.error || result.message || "User creation failed")
      }

      console.log("✅ User created successfully:", result)
      return result as UserCreationResult
    } catch (error: any) {
      console.error("❌ Edge Function error:", error)

      if (error.message.includes("fetch")) {
        throw new Error("Network error: Could not connect to user creation service")
      }

      throw new Error(error.message || "Failed to create user")
    }
  }

  // Keep existing methods for backward compatibility
  static async getInvitations() {
    const { data, error } = await supabase
      .from("invitations")
      .select(`
        *,
        invited_by:profiles!invitations_invited_by_fkey(email, full_name)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data as InvitationData[]
  }

  static async getInvitationByToken(token: string) {
    const { data, error } = await supabase
      .from("invitations")
      .select("*")
      .eq("token", token)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .single()

    if (error) throw error
    return data
  }

  static async acceptInvitation(token: string, password: string, fullName: string) {
    const invitation = await this.getInvitationByToken(token)

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: invitation.email,
      password,
      options: {
        data: {
          full_name: fullName,
          invitation_token: token,
        },
      },
    })

    if (authError) throw authError
    return authData
  }

  static async deactivateUser(userId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase.rpc("deactivate_user", {
      p_user_id: userId,
      p_admin_id: user.id,
    })

    if (error) throw error
    return data
  }
}
