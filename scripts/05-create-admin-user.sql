-- Create the admin user account
-- Note: You'll need to run this AFTER creating the user in Supabase Auth

-- First, create the user in Supabase Auth dashboard with:
-- Email: admin@skywide.com
-- Password: [choose a secure password]

-- Then run this to make them an admin:
UPDATE profiles 
SET 
  role = 'admin',
  full_name = 'SKYWIDE Administrator',
  is_active = true
WHERE email = 'admin@skywide.com';

-- If the profile doesn't exist yet, you can create it manually:
-- (Only run this if the above UPDATE didn't work)
/*
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
*/
