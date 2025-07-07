import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@/lib/supabase/server"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, fullName, role, invitationId } = await request.json()

    // Verify the request is from an authenticated admin
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get invitation details
    const { data: invitation } = await supabase.from("invitations").select("token").eq("id", invitationId).single()

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 })
    }

    // Create invitation URL
    const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invitation.token}`

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "SKYWIDE <noreply@skywide.com>",
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
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1f2937 0%, #0B1426 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">SKYWIDE</h1>
              <p style="color: #93c5fd; margin: 10px 0 0 0; font-size: 14px;">POWERED BY SEOBRAND AI</p>
            </div>
            
            <div style="background: #f8fafc; padding: 30px; border-radius: 10px; border-left: 4px solid #2563eb;">
              <h2 style="color: #1f2937; margin-top: 0;">You're Invited!</h2>
              <p>Hello${fullName ? ` ${fullName}` : ""},</p>
              <p>You've been invited to join the SKYWIDE internal staff dashboard as a <strong>${role}</strong>.</p>
              <p>SKYWIDE is our AI-powered content creation and project management platform that helps streamline our workflow and boost productivity.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${invitationUrl}" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Accept Invitation</a>
              </div>
              
              <p style="font-size: 14px; color: #6b7280;">
                This invitation will expire in 7 days. If you have any questions, please contact your administrator.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              
              <p style="font-size: 12px; color: #9ca3af;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${invitationUrl}" style="color: #2563eb; word-break: break-all;">${invitationUrl}</a>
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding: 20px; color: #6b7280; font-size: 12px;">
              <p>© 2024 SKYWIDE. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({ success: true, messageId: data?.id })
  } catch (error) {
    console.error("Invitation send error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
