-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  invitation_record RECORD;
BEGIN
  -- Check if there's a pending invitation for this email
  SELECT * INTO invitation_record 
  FROM invitations 
  WHERE email = NEW.email 
    AND status = 'pending' 
    AND expires_at > NOW()
  ORDER BY created_at DESC 
  LIMIT 1;

  -- Create profile with role from invitation or default to 'user'
  INSERT INTO public.profiles (id, email, full_name, role, invited_by)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(invitation_record.role, 'user'),
    invitation_record.invited_by
  );

  -- Mark invitation as accepted if it exists
  IF invitation_record.id IS NOT NULL THEN
    UPDATE invitations 
    SET status = 'accepted', accepted_at = NOW()
    WHERE id = invitation_record.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to generate invitation token
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$ LANGUAGE plpgsql;

-- Function to create invitation
CREATE OR REPLACE FUNCTION create_invitation(
  p_email TEXT,
  p_role user_role,
  p_invited_by UUID
)
RETURNS UUID AS $$
DECLARE
  invitation_id UUID;
  invitation_token TEXT;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_invited_by AND role = 'admin') THEN
    RAISE EXCEPTION 'Only admins can create invitations';
  END IF;

  -- Check if user already exists
  IF EXISTS (SELECT 1 FROM profiles WHERE email = p_email) THEN
    RAISE EXCEPTION 'User with this email already exists';
  END IF;

  -- Generate token
  invitation_token := generate_invitation_token();

  -- Create invitation
  INSERT INTO invitations (email, role, token, invited_by)
  VALUES (p_email, p_role, invitation_token, p_invited_by)
  RETURNING id INTO invitation_id;

  -- Log the action
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
  VALUES (p_invited_by, 'CREATE_INVITATION', 'invitation', invitation_id, 
          jsonb_build_object('email', p_email, 'role', p_role));

  RETURN invitation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deactivate user
CREATE OR REPLACE FUNCTION deactivate_user(
  p_user_id UUID,
  p_admin_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_admin_id AND role = 'admin') THEN
    RAISE EXCEPTION 'Only admins can deactivate users';
  END IF;

  -- Prevent admin from deactivating themselves
  IF p_user_id = p_admin_id THEN
    RAISE EXCEPTION 'Cannot deactivate yourself';
  END IF;

  -- Deactivate user
  UPDATE profiles 
  SET is_active = false, updated_at = NOW()
  WHERE id = p_user_id;

  -- Log the action
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
  VALUES (p_admin_id, 'DEACTIVATE_USER', 'profile', p_user_id, 
          jsonb_build_object('deactivated_user', p_user_id));

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
