import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vdjfjytmzhoyqikbzxut.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkamZqeXRtemhveXFpa2J6eHV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4OTQ2MjMsImV4cCI6MjA2NzQ3MDYyM30.SZNQ2eGyXPAiPyjV3QM4YvMaDnPFdwa2WbiCfLeSdDE"

async function verifyEdgeFunction() {
  console.log("🔍 Verifying Edge Function Deployment...")
  console.log("=====================================")

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // Test 1: Direct HTTP request
  console.log("📡 Test 1: Direct HTTP Request")
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/create-user-with-credentials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ test: true }),
    })

    console.log(`   Status: ${response.status} ${response.statusText}`)

    if (response.status === 404) {
      console.log("   ❌ Function not found - needs deployment")
    } else if (response.status === 401) {
      console.log("   🔐 Function exists but requires authentication")
    } else {
      console.log("   ✅ Function is accessible")
    }

    const responseText = await response.text()
    console.log(`   Response: ${responseText.substring(0, 200)}...`)
  } catch (error: any) {
    console.log(`   ❌ Request failed: ${error.message}`)
  }

  // Test 2: Supabase client invoke
  console.log("\n📡 Test 2: Supabase Client Invoke")
  try {
    const { data, error } = await supabase.functions.invoke("create-user-with-credentials", {
      body: { test: true },
    })

    if (error) {
      console.log(`   ❌ Invoke error: ${error.message}`)
      console.log(`   Error details:`, error)
    } else {
      console.log("   ✅ Function invoked successfully")
      console.log(`   Response:`, data)
    }
  } catch (error: any) {
    console.log(`   ❌ Invoke failed: ${error.message}`)
  }

  // Test 3: List all functions
  console.log("\n📋 Test 3: Available Functions")
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    })

    if (response.ok) {
      const functions = await response.json()
      console.log("   Available functions:", functions)
    } else {
      console.log(`   ❌ Could not list functions: ${response.status}`)
    }
  } catch (error: any) {
    console.log(`   ❌ Failed to list functions: ${error.message}`)
  }

  console.log("\n🎯 Recommendations:")
  console.log("===================")
  console.log("1. If function returns 404: Deploy the Edge Function")
  console.log("2. If function returns 401: Check authentication in your app")
  console.log("3. If function returns 500: Check function logs in Supabase dashboard")
  console.log("4. Verify environment variables are set in the function")
}

verifyEdgeFunction().catch(console.error)
