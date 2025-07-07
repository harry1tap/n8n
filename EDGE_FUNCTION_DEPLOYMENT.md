# 🚀 Edge Function Deployment Guide

## Quick Deployment (Choose One Method)

### Method 1: Using Supabase Dashboard (Easiest)

1. **Go to Edge Functions in Supabase Dashboard:**
   👉 https://supabase.com/dashboard/project/vdjfjytmzhoyqikbzxut/functions

2. **Create New Function:**
   - Click "Create Function"
   - Name: `create-user-with-credentials`
   - Copy the code from `supabase/functions/create-user-with-credentials/index.ts`
   - Click "Deploy"

3. **Set Environment Variables:**
   - Go to Settings → Edge Functions → Environment Variables
   - Add: `RESEND_API_KEY` = `your_resend_api_key`
   - Add: `APP_URL` = `https://skywide.co`

### Method 2: Using Supabase CLI

1. **Install Supabase CLI:**
   \`\`\`bash
   npm install -g supabase
   \`\`\`

2. **Login:**
   \`\`\`bash
   supabase login
   \`\`\`

3. **Deploy Function:**
   \`\`\`bash
   supabase functions deploy create-user-with-credentials --project-ref vdjfjytmzhoyqikbzxut
   \`\`\`

4. **Set Environment Variables:**
   \`\`\`bash
   supabase secrets set RESEND_API_KEY=your_resend_key --project-ref vdjfjytmzhoyqikbzxut
   supabase secrets set APP_URL=https://skywide.co --project-ref vdjfjytmzhoyqikbzxut
   \`\`\`

## 🧪 Testing

After deployment:

1. **Go to Admin Panel:** https://skywide.co/dashboard/admin
2. **Click "Test Edge Function"** button in the debug section
3. **Try creating a user** - you should see detailed logs in the browser console

## 🔧 Troubleshooting

**If you see "Function not found" error:**
- The function isn't deployed yet - use one of the methods above

**If you see "Forbidden" error:**
- Make sure you're logged in as an admin user

**If you see "Network" error:**
- Check your internet connection
- Verify the function is deployed in the Supabase dashboard

## 📧 Get Your Resend API Key

1. Go to: https://resend.com/api-keys
2. Create a new API key
3. Copy it and use it in the environment variables

## ✅ Success Indicators

When everything works:
- ✅ "Test Edge Function" button shows "Function accessible!"
- ✅ Creating a user shows success message with credentials
- ✅ User receives welcome email with login details
- ✅ New user appears in the user list
