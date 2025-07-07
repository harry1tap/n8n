// Deploy the Edge Function using Supabase CLI
const { execSync } = require("child_process")

try {
  console.log("🚀 Deploying Edge Function...")

  // Deploy the function
  execSync("supabase functions deploy create-user-with-credentials --project-ref vdjfjytmzhoyqikbzxut", {
    stdio: "inherit",
  })

  console.log("✅ Edge Function deployed successfully!")

  // Set environment variables
  console.log("🔧 Setting environment variables...")

  if (process.env.RESEND_API_KEY) {
    execSync(`supabase secrets set RESEND_API_KEY=${process.env.RESEND_API_KEY} --project-ref vdjfjytmzhoyqikbzxut`, {
      stdio: "inherit",
    })
    console.log("✅ RESEND_API_KEY set successfully!")
  } else {
    console.log("⚠️  RESEND_API_KEY not found in environment variables")
  }

  console.log("🎉 Deployment complete!")
} catch (error) {
  console.error("❌ Deployment failed:", error.message)
}
