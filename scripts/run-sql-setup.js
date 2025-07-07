import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://vdjfjytmzhoyqikbzxut.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkamZqeXRtemhveXFpa2J6eHV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4OTQ2MjMsImV4cCI6MjA2NzQ3MDYyM30.SZNQ2eGyXPAiPyjV3QM4YvMaDnPFdwa2WbiCfLeSdDE"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function setupFunction() {
  console.log("🚀 Setting up invitation function in Supabase...")

  try {
    // First, let's check if we can connect
    const { data: testData, error: testError } = await supabase.from("profiles").select("count").limit(1)

    if (testError) {
      console.error("❌ Connection test failed:", testError.message)
      return
    }

    console.log("✅ Connected to Supabase successfully")

    // The function should be created directly in Supabase SQL Editor
    console.log("📝 Please run the following SQL in your Supabase SQL Editor:")
    console.log("👉 Go to: https://supabase.com/dashboard/project/vdjfjytmzhoyqikbzxut/sql")
    console.log("")
    console.log("-- Copy and paste this SQL:")
    console.log(`
CREATE OR REPLACE FUNCTION edge_send_invitation(
  p_email TEXT,
  p_full_name TEXT,
  p_role TEXT,
  p_invitation_id UUID,
  p_invitation_token TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_url TEXT;
  result JSON;
BEGIN
  -- Create invitation URL
  invitation_url := 'https://skywide.co/invite/' || p_invitation_token;
  
  -- Log the invitation attempt
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
  VALUES (
    auth.uid(),
    'SEND_INVITATION_EMAIL',
    'invitation',
    p_invitation_id,
    jsonb_build_object(
      'email', p_email,
      'role', p_role,
      'invitation_url', invitation_url
    )
  );
  
  -- Return success response
  result := json_build_object(
    'success', true,
    'message', 'Invitation created successfully! Share this link: ' || invitation_url,
    'invitation_url', invitation_url,
    'email', p_email
  );
  
  RETURN result;
END;
$$;
    `)

    console.log("")
    console.log("✅ After running the SQL, your invitation system will be ready!")
    console.log("🎉 You can then test creating invitations through the admin panel")
  } catch (error) {
    console.error("❌ Setup failed:", error)
  }
}

setupFunction()
