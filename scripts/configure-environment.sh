#!/bin/bash

# Environment Configuration Script for SKYWIDE Edge Function
# =========================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_REF="vdjfjytmzhoyqikbzxut"

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to get Resend API key
get_resend_key() {
    echo -e "\n${BLUE}🔑 Resend API Key Configuration${NC}"
    echo "================================"
    echo "To send emails, you need a Resend API key."
    echo "1. Go to: https://resend.com/api-keys"
    echo "2. Create a new API key"
    echo "3. Copy the key and paste it below"
    echo ""
    
    if [ -n "$RESEND_API_KEY" ]; then
        echo "Current RESEND_API_KEY is set."
        echo -n "Do you want to use the existing key? (y/n): "
        read -r use_existing
        if [[ $use_existing =~ ^[Yy]$ ]]; then
            return 0
        fi
    fi
    
    echo -n "Enter your Resend API key: "
    read -r resend_key
    
    if [ -z "$resend_key" ]; then
        log_warning "No API key provided. Email functionality will be disabled."
        return 1
    fi
    
    export RESEND_API_KEY="$resend_key"
    log_success "Resend API key configured"
    return 0
}

# Function to set environment variables in Supabase
set_supabase_secrets() {
    log_info "Setting environment variables in Supabase..."
    
    # Set APP_URL
    if supabase secrets set "APP_URL=https://skywide.co" --project-ref "$PROJECT_REF"; then
        log_success "APP_URL configured"
    else
        log_error "Failed to set APP_URL"
        return 1
    fi
    
    # Set RESEND_API_KEY if available
    if [ -n "$RESEND_API_KEY" ]; then
        if supabase secrets set "RESEND_API_KEY=$RESEND_API_KEY" --project-ref "$PROJECT_REF"; then
            log_success "RESEND_API_KEY configured"
        else
            log_error "Failed to set RESEND_API_KEY"
            return 1
        fi
    fi
    
    return 0
}

# Function to verify environment variables
verify_environment() {
    log_info "Verifying environment variables..."
    
    echo "Current secrets in Supabase:"
    supabase secrets list --project-ref "$PROJECT_REF" || {
        log_warning "Could not list secrets. This might be normal."
    }
    
    log_success "Environment verification complete"
}

# Function to create local environment file
create_local_env() {
    log_info "Creating local environment file..."
    
    cat > .env.local << EOF
# SKYWIDE Environment Variables
# Generated on $(date)

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://vdjfjytmzhoyqikbzxut.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkamZqeXRtemhveXFpa2J6eHV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4OTQ2MjMsImV4cCI6MjA2NzQ3MDYyM30.SZNQ2eGyXPAiPyjV3QM4YvMaDnPFdwa2WbiCfLeSdDE

# App Configuration
NEXT_PUBLIC_APP_URL=https://skywide.co

# Email Configuration (for local development)
EOF

    if [ -n "$RESEND_API_KEY" ]; then
        echo "RESEND_API_KEY=$RESEND_API_KEY" >> .env.local
    else
        echo "# RESEND_API_KEY=your_resend_api_key_here" >> .env.local
    fi
    
    log_success "Local environment file created: .env.local"
}

# Main function
main() {
    echo -e "${BLUE}🔧 SKYWIDE Environment Configuration${NC}"
    echo "===================================="
    echo ""
    
    # Get Resend API key
    get_resend_key
    
    # Set environment variables in Supabase
    set_supabase_secrets
    
    # Verify environment
    verify_environment
    
    # Create local environment file
    create_local_env
    
    echo -e "\n${GREEN}✅ Environment configuration complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run the deployment script: ./scripts/auto-deploy-edge-function.sh"
    echo "2. Test the function in your admin panel"
}

# Check if Supabase CLI is available
if ! command -v supabase >/dev/null 2>&1; then
    log_error "Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if authenticated
if ! supabase projects list >/dev/null 2>&1; then
    log_error "Not authenticated with Supabase. Please run:"
    echo "supabase login"
    exit 1
fi

main "$@"
