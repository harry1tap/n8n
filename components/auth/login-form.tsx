"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"
import { supabase } from "@/lib/supabase/client"
import Image from "next/image"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const { error } = await signIn(email, password)

    if (error) {
      setError(error.message)
      setIsLoading(false)
    } else {
      router.push("/dashboard")
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        setError(error.message)
      } else if (data.user) {
        // Sign up successful, redirect to dashboard
        router.push("/dashboard")
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-[#0F1B2E] border-[#1E3A5F]/30 shadow-2xl">
      <CardHeader className="text-center pb-8">
        <div className="mb-6">
          <Image src="/skywide-logo.svg" alt="SKYWIDE Logo" width={250} height={75} className="mx-auto" />
        </div>
        <CardTitle className="text-3xl text-white font-bold">
          {mode === "signin" ? "Welcome Back" : "Create Account"}
        </CardTitle>
        <CardDescription className="text-gray-300 text-lg">
          {mode === "signin" ? "Sign in to access your dashboard" : "Create your SKYWIDE account"}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp} className="space-y-6">
          {mode === "signup" && (
            <div className="space-y-3">
              <Label htmlFor="fullName" className="text-gray-200 font-medium">
                Full Name
              </Label>
              <Input
                id="fullName"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-[#1E3A5F]/20 border-[#1E3A5F] text-white placeholder:text-gray-500 h-12 rounded-lg focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
                required
              />
            </div>
          )}
          <div className="space-y-3">
            <Label htmlFor="email" className="text-gray-200 font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#1E3A5F]/20 border-[#1E3A5F] text-white placeholder:text-gray-500 h-12 rounded-lg focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
              required
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="password" className="text-gray-200 font-medium">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#1E3A5F]/20 border-[#1E3A5F] text-white placeholder:text-gray-500 h-12 rounded-lg focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all pr-12"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          {error && (
            <Alert className="bg-red-900/50 border-red-700/50 rounded-lg">
              <AlertDescription className="text-red-300 font-medium">{error}</AlertDescription>
            </Alert>
          )}
          <Button
            type="submit"
            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white h-12 rounded-lg font-semibold transition-all duration-200"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {mode === "signin" ? "Signing in..." : "Creating account..."}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {mode === "signin" ? <LogIn className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                {mode === "signin" ? "Sign In" : "Create Account"}
              </div>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-blue-300 hover:text-white hover:bg-white/10"
          >
            {mode === "signin" ? "Need to create an account?" : "Already have an account?"}
          </Button>
        </div>

        {mode === "signin" && (
          <div className="mt-6 text-center text-sm text-gray-300 bg-[#1E3A5F]/20 rounded-lg p-4">
            <strong>Need Access?</strong>
            <br />
            Contact your administrator to create your account
          </div>
        )}
      </CardContent>
    </Card>
  )
}
