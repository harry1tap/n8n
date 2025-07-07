# SKYWIDE Edge Function Deployment Guide

## 🚀 Deploy the Edge Function

### Option 1: Using Supabase CLI (Recommended)

1. **Install Supabase CLI** (if not already installed):
   \`\`\`bash
   npm install -g supabase
   \`\`\`

2. **Login to Supabase**:
   \`\`\`bash
   supabase login
   \`\`\`

3. **Deploy the Edge Function**:
   \`\`\`bash
   supabase functions deploy create-user-with-credentials --project-ref vdjfjytmzhoyqikbzxut
   \`\`\`

4. **Set Environment Variables**:
   \`\`\`bash
   # Set your Resend API key
   supabase secrets set RESEND_API_KEY=re_your_actual_resend_key --project-ref vdjfjytmzhoyqikbzxut
   \`\`\`

### Option 2: Using Supabase Dashboard

1. **Go to Edge Functions** in your Supabase dashboard:
   👉 https://supabase.com/dashboard/project/vdjfjytmzhoyqikbzxut/functions

2. **Create New Function**:
   - Name: `create-user-with-credentials`
   - Copy the code from `supabase/functions/create-user-with-credentials/index.ts`

3. **Set Environment Variables**:
   - Go to Settings → Edge Functions → Environment Variables
   - Add: `RESEND_API_KEY` = your Resend API key

## 🧪 Test the Function

After deployment, test the user creation through your admin panel at:
👉 https://skywide.co/dashboard/admin

## ✅ What the Function Does

- ✅ Creates user in Supabase Auth with temporary password
- ✅ Creates profile in database with proper role
- ✅ Sends welcome email with login credentials
- ✅ Logs all actions for audit trail
- ✅ Handles errors gracefully with cleanup

## 🔧 Environment Variables Required

- `SUPABASE_URL` - Auto-provided by Supabase
- `SUPABASE_ANON_KEY` - Auto-provided by Supabase  
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-provided by Supabase
- `RESEND_API_KEY` - You need to set this manually

## 🎯 Expected Result

When you create a user through the admin panel:
1. User account created instantly
2. Welcome email sent automatically
3. User can login immediately with provided credentials
4. Admin sees success message with credentials for reference
