-- This script should be run after creating your first admin user through Supabase Auth
-- Replace 'admin@skywide.com' with your actual admin email

-- Update the first user to be an admin (replace with your admin email)
UPDATE profiles 
SET role = 'admin', full_name = 'SKYWIDE Admin'
WHERE email = 'admin@skywide.com';

-- If the profile doesn't exist yet, you can create it manually:
-- INSERT INTO profiles (id, email, full_name, role)
-- VALUES (
--   (SELECT id FROM auth.users WHERE email = 'admin@skywide.com' LIMIT 1),
--   'admin@skywide.com',
--   'SKYWIDE Admin',
--   'admin'
-- );
