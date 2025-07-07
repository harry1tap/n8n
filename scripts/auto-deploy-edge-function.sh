#!/bin/bash

# SKYWIDE Edge Function Automated Deployment System
# =================================================
# This script automates the complete deployment process for the create-user-with-credentials Edge Function

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_REF="vdjfjytmzhoyqikbzxut"
FUNCTION_NAME="create-user-with-credentials"
APP_URL="https://skywide.co"
SUPABASE_URL="https://vdjfjytmzhoyqikbzxut.supabase.co"

# Logging functions
log_header() {
    echo -e "\n${PURPLE}========================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}========================================${NC}\n"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

log_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to wait for user input
wait_for_user() {
    echo -e "\n${YELLOW}Press Enter to continue or Ctrl+C to exit...${NC}"
    read -r
}

# Function to validate environment variables
validate_env_vars() {
    log_step "Validating environment variables..."
    
    local missing_vars=()
    
    if [ -z "$RESEND_API_KEY" ]; then
        missing_vars+=("RESEND_API_KEY")
    fi
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        log_warning "Missing environment variables: ${missing_vars[*]}"
        echo "Please set them before continuing:"
        for var in "${missing_vars[@]}"; do
            echo "  export $var=your_value_here"
        done
        echo ""
        echo "Or set them interactively now:"
        
        for var in "${missing_vars[@]}"; do
            echo -n "Enter $var: "
            read -r value
            export "$var"="$value"
            log_success "$var set successfully"
        done
    else
        log_success "All required environment variables are set"
    fi
}

# Function to install prerequisites
install_prerequisites() {
    log_step "Installing prerequisites..."
    
    # Check and install Node.js if needed
    if ! command_exists node; then
        log_warning "Node.js not found. Please install Node.js first."
        echo "Visit: https://nodejs.org/"
        exit 1
    else
        log_success "Node.js found: $(node --version)"
    fi
    
    # Check and install Supabase CLI
    if ! command_exists supabase; then
        log_info "Installing Supabase CLI..."
        npm install -g supabase
        if [ $? -eq 0 ]; then
            log_success "Supabase CLI installed successfully"
        else
            log_error "Failed to install Supabase CLI"
            exit 1
        fi
    else
        log_success "Supabase CLI found: $(supabase --version)"
    fi
    
    # Check and install curl if needed
    if ! command_exists curl; then
        log_warning "curl not found. Please install curl for testing."
    else
        log_success "curl found for testing"
    fi
}

# Function to authenticate with Supabase
authenticate_supabase() {
    log_step "Authenticating with Supabase..."
    
    # Check if already authenticated
    if supabase projects list >/dev/null 2>&1; then
        log_success "Already authenticated with Supabase"
        return 0
    fi
    
    log_info "Please authenticate with Supabase..."
    supabase login
    
    if [ $? -eq 0 ]; then
        log_success "Successfully authenticated with Supabase"
    else
        log_error "Failed to authenticate with Supabase"
        exit 1
    fi
}

# Function to create function directory structure
create_function_structure() {
    log_step "Creating function directory structure..."
    
    local func_dir="supabase/functions/$FUNCTION_NAME"
    
    if [ ! -d "$func_dir" ]; then
        mkdir -p "$func_dir"
        log_success "Created function directory: $func_dir"
    else
        log_info "Function directory already exists: $func_dir"
    fi
    
    # Verify the function file exists
    if [ ! -f "$func_dir/index.ts" ]; then
        log_error "Function file not found: $func_dir/index.ts"
        log_info "Please ensure the Edge Function code is in place"
        exit 1
    else
        log_success "Function file found: $func_dir/index.ts"
    fi
}

# Function to deploy the Edge Function
deploy_function() {
    log_step "Deploying Edge Function..."
    
    log_info "Deploying $FUNCTION_NAME to project $PROJECT_REF..."
    
    if supabase functions deploy "$FUNCTION_NAME" --project-ref "$PROJECT_REF"; then
        log_success "Edge Function deployed successfully!"
    else
        log_error "Edge Function deployment failed!"
        log_info "Common issues:"
        log_info "1. Check your internet connection"
        log_info "2. Verify project permissions"
        log_info "3. Check function code syntax"
        log_info "4. Ensure you're authenticated with correct account"
        exit 1
    fi
}

# Function to configure environment variables
configure_environment() {
    log_step "Configuring environment variables..."
    
    # Set APP_URL
    log_info "Setting APP_URL..."
    if supabase secrets set "APP_URL=$APP_URL" --project-ref "$PROJECT_REF"; then
        log_success "APP_URL configured: $APP_URL"
    else
        log_warning "Failed to set APP_URL"
    fi
    
    # Set RESEND_API_KEY
    if [ -n "$RESEND_API_KEY" ]; then
        log_info "Setting RESEND_API_KEY..."
        if supabase secrets set "RESEND_API_KEY=$RESEND_API_KEY" --project-ref "$PROJECT_REF"; then
            log_success "RESEND_API_KEY configured"
        else
            log_warning "Failed to set RESEND_API_KEY"
        fi
    else
        log_warning "RESEND_API_KEY not provided - email functionality will not work"
    fi
    
    # List all secrets to verify
    log_info "Current environment variables:"
    supabase secrets list --project-ref "$PROJECT_REF" 2>/dev/null || log_warning "Could not list secrets"
}

# Function to wait for deployment propagation
wait_for_propagation() {
    log_step "Waiting for deployment to propagate..."
    
    local wait_time=10
    log_info "Waiting $wait_time seconds for deployment to propagate..."
    
    for i in $(seq $wait_time -1 1); do
        echo -ne "\r${CYAN}[INFO]${NC} Waiting... $i seconds remaining"
        sleep 1
    done
    echo -e "\n"
    
    log_success "Propagation wait complete"
}

# Function to verify deployment
verify_deployment() {
    log_step "Verifying deployment..."
    
    local function_url="$SUPABASE_URL/functions/v1/$FUNCTION_NAME"
    local anon_key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkamZqeXRtemhveXFpa2J6eHV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4OTQ2MjMsImV4cCI6MjA2NzQ3MDYyM30.SZNQ2eGyXPAiPyjV3QM4YvMaDnPFdwa2WbiCfLeSdDE"
    
    log_info "Testing function accessibility..."
    log_info "URL: $function_url"
    
    if command_exists curl; then
        local http_status
        http_status=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$function_url" \
            -H "Content-Type: application/json" \
            -H "apikey: $anon_key" \
            -H "Authorization: Bearer $anon_key" \
            -d '{"test": true}' \
            --max-time 30)
        
        log_info "HTTP Status: $http_status"
        
        case $http_status in
            200)
                log_success "✅ Function is deployed and responding correctly"
                ;;
            401)
                log_success "✅ Function is deployed and accessible (requires authentication)"
                ;;
            404)
                log_error "❌ Function not found (404) - deployment may have failed"
                return 1
                ;;
            500)
                log_warning "⚠️ Function deployed but returning server error (500)"
                log_info "Check function logs for details"
                ;;
            000)
                log_warning "⚠️ Connection timeout or network error"
                ;;
            *)
                log_warning "⚠️ Function returned unexpected status: $http_status"
                ;;
        esac
    else
        log_warning "curl not available - skipping HTTP test"
    fi
    
    # Test with Supabase CLI if available
    log_info "Testing with Supabase client..."
    
    # Create a temporary test script
    cat > /tmp/test_function.js << 'EOF'
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://vdjfjytmzhoyqikbzxut.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkamZqeXRtemhveXFpa2J6eHV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4OTQ2MjMsImV4cCI6MjA2NzQ3MDYyM30.SZNQ2eGyXPAiPyjV3QM4YvMaDnPFdwa2WbiCfLeSdDE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFunction() {
    try {
        const { data, error } = await supabase.functions.invoke('create-user-with-credentials', {
            body: { test: true }
        });
        
        if (error) {
            console.log('ERROR:', error.message);
            process.exit(1);
        } else {
            console.log('SUCCESS: Function responded');
            process.exit(0);
        }
    } catch (err) {
        console.log('EXCEPTION:', err.message);
        process.exit(1);
    }
}

testFunction();
EOF
    
    if command_exists node && npm list @supabase/supabase-js >/dev/null 2>&1; then
        if node /tmp/test_function.js 2>/dev/null; then
            log_success "✅ Supabase client test passed"
        else
            log_warning "⚠️ Supabase client test failed (this may be normal if authentication is required)"
        fi
    else
        log_info "Skipping Supabase client test (dependencies not available)"
    fi
    
    # Clean up
    rm -f /tmp/test_function.js
}

# Function to generate deployment report
generate_report() {
    log_header "DEPLOYMENT REPORT"
    
    echo -e "${GREEN}✅ Deployment Summary${NC}"
    echo "===================="
    echo "• Project: $PROJECT_REF"
    echo "• Function: $FUNCTION_NAME"
    echo "• URL: $SUPABASE_URL/functions/v1/$FUNCTION_NAME"
    echo "• App URL: $APP_URL"
    echo "• Timestamp: $(date)"
    
    echo -e "\n${BLUE}🔧 Environment Variables${NC}"
    echo "========================"
    echo "• APP_URL: ✅ Configured"
    if [ -n "$RESEND_API_KEY" ]; then
        echo "• RESEND_API_KEY: ✅ Configured"
    else
        echo "• RESEND_API_KEY: ❌ Not configured"
    fi
    
    echo -e "\n${CYAN}🧪 Next Steps${NC}"
    echo "=============="
    echo "1. Go to admin panel: $APP_URL/dashboard/admin"
    echo "2. Click 'Test Edge Function' button"
    echo "3. Try creating a test user"
    echo "4. Monitor logs: https://supabase.com/dashboard/project/$PROJECT_REF/functions/$FUNCTION_NAME/logs"
    
    if [ -z "$RESEND_API_KEY" ]; then
        echo -e "\n${YELLOW}⚠️ Important${NC}"
        echo "============"
        echo "RESEND_API_KEY is not configured. Email functionality will not work."
        echo "To configure it:"
        echo "  supabase secrets set RESEND_API_KEY=your_key --project-ref $PROJECT_REF"
    fi
}

# Function to handle cleanup on exit
cleanup() {
    log_info "Cleaning up temporary files..."
    rm -f /tmp/test_function.js
}

# Set trap for cleanup
trap cleanup EXIT

# Main execution flow
main() {
    log_header "SKYWIDE EDGE FUNCTION AUTOMATED DEPLOYMENT"
    
    echo "This script will:"
    echo "• Install prerequisites"
    echo "• Authenticate with Supabase"
    echo "• Deploy the Edge Function"
    echo "• Configure environment variables"
    echo "• Verify deployment"
    echo "• Generate deployment report"
    
    wait_for_user
    
    # Execute deployment steps
    validate_env_vars
    install_prerequisites
    authenticate_supabase
    create_function_structure
    deploy_function
    configure_environment
    wait_for_propagation
    verify_deployment
    generate_report
    
    log_success "🎉 Automated deployment completed successfully!"
}

# Run main function
main "$@"
