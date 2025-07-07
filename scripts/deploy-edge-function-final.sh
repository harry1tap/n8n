#!/bin/bash

echo "🚀 SKYWIDE Edge Function Deployment Script"
echo "=========================================="

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Login to Supabase (if not already logged in)
echo "🔐 Checking Supabase authentication..."
supabase projects list > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Please login to Supabase:"
    supabase login
fi

# Deploy the Edge Function
echo "📦 Deploying create-user-with-credentials function..."
supabase functions deploy create-user-with-credentials --project-ref vdjfjytmzhoyqikbzxut

if [ $? -eq 0 ]; then
    echo "✅ Edge Function deployed successfully!"
else
    echo "❌ Edge Function deployment failed!"
    exit 1
fi

# Set environment variables
echo "🔧 Setting environment variables..."

# Check if RESEND_API_KEY is set
if [ -z "$RESEND_API_KEY" ]; then
    echo "⚠️  RESEND_API_KEY environment variable not set."
    echo "Please set it with: export RESEND_API_KEY=your_actual_key"
    echo "Or run: supabase secrets set RESEND_API_KEY=your_actual_key --project-ref vdjfjytmzhoyqikbzxut"
else
    supabase secrets set RESEND_API_KEY=$RESEND_API_KEY --project-ref vdjfjytmzhoyqikbzxut
    echo "✅ RESEND_API_KEY set successfully!"
fi

# Set APP_URL
supabase secrets set APP_URL=https://skywide.co --project-ref vdjfjytmzhoyqikbzxut
echo "✅ APP_URL set successfully!"

echo ""
echo "🎉 Deployment Complete!"
echo "========================================"
echo "✅ Edge Function: create-user-with-credentials"
echo "✅ Project: vdjfjytmzhoyqikbzxut"
echo "✅ Environment variables configured"
echo ""
echo "🧪 Test the function by:"
echo "1. Go to your admin panel"
echo "2. Click 'Test Edge Function' button"
echo "3. Try creating a user"
echo ""
echo "📝 If you need to set RESEND_API_KEY manually:"
echo "supabase secrets set RESEND_API_KEY=your_key --project-ref vdjfjytmzhoyqikbzxut"
