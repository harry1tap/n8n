import { LoginForm } from "@/components/auth/login-form"
import Image from "next/image"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "SKYWIDE - Login",
  description: "Sign in to your SKYWIDE dashboard",
}

export default function HomePage() {
  // In a real app, check if user is authenticated and redirect to dashboard
  return (
    <div className="min-h-screen bg-[#0B1426]">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Image src="/skywide-logo.svg" alt="SKYWIDE Logo" width={300} height={90} className="mx-auto mb-4" />
            <p className="text-gray-300">Internal Staff Dashboard</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
