# SKYWIDE Edge Function Deployment Guide

## 🚀 Automated Deployment

### Quick Start (Recommended)

Run the complete setup process:

\`\`\`bash
# Make scripts executable
chmod +x ./scripts/*.sh

# Run complete setup
./scripts/complete-setup.sh
\`\`\`

This will:
1. Configure environment variables
2. Deploy the Edge Function
3. Verify deployment
4. Generate a comprehensive report

### Step-by-Step Deployment

#### 1. Configure Environment Variables

\`\`\`bash
./scripts/configure-environment.sh
\`\`\`

This script will:
- Prompt for your Resend API key
- Set environment variables in Supabase
- Create a local `.env.local` file

#### 2. Deploy Edge Function

\`\`\`bash
./scripts/auto-deploy-edge-function.sh
\`\`\`

This script will:
- Install prerequisites (Supabase CLI)
- Authenticate with Supabase
- Deploy the Edge Function
- Configure environment variables
- Verify deployment

#### 3. Verify Deployment

\`\`\`bash
npm run verify:deployment
\`\`\`

This will run comprehensive tests to ensure everything is working.

## 🔧 Manual Deployment

If you prefer manual deployment:

### Prerequisites

\`\`\`bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login
\`\`\`

### Deploy Function

\`\`\`bash
# Deploy the function
supabase functions deploy create-user-with-credentials --project-ref vdjfjytmzhoyqikbzxut

# Set environment variables
supabase secrets set RESEND_API_KEY=your_key --project-ref vdjfjytmzhoyqikbzxut
supabase secrets set APP_URL=https://skywide.co --project-ref vdjfjytmzhoyqikbzxut
\`\`\`

## 🧪 Testing

### Quick Test

\`\`\`bash
npm run test:edge-function
\`\`\`

### Comprehensive Testing

\`\`\`bash
npm run verify:deployment
\`\`\`

### Manual Testing

1. Go to: https://skywide.co/dashboard/admin
2. Click "Test Edge Function" button
3. Try creating a test user

## 📊 Monitoring

### Function Logs

Monitor function execution:
https://supabase.com/dashboard/project/vdjfjytmzhoyqikbzxut/functions/create-user-with-credentials/logs

### Environment Variables

Check configured variables:
\`\`\`bash
supabase secrets list --project-ref vdjfjytmzhoyqikbzxut
\`\`\`

## 🔧 Troubleshooting

### Common Issues

1. **Function not found (404)**
   - Solution: Re-run deployment script
   - Check: Function exists in Supabase dashboard

2. **Authentication errors (401)**
   - Solution: Verify user has admin role
   - Check: Login status in admin panel

3. **Email not sending**
   - Solution: Verify RESEND_API_KEY is set
   - Check: Resend dashboard for API key status

4. **Network errors**
   - Solution: Check internet connection
   - Check: Supabase service status

### Debug Commands

\`\`\`bash
# Test function connectivity
curl -X POST https://vdjfjytmzhoyqikbzxut.supabase.co/functions/v1/create-user-with-credentials \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_ANON_KEY" \
  -d '{"test": true}'

# List all functions
supabase functions list --project-ref vdjfjytmzhoyqikbzxut

# Check secrets
supabase secrets list --project-ref vdjfjytmzhoyqikbzxut
\`\`\`

## 📋 Checklist

Before going live, ensure:

- [ ] Edge Function deployed successfully
- [ ] Environment variables configured
- [ ] Function responds to test requests
- [ ] Admin panel can create users
- [ ] Email delivery is working
- [ ] Function logs are accessible
- [ ] Error handling is working properly

## 🎯 Success Indicators

When everything is working correctly:

✅ Function returns 200/401 status (not 404)
✅ Admin panel shows "Function accessible!" 
✅ User creation succeeds with credentials
✅ Welcome emails are delivered
✅ New users appear in user list
✅ Function logs show successful executions

## 📞 Support

If you encounter issues:

1. Check the function logs in Supabase dashboard
2. Run the verification script for detailed diagnostics
3. Review the troubleshooting section above
4. Check Supabase service status
