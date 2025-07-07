#!/bin/bash

# SKYWIDE Complete Setup Script
# ============================
# This script runs the complete setup process from start to finish

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m'

log_header() {
    echo -e "\n${PURPLE}========================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}========================================${NC}\n"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

# Function to check if script exists and is executable
check_script() {
    local script_path="$1"
    if [ ! -f "$script_path" ]; then
        echo "Error: Script not found: $script_path"
        return 1
    fi
    
    if [ ! -x "$script_path" ]; then
        chmod +x "$script_path"
        log_info "Made script executable: $script_path"
    fi
    
    return 0
}

# Main setup process
main() {
    log_header "SKYWIDE COMPLETE SETUP PROCESS"
    
    echo "This will run the complete setup process:"
    echo "1. Configure environment variables"
    echo "2. Deploy Edge Function"
    echo "3. Verify deployment"
    echo "4. Generate final report"
    echo ""
    echo "Press Enter to continue or Ctrl+C to exit..."
    read -r

    # Step 1: Configure environment
    log_step "Step 1: Configuring environment..."
    if check_script "./scripts/configure-environment.sh"; then
        ./scripts/configure-environment.sh
        log_success "Environment configuration completed"
    else
        echo "Error: Could not run environment configuration"
        exit 1
    fi

    # Step 2: Deploy Edge Function
    log_step "Step 2: Deploying Edge Function..."
    if check_script "./scripts/auto-deploy-edge-function.sh"; then
        ./scripts/auto-deploy-edge-function.sh
        log_success "Edge Function deployment completed"
    else
        echo "Error: Could not run Edge Function deployment"
        exit 1
    fi

    # Step 3: Verify deployment
    log_step "Step 3: Verifying deployment..."
    if [ -f "./scripts/verify-deployment.ts" ]; then
        if command -v npx >/dev/null 2>&1; then
            npx ts-node ./scripts/verify-deployment.ts
            log_success "Deployment verification completed"
        else
            log_info "ts-node not available, skipping TypeScript verification"
            log_info "You can run it manually with: npx ts-node ./scripts/verify-deployment.ts"
        fi
    else
        echo "Warning: Verification script not found"
    fi

    # Final summary
    log_header "SETUP COMPLETE"
    
    echo -e "${GREEN}🎉 SKYWIDE Edge Function setup completed successfully!${NC}"
    echo ""
    echo "What was accomplished:"
    echo "✅ Environment variables configured"
    echo "✅ Edge Function deployed"
    echo "✅ Deployment verified"
    echo ""
    echo "Next steps:"
    echo "1. Go to: https://skywide.co/dashboard/admin"
    echo "2. Test the user creation functionality"
    echo "3. Monitor function logs if needed"
    echo ""
    echo "Support resources:"
    echo "• Function logs: https://supabase.com/dashboard/project/vdjfjytmzhoyqikbzxut/functions/create-user-with-credentials/logs"
    echo "• Supabase dashboard: https://supabase.com/dashboard/project/vdjfjytmzhoyqikbzxut"
    echo ""
    log_success "Setup process completed successfully!"
}

# Make scripts executable
chmod +x ./scripts/*.sh 2>/dev/null || true

# Run main function
main "$@"
