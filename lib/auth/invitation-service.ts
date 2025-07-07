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
    const { data: result, error } = await supabase.rpc("create_invitation", {
      p_email: data.email,
      p_role: data.role,
      p_invited_by: (await supabase.auth.getUser()).data.user?.id,
    })

    if (error) throw error

    // Send invitation email via API route
    const response = await fetch("/api/invitations/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        invitationId: result,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to send invitation email")
    }

    return result
  }

  static async getInvitations() {
    const { data, error } = await supabase
      .from("invitations")
      .select(
        `
        *,
        invited_by:profiles!invitations_invited_by_fkey(email, full_name)
      `,
      )
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

  static async acceptInvitation(token: string, password: string) {
    // First verify the invitation
    const invitation = await this.getInvitationByToken(token)

    // Create the user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: invitation.email,
      password,
      options: {
        data: {
          invitation_token: token,
        },
      },
    })

    if (authError) throw authError

    return authData
  }

  static async deactivateUser(userId: string) {
    const { data, error } = await supabase.rpc("deactivate_user", {
      p_user_id: userId,
      p_admin_id: (await supabase.auth.getUser()).data.user?.id,
    })

    if (error) throw error
    return data
  }
}
