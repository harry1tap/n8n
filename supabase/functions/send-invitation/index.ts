import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/node/global.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: {
        headers: { Authorization: req.headers.get("Authorization")! },
      },
    })

    // Get the current user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Check if user is admin
    const { data: profile } = await supabaseClient.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const { email, fullName, role, invitationId } = await req.json()

    // Get invitation details
    const { data: invitation } = await supabaseClient
      .from("invitations")
      .select("token")
      .eq("id", invitationId)
      .single()

    if (!invitation) {
      return new Response(JSON.stringify({ error: "Invitation not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Create invitation URL
    const invitationUrl = `${Deno.env.get("APP_URL")}/invite/${invitation.token}`

    // Send email using Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "SKYWIDE <noreply@skywide.co>",
        to: [email],
        subject: "You're invited to join SKYWIDE",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>SKYWIDE Invitation</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0B1426;">
              <div style="background: linear-gradient(135deg, #1f2937 0%, #0B1426 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                <h1 style="color: white; margin: 0; font-size: 28px;">SKYWIDE</h1>
                <p style="color: #60A5FA; margin: 10px 0 0 0; font-size: 14px;">POWERED BY SEOBRAND AI</p>
              </div>
              
              <div style="background: #1E3A5F; padding: 30px; border-radius: 10px; border-left: 4px solid #2563eb;">
                <h2 style="color: white; margin-top: 0;">You're Invited!</h2>
                <p style="color: #E5E7EB;">Hello${fullName ? ` ${fullName}` : ""},</p>
                <p style="color: #E5E7EB;">You've been invited to join the SKYWIDE internal staff dashboard as a <strong style="color: #60A5FA;">${role}</strong>.</p>
                <p style="color: #E5E7EB;">SKYWIDE is our AI-powered content creation and project management platform that helps streamline our workflow and boost productivity.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${invitationUrl}" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Accept Invitation</a>
                </div>
                
                <p style="font-size: 14px; color: #9CA3AF;">
                  This invitation will expire in 7 days. If you have any questions, please contact your administrator.
                </p>
                
                <hr style="border: none; border-top: 1px solid #374151; margin: 20px 0;">
                
                <p style="font-size: 12px; color: #6B7280;">
                  If the button doesn't work, copy and paste this link into your browser:<br>
                  <a href="${invitationUrl}" style="color: #60A5FA; word-break: break-all;">${invitationUrl}</a>
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding: 20px; color: #6B7280; font-size: 12px;">
                <p>© 2024 SKYWIDE. All rights reserved.</p>
              </div>
            </body>
          </html>
        `,
      }),
    })

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text()
      console.error("Resend error:", errorData)
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const resendData = await resendResponse.json()

    return new Response(JSON.stringify({ success: true, messageId: resendData.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Edge function error:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
