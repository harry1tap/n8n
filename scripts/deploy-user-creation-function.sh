#!/bin/bash

echo "🚀 Deploying SKYWIDE user creation Edge Function..."

# Deploy the Edge Function
supabase functions deploy create-user-with-credentials --project-ref vdjfjytmzhoyqikbzxut

# Set the required environment variables
echo "🔧 Setting environment variables..."
supabase secrets set RESEND_API_KEY=$RESEND_API_KEY --project-ref vdjfjytmzhoyqikbzxut

echo "✅ Edge Function deployed successfully!"
echo ""
echo "🎉 Your user creation system is now ready!"
echo "   - Users will be created automatically in Supabase Auth"
echo "   - Welcome emails with credentials will be sent via Resend"
echo "   - No manual link sharing required!"
