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

    // Check if Edge Function exists by testing connectivity
    console.log("🔍 Testing Edge Function connectivity...")

    try {
      const testResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-user-with-credentials`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
          },
          body: JSON.stringify({ test: true }),
        },
      )

      console.log("🧪 Direct fetch test result:", {
        status: testResponse.status,
        statusText: testResponse.statusText,
        ok: testResponse.ok,
      })

      if (testResponse.status === 404) {
        throw new Error(
          "Edge Function 'create-user-with-credentials' is not deployed. Please deploy the function first.",
        )
      }
    } catch (fetchError: any) {
      console.error("🚨 Direct fetch test failed:", fetchError)
      if (fetchError.message.includes("not deployed")) {
        throw fetchError
      }
    }

    // Call the Edge Function with enhanced error handling
    console.log("📡 Invoking Edge Function via Supabase client...")

    const { data: result, error: functionError } = await supabase.functions.invoke("create-user-with-credentials", {
      body: {
        email: data.email,
        fullName: data.fullName,
        role: data.role,
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })

    console.log("📨 Edge Function response:", {
      result,
      functionError,
      resultType: typeof result,
      errorType: typeof functionError,
    })

    // Enhanced error handling
    if (functionError) {
      console.error("❌ Edge Function error details:", {
        message: functionError.message,
        context: functionError.context,
        details: functionError.details,
        stack: functionError.stack,
      })

      // Provide specific error messages based on error type
      if (functionError.message?.includes("FunctionsRelayError")) {
        throw new Error("Edge Function deployment error. The function may not be properly deployed or configured.")
      } else if (functionError.message?.includes("FunctionsFetchError")) {
        throw new Error("Network error connecting to Edge Function. Please check your connection and try again.")
      } else if (functionError.message?.includes("FunctionsHttpError")) {
        throw new Error(`Edge Function HTTP error: ${functionError.message}`)
      } else {
        throw new Error(`Edge Function error: ${functionError.message || "Unknown error occurred"}`)
      }
    }

    if (!result) {
      throw new Error("No response received from Edge Function. The function may have failed silently.")
    }

    if (typeof result !== "object") {
      console.warn("⚠️ Unexpected response type:", typeof result, result)
      throw new Error("Invalid response format from Edge Function")
    }

    if (!result.success) {
      throw new Error(result.error || result.message || "User creation failed")
    }

    console.log("✅ User created successfully:", result)
    return result as UserCreationResult
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
