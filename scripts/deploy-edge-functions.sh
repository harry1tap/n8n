#!/bin/bash

# Deploy the send-invitation edge function
supabase functions deploy send-invitation --project-ref YOUR_PROJECT_REF

# Set the required environment variables for the edge function
supabase secrets set RESEND_API_KEY=your_resend_api_key_here --project-ref YOUR_PROJECT_REF
supabase secrets set APP_URL=https://skywide.co --project-ref YOUR_PROJECT_REF

echo "Edge function deployed successfully!"
echo "Make sure to replace YOUR_PROJECT_REF with your actual Supabase project reference"
echo "And replace your_resend_api_key_here with your actual Resend API key"
