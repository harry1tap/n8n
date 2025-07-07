import { supabase } from "@/lib/supabase/client"

export interface CreateInvitationData {
  email: string
  role: "admin" | "user"
  fullName?: string
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
  static async createInvitation(data: CreateInvitationData) {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // Create invitation using the database function
    const { data: result, error } = await supabase.rpc("create_invitation", {
      p_email: data.email,
      p_role: data.role,
      p_invited_by: user.id,
    })

    if (error) {
      console.error("Database error creating invitation:", error)
      throw new Error(error.message || "Failed to create invitation")
    }

    // Send invitation email via Supabase Edge Function
    const { data: emailResult, error: emailError } = await supabase.functions.invoke("send-invitation", {
      body: {
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        invitationId: result,
      },
    })

    if (emailError) {
      console.error("Email sending error:", emailError)
      throw new Error(emailError.message || "Failed to send invitation email")
    }

    if (!emailResult?.success) {
      throw new Error("Failed to send invitation email")
    }

    return result
  }

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
