import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://vdjfjytmzhoyqikbzxut.supabase.co"
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error("SUPABASE_SERVICE_ROLE_KEY environment variable is required")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupInvitationFunction() {
  console.log("Setting up invitation function...")

  const functionSQL = `
-- Create the send-invitation function
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
`

  try {
    const { data, error } = await supabase.rpc("exec_sql", { sql: functionSQL })

    if (error) {
      console.error("Error creating function:", error)
      return
    }

    console.log("✅ Invitation function created successfully!")

    // Test the function
    console.log("Testing function...")
    const testResult = await supabase.rpc("edge_send_invitation", {
      p_email: "test@example.com",
      p_full_name: "Test User",
      p_role: "user",
      p_invitation_id: "00000000-0000-0000-0000-000000000000",
      p_invitation_token: "test-token-123",
    })

    if (testResult.error) {
      console.error("Function test failed:", testResult.error)
    } else {
      console.log("✅ Function test successful:", testResult.data)
    }
  } catch (error) {
    console.error("Setup failed:", error)
  }
}

setupInvitationFunction()
