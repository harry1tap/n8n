-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('draft', 'in_progress', 'pending_review', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE content_type AS ENUM ('blog', 'website');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'user',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  invited_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invitations table
CREATE TABLE IF NOT EXISTS invitations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL,
  role user_role DEFAULT 'user',
  token TEXT UNIQUE NOT NULL,
  invited_by UUID REFERENCES profiles(id) NOT NULL,
  status invitation_status DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  type content_type NOT NULL,
  status project_status DEFAULT 'draft',
  assigned_to UUID REFERENCES profiles(id),
  created_by UUID REFERENCES profiles(id) NOT NULL,
  due_date DATE,
  keywords TEXT[],
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create content_requests table
CREATE TABLE IF NOT EXISTS content_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  article_title TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  seo_keywords TEXT NOT NULL,
  article_type content_type NOT NULL,
  client_name TEXT NOT NULL,
  creative_brief TEXT NOT NULL,
  submitted_by UUID REFERENCES profiles(id) NOT NULL,
  status project_status DEFAULT 'draft',
  webhook_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_logs table for tracking admin actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_projects_assigned_to ON projects(assigned_to);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_content_requests_submitted_by ON content_requests(submitted_by);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage invitations" ON invitations;
DROP POLICY IF EXISTS "Users can view invitations by token" ON invitations;
DROP POLICY IF EXISTS "Users can view their assigned projects" ON projects;
DROP POLICY IF EXISTS "Admins can manage all projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Users can view their own content requests" ON content_requests;
DROP POLICY IF EXISTS "Users can create content requests" ON content_requests;
DROP POLICY IF EXISTS "Admins can manage all content requests" ON content_requests;
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete profiles" ON profiles
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Invitations policies
CREATE POLICY "Admins can manage invitations" ON invitations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can view invitations by token" ON invitations
  FOR SELECT USING (true);

-- Projects policies
CREATE POLICY "Users can view their assigned projects" ON projects
  FOR SELECT USING (
    assigned_to = auth.uid() OR 
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage all projects" ON projects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can create projects" ON projects
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- Content requests policies
CREATE POLICY "Users can view their own content requests" ON content_requests
  FOR SELECT USING (
    submitted_by = auth.uid() OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can create content requests" ON content_requests
  FOR INSERT WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "Admins can manage all content requests" ON content_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Audit logs policies
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_content_requests_updated_at ON content_requests;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_requests_updated_at BEFORE UPDATE ON content_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

-- Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger to create profile on user signup
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

  -- Check if there's already a pending invitation for this email
  IF EXISTS (SELECT 1 FROM invitations WHERE email = p_email AND status = 'pending' AND expires_at > NOW()) THEN
    RAISE EXCEPTION 'There is already a pending invitation for this email';
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

-- Insert sample projects (these will be visible once you have users)
INSERT INTO projects (title, client_name, type, status, due_date, keywords, description, created_by) 
SELECT 
  'E-commerce SEO Strategy Guide',
  'TechCorp Inc.',
  'blog',
  'in_progress',
  '2024-02-15',
  ARRAY['e-commerce', 'SEO', 'strategy'],
  'Comprehensive guide on e-commerce SEO best practices',
  id
FROM profiles WHERE role = 'admin' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO projects (title, client_name, type, status, due_date, keywords, description, created_by) 
SELECT 
  'Homepage Content Optimization',
  'StartupXYZ',
  'website',
  'completed',
  '2024-01-10',
  ARRAY['homepage', 'conversion', 'optimization'],
  'Optimize homepage content for better conversions',
  id
FROM profiles WHERE role = 'admin' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO projects (title, client_name, type, status, due_date, keywords, description, created_by) 
SELECT 
  'Local SEO Best Practices',
  'Local Business Co.',
  'blog',
  'pending_review',
  '2024-02-20',
  ARRAY['local SEO', 'Google My Business', 'citations'],
  'Complete guide to local SEO optimization',
  id
FROM profiles WHERE role = 'admin' LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert sample content requests
INSERT INTO content_requests (article_title, target_audience, seo_keywords, article_type, client_name, creative_brief, submitted_by)
SELECT 
  'AI-Powered Content Creation Guide',
  'Digital marketers and content creators',
  'AI content, automation, marketing',
  'blog',
  'SKYWIDE Internal',
  'Create a comprehensive guide on how AI can revolutionize content creation workflows',
  id
FROM profiles WHERE role = 'admin' LIMIT 1
ON CONFLICT DO NOTHING;

-- Make sure your admin user exists and has the right role
UPDATE profiles 
SET 
  role = 'admin',
  full_name = 'SKYWIDE Administrator',
  is_active = true
WHERE email = 'admin@skywide.com';

-- If the profile doesn't exist yet, create it manually
INSERT INTO profiles (id, email, full_name, role, is_active)
SELECT 
  id,
  'admin@skywide.com',
  'SKYWIDE Administrator', 
  'admin',
  true
FROM auth.users 
WHERE email = 'admin@skywide.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  full_name = 'SKYWIDE Administrator',
  is_active = true;
