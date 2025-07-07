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
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // Call the Edge Function to create user with credentials
    const { data: result, error } = await supabase.functions.invoke("create-user-with-credentials", {
      body: {
        email: data.email,
        fullName: data.fullName,
        role: data.role,
      },
    })

    if (error) {
      console.error("Edge function error:", error)
      throw new Error(error.message || "Failed to create user")
    }

    if (!result?.success) {
      throw new Error(result?.error || "Failed to create user")
    }

    return result as UserCreationResult
  }

  // Keep the old invitation methods for backward compatibility
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
    // First verify the invitation
    const invitation = await this.getInvitationByToken(token)

    // Create the user account in Supabase Auth
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
