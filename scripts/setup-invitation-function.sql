-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
  email_html TEXT;
  result JSON;
BEGIN
  -- Create invitation URL
  invitation_url := 'https://skywide.co/invite/' || p_invitation_token;
  
  -- Create email HTML
  email_html := '<!DOCTYPE html>
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
      <h2 style="color: white; margin-top: 0;">You''re Invited!</h2>
      <p style="color: #E5E7EB;">Hello' || CASE WHEN p_full_name IS NOT NULL AND p_full_name != '' THEN ' ' || p_full_name ELSE '' END || ',</p>
      <p style="color: #E5E7EB;">You''ve been invited to join the SKYWIDE internal staff dashboard as a <strong style="color: #60A5FA;">' || p_role || '</strong>.</p>
      <p style="color: #E5E7EB;">SKYWIDE is our AI-powered content creation and project management platform that helps streamline our workflow and boost productivity.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="' || invitation_url || '" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Accept Invitation</a>
      </div>
      
      <p style="font-size: 14px; color: #9CA3AF;">
        This invitation will expire in 7 days. If you have any questions, please contact your administrator.
      </p>
      
      <hr style="border: none; border-top: 1px solid #374151; margin: 20px 0;">
      
      <p style="font-size: 12px; color: #6B7280;">
        If the button doesn''t work, copy and paste this link into your browser:<br>
        <a href="' || invitation_url || '" style="color: #60A5FA; word-break: break-all;">' || invitation_url || '</a>
      </p>
    </div>
    
    <div style="text-align: center; margin-top: 30px; padding: 20px; color: #6B7280; font-size: 12px;">
      <p>© 2024 SKYWIDE. All rights reserved.</p>
    </div>
  </body>
</html>';

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
      'invitation_url', invitation_url,
      'email_html_length', length(email_html)
    )
  );
  
  -- Return success response
  result := json_build_object(
    'success', true,
    'message', 'Invitation email prepared',
    'invitation_url', invitation_url,
    'email', p_email
  );
  
  RETURN result;
END;
$$;

-- Test the function works
SELECT 'Function created successfully' as status;
