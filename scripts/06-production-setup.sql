-- Run this in your production Supabase SQL editor

-- First, run all the setup scripts in order:
-- 1. scripts/01-setup-auth-tables.sql
-- 2. scripts/02-setup-rls-policies.sql  
-- 3. scripts/03-setup-functions.sql
-- 4. scripts/04-seed-sample-data.sql

-- Then create your admin user:
-- First create the user in Supabase Auth dashboard with email: admin@skywide.com

-- Then run this to make them admin:
UPDATE profiles 
SET 
  role = 'admin',
  full_name = 'SKYWIDE Administrator',
  is_active = true
WHERE email = 'admin@skywide.com';

-- If profile doesn't exist, create it:
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
