import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/runtime.ts" // Declare Deno variable

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// Generate a secure temporary password
function generateTemporaryPassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%"
  let password = ""
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    )

    // Create regular client to verify the requesting user
    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: {
        headers: { Authorization: req.headers.get("Authorization")! },
      },
    })

    // Get the current user making the request
    const {
      data: { user: requestingUser },
    } = await supabaseClient.auth.getUser()

    if (!requestingUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Check if requesting user is admin
    const { data: profile } = await supabaseClient.from("profiles").select("role").eq("id", requestingUser.id).single()

    if (profile?.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden - Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const { email, fullName, role } = await req.json()

    if (!email || !fullName || !role) {
      return new Response(JSON.stringify({ error: "Missing required fields: email, fullName, role" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(email)
    if (existingUser.user) {
      return new Response(JSON.stringify({ error: "User with this email already exists" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Generate temporary password
    const temporaryPassword = generateTemporaryPassword()

    // Create user in Supabase Auth
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName,
        role: role,
        created_by_admin: true,
        temporary_password: true,
      },
    })

    if (createError || !newUser.user) {
      console.error("Error creating user:", createError)
      return new Response(JSON.stringify({ error: "Failed to create user account" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Update the user's profile in the profiles table
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
      id: newUser.user.id,
      email: email,
      full_name: fullName,
      role: role,
      is_active: true,
      invited_by: requestingUser.id,
    })

    if (profileError) {
      console.error("Error creating profile:", profileError)
      // Try to clean up the auth user if profile creation failed
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
      return new Response(JSON.stringify({ error: "Failed to create user profile" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Send welcome email with credentials using Resend
    const emailHtml = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to SKYWIDE</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0B1426;">
    <div style="background: linear-gradient(135deg, #1f2937 0%, #0B1426 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
      <h1 style="color: white; margin: 0; font-size: 28px;">SKYWIDE</h1>
      <p style="color: #60A5FA; margin: 10px 0 0 0; font-size: 14px;">POWERED BY SEOBRAND AI</p>
    </div>
    
    <div style="background: #1E3A5F; padding: 30px; border-radius: 10px; border-left: 4px solid #2563eb;">
      <h2 style="color: white; margin-top: 0;">Welcome to SKYWIDE!</h2>
      <p style="color: #E5E7EB;">Hello ${fullName},</p>
      <p style="color: #E5E7EB;">Your SKYWIDE account has been created with <strong style="color: #60A5FA;">${role}</strong> access. You can now log in to the dashboard using the credentials below:</p>
      
      <div style="background: #0F1B2E; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #60A5FA; margin-top: 0;">Login Credentials</h3>
        <p style="color: #E5E7EB; margin: 5px 0;"><strong>Email:</strong> ${email}</p>
        <p style="color: #E5E7EB; margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #1E3A5F; padding: 2px 6px; border-radius: 4px; color: #60A5FA;">${temporaryPassword}</code></p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://skywide.co" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Login to SKYWIDE</a>
      </div>
      
      <div style="background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <p style="color: #92400E; margin: 0; font-size: 14px;">
          <strong>⚠️ Important:</strong> Please change your password after your first login for security purposes.
        </p>
      </div>
      
      <p style="color: #E5E7EB;">SKYWIDE is our AI-powered content creation and project management platform. You now have access to:</p>
      <ul style="color: #E5E7EB;">
        <li>Content creation tools</li>
        <li>Project management dashboard</li>
        <li>Analytics and reporting</li>
        ${role === "admin" ? "<li>Admin panel for user management</li>" : ""}
      </ul>
      
      <p style="font-size: 14px; color: #9CA3AF;">
        If you have any questions or need help getting started, please contact your administrator.
      </p>
    </div>
    
    <div style="text-align: center; margin-top: 30px; padding: 20px; color: #6B7280; font-size: 12px;">
      <p>© 2024 SKYWIDE. All rights reserved.</p>
    </div>
  </body>
</html>`

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "SKYWIDE <noreply@skywide.co>",
        to: [email],
        subject: "Welcome to SKYWIDE - Your Account is Ready",
        html: emailHtml,
      }),
    })

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text()
      console.error("Resend error:", errorData)
      // Don't fail the entire operation if email fails, but log it
      console.warn("User created successfully but email failed to send")
    }

    // Log the action
    await supabaseAdmin.from("audit_logs").insert({
      user_id: requestingUser.id,
      action: "CREATE_USER_WITH_CREDENTIALS",
      resource_type: "user",
      resource_id: newUser.user.id,
      details: {
        email: email,
        full_name: fullName,
        role: role,
        email_sent: resendResponse.ok,
      },
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: `User ${fullName} created successfully and welcome email sent to ${email}`,
        user: {
          id: newUser.user.id,
          email: email,
          full_name: fullName,
          role: role,
        },
        credentials: {
          email: email,
          temporary_password: temporaryPassword,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Edge function error:", error)
    return new Response(JSON.stringify({ error: "Internal server error", details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
