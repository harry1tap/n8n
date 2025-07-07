"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, UserPlus } from "lucide-react"
import { InvitationService } from "@/lib/auth/invitation-service"

interface InviteAcceptFormProps {
  token: string
  email: string
  role: string
}

export function InviteAcceptForm({ token, email, role }: InviteAcceptFormProps) {
  const [fullName, setFullName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      await InvitationService.acceptInvitation(token, password)
      router.push("/dashboard")
    } catch (error: any) {
      setError(error.message || "Failed to accept invitation")
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-[#0F1B2E] border-[#1E3A5F]/30 shadow-2xl">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl text-white font-bold">Create Your Account</CardTitle>
        <CardDescription className="text-gray-300">Complete your registration for {email}</CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="email" className="text-gray-200 font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="bg-[#1E3A5F]/10 border-[#1E3A5F] text-gray-400 h-12 rounded-lg"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="role" className="text-gray-200 font-medium">
              Role
            </Label>
            <Input
              id="role"
              value={role.charAt(0).toUpperCase() + role.slice(1)}
              disabled
              className="bg-[#1E3A5F]/10 border-[#1E3A5F] text-gray-400 h-12 rounded-lg"
            />
          </div>

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

          <div className="space-y-3">
            <Label htmlFor="password" className="text-gray-200 font-medium">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
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

          <div className="space-y-3">
            <Label htmlFor="confirmPassword" className="text-gray-200 font-medium">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-[#1E3A5F]/20 border-[#1E3A5F] text-white placeholder:text-gray-500 h-12 rounded-lg focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
              required
            />
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
                Creating Account...
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <UserPlus className="h-5 w-5" />
                Create Account
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
