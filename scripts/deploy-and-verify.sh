#!/bin/bash

echo "🚀 SKYWIDE Edge Function Complete Deployment & Verification"
echo "=========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
print_status "Checking prerequisites..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    print_warning "Supabase CLI not found. Installing..."
    npm install -g supabase
    if [ $? -ne 0 ]; then
        print_error "Failed to install Supabase CLI"
        exit 1
    fi
    print_success "Supabase CLI installed"
fi

# Check if logged in
print_status "Checking Supabase authentication..."
supabase projects list > /dev/null 2>&1
if [ $? -ne 0 ]; then
    print_warning "Not logged in to Supabase. Please login:"
    supabase login
    if [ $? -ne 0 ]; then
        print_error "Failed to login to Supabase"
        exit 1
    fi
fi
print_success "Authenticated with Supabase"

# Deploy the Edge Function
print_status "Deploying Edge Function..."
supabase functions deploy create-user-with-credentials --project-ref vdjfjytmzhoyqikbzxut

if [ $? -eq 0 ]; then
    print_success "Edge Function deployed successfully!"
else
    print_error "Edge Function deployment failed!"
    echo "Please check:"
    echo "1. Your internet connection"
    echo "2. Supabase project permissions"
    echo "3. Function code syntax"
    exit 1
fi

# Set environment variables
print_status "Configuring environment variables..."

# Set APP_URL
supabase secrets set APP_URL=https://skywide.co --project-ref vdjfjytmzhoyqikbzxut
if [ $? -eq 0 ]; then
    print_success "APP_URL configured"
else
    print_warning "Failed to set APP_URL"
fi

# Check and set RESEND_API_KEY
if [ -z "$RESEND_API_KEY" ]; then
    print_warning "RESEND_API_KEY environment variable not set"
    echo "Please set it manually:"
    echo "export RESEND_API_KEY=your_actual_key"
    echo "supabase secrets set RESEND_API_KEY=your_actual_key --project-ref vdjfjytmzhoyqikbzxut"
else
    supabase secrets set RESEND_API_KEY=$RESEND_API_KEY --project-ref vdjfjytmzhoyqikbzxut
    if [ $? -eq 0 ]; then
        print_success "RESEND_API_KEY configured"
    else
        print_warning "Failed to set RESEND_API_KEY"
    fi
fi

# Verify deployment
print_status "Verifying deployment..."
sleep 3  # Wait for deployment to propagate

# Test function accessibility
FUNCTION_URL="https://vdjfjytmzhoyqikbzxut.supabase.co/functions/v1/create-user-with-credentials"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$FUNCTION_URL" \
    -H "Content-Type: application/json" \
    -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkamZqeXRtemhveXFpa2J6eHV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4OTQ2MjMsImV4cCI6MjA2NzQ3MDYyM30.SZNQ2eGyXPAiPyjV3QM4YvMaDnPFdwa2WbiCfLeSdDE" \
    -d '{"test": true}')

if [ "$HTTP_STATUS" = "404" ]; then
    print_error "Function not accessible (404) - deployment may have failed"
    exit 1
elif [ "$HTTP_STATUS" = "401" ]; then
    print_success "Function is deployed and accessible (requires authentication)"
elif [ "$HTTP_STATUS" = "200" ]; then
    print_success "Function is deployed and responding correctly"
else
    print_warning "Function returned status: $HTTP_STATUS"
fi

# Final summary
echo ""
echo "🎉 Deployment Summary"
echo "===================="
print_success "✅ Edge Function: create-user-with-credentials"
print_success "✅ Project: vdjfjytmzhoyqikbzxut"
print_success "✅ Function Status: HTTP $HTTP_STATUS"

if [ -n "$RESEND_API_KEY" ]; then
    print_success "✅ RESEND_API_KEY: Configured"
else
    print_warning "⚠️  RESEND_API_KEY: Not configured"
fi

echo ""
echo "🧪 Next Steps:"
echo "1. Go to your admin panel: https://skywide.co/dashboard/admin"
echo "2. Click 'Test Edge Function' to verify connectivity"
echo "3. Try creating a test user"
echo ""
echo "📊 Monitor function logs at:"
echo "https://supabase.com/dashboard/project/vdjfjytmzhoyqikbzxut/functions/create-user-with-credentials/logs"
