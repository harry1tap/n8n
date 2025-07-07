import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Generate a secure temporary password
function generateTemporaryPassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%"
  let password = ""
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Send welcome email using Resend
async function sendWelcomeEmail(
  email: string,
  fullName: string,
  role: string,
  temporaryPassword: string,
): Promise<boolean> {
  try {
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
      <p style="color: #E5E7EB;">Your SKYWIDE account has been created with <strong style="color: #60A5FA;">${role}</strong> access.</p>
      
      <div style="background: #0F1B2E; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #60A5FA; margin-top: 0;">Login Credentials</h3>
        <p style="color: #E5E7EB; margin: 5px 0;"><strong>Email:</strong> ${email}</p>
        <p style="color: #E5E7EB; margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #1E3A5F; padding: 2px 6px; border-radius: 4px; color: #60A5FA;">${temporaryPassword}</code></p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Login to SKYWIDE</a>
      </div>
      
      <div style="background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <p style="color: #92400E; margin: 0; font-size: 14px;">
          <strong>⚠️ Important:</strong> Please change your password after your first login.
        </p>
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 30px; padding: 20px; color: #6B7280; font-size: 12px;">
      <p>© 2024 SKYWIDE. All rights reserved.</p>
    </div>
  </body>
</html>`

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SKYWIDE <noreply@skywide.co>",
        to: [email],
        subject: "Welcome to SKYWIDE - Your Account is Ready",
        html: emailHtml,
      }),
    })

    return response.ok
  } catch (error) {
    console.error("Email sending failed:", error)
    return false
  }
}

export default async function handler(req: NextRequest) {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
  }

  try {
    // Parse request body
    const body = await req.json()
    const { email, fullName, role } = body

    // Handle test requests
    if (body.test) {
      return NextResponse.json({
        success: true,
        message: "Edge Function is working correctly",
        timestamp: new Date().toISOString(),
      })
    }

    // Validate required fields
    if (!email || !fullName || !role) {
      return NextResponse.json({ error: "Missing required fields: email, fullName, role" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate role
    if (!["admin", "user"].includes(role)) {
      return NextResponse.json({ error: 'Invalid role. Must be "admin" or "user"' }, { status: 400 })
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(email)
    if (existingUser.user) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Generate temporary password
    const temporaryPassword = generateTemporaryPassword()

    // Create user in Supabase Auth
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: role,
        created_by_admin: true,
        temporary_password: true,
      },
    })

    if (createError || !newUser.user) {
      console.error("Error creating user:", createError)
      return NextResponse.json({ error: "Failed to create user account" }, { status: 500 })
    }

    // Update user profile in profiles table
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
      id: newUser.user.id,
      email: email,
      full_name: fullName,
      role: role,
      is_active: true,
    })

    if (profileError) {
      console.error("Error creating profile:", profileError)
      // Clean up auth user if profile creation failed
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
      return NextResponse.json({ error: "Failed to create user profile" }, { status: 500 })
    }

    // Send welcome email
    const emailSent = await sendWelcomeEmail(email, fullName, role, temporaryPassword)

    // Return success response
    const result = {
      success: true,
      message: `User ${fullName} created successfully${emailSent ? " and welcome email sent" : " but email failed to send"}`,
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
    }

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
  } catch (error: any) {
    console.error("Edge function error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}

export const config = {
  runtime: "edge",
}
