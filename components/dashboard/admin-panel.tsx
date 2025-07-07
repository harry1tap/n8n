"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  UserPlus,
  UserMinus,
  Shield,
  Mail,
  Calendar,
  AlertCircle,
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react"
import { InvitationService, type InvitationData } from "@/lib/auth/invitation-service"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth/auth-context"

interface Profile {
  id: string
  email: string
  full_name: string | null
  role: "admin" | "user"
  is_active: boolean
  created_at: string
}

export function AdminPanel() {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [invitations, setInvitations] = useState<InvitationData[]>([])
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserName, setNewUserName] = useState("")
  const [newUserRole, setNewUserRole] = useState<"admin" | "user">("user")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createStatus, setCreateStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; temporary_password: string } | null>(
    null,
  )
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      await Promise.all([loadProfiles(), loadInvitations()])
    } catch (error) {
      console.error("Error loading data:", error)
      setError("Failed to load data. Please refresh the page.")
    } finally {
      setLoading(false)
    }
  }

  const loadProfiles = async () => {
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error loading profiles:", error)
      throw error
    }
    setProfiles(data || [])
  }

  const loadInvitations = async () => {
    try {
      const data = await InvitationService.getInvitations()
      setInvitations(data)
    } catch (error) {
      console.error("Error loading invitations:", error)
      // Don't throw here, invitations are not critical
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")
    setCreatedCredentials(null)
    setCreateStatus("loading")

    try {
      console.log("🚀 Starting user creation process...")
      console.log("📝 Form data:", { email: newUserEmail, fullName: newUserName, role: newUserRole })

      // Check if user is authenticated first
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      console.log("👤 Current user:", user?.email, "Error:", authError)

      if (!user) {
        throw new Error("You must be logged in to create users")
      }

      // Check if user has admin role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      console.log("🔐 User profile:", profile, "Error:", profileError)

      if (profile?.role !== "admin") {
        throw new Error("You must be an admin to create users")
      }

      console.log("📡 Calling Edge Function...")

      // Call the Edge Function with detailed logging
      const { data: result, error: functionError } = await supabase.functions.invoke("create-user-with-credentials", {
        body: {
          email: newUserEmail,
          fullName: newUserName,
          role: newUserRole,
        },
      })

      console.log("📨 Edge Function response:", { result, error: functionError })
      console.log("📨 Full response details:", JSON.stringify({ result, functionError }, null, 2))

      if (functionError) {
        console.error("❌ Edge function error:", functionError)

        // Provide more specific error messages
        if (functionError.message?.includes("FunctionsRelayError")) {
          throw new Error("Edge Function is not deployed or not accessible. Please check the deployment.")
        } else if (functionError.message?.includes("FunctionsFetchError")) {
          throw new Error("Failed to connect to Edge Function. Please check your network connection.")
        } else {
          throw new Error(`Edge Function error: ${functionError.message}`)
        }
      }

      if (!result) {
        throw new Error("No response received from Edge Function")
      }

      if (!result.success) {
        throw new Error(result.error || "Failed to create user")
      }

      console.log("✅ User created successfully:", result)

      // Reset form and show success
      setNewUserEmail("")
      setNewUserName("")
      setNewUserRole("user")
      setShowCreateForm(false)
      setCreateStatus("success")
      setSuccessMessage(result.message)
      setCreatedCredentials(result.credentials || null)
      await loadProfiles()

      // Auto-hide success message after 60 seconds
      setTimeout(() => {
        setCreateStatus("idle")
        setSuccessMessage("")
        setCreatedCredentials(null)
      }, 60000)
    } catch (error: any) {
      console.error("💥 Error creating user:", error)
      setError(error.message || "Failed to create user")
      setCreateStatus("error")

      // Provide helpful error messages based on the error type
      if (error.message.includes("not deployed")) {
        setError("❌ Edge Function not deployed. Please run the deployment script first.")
      } else if (error.message.includes("admin")) {
        setError("❌ You don't have admin permissions to create users.")
      } else if (error.message.includes("already exists")) {
        setError("❌ A user with this email already exists.")
      } else if (error.message.includes("network") || error.message.includes("fetch")) {
        setError("❌ Network error. Please check your internet connection and try again.")
      }
    }
  }

  const handleDeactivateUser = async (userId: string) => {
    if (!confirm("Are you sure you want to deactivate this user?")) return

    try {
      await InvitationService.deactivateUser(userId)
      await loadProfiles()
    } catch (error: any) {
      setError(error.message || "Failed to deactivate user")
    }
  }

  const copyCredentials = async () => {
    if (createdCredentials) {
      const credentialsText = `Email: ${createdCredentials.email}\nTemporary Password: ${createdCredentials.temporary_password}`
      await navigator.clipboard.writeText(credentialsText)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50"
      case "accepted":
        return "bg-green-500/20 text-green-300 border-green-500/50"
      case "expired":
        return "bg-red-500/20 text-red-300 border-red-500/50"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/50"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white">Loading admin panel...</div>
      </div>
    )
  }

  const activeUsers = profiles.filter((p) => p.is_active).length
  const pendingInvitations = invitations.filter((i) => i.status === "pending").length

  return (
    <div className="space-y-6">
      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#0F1B2E] border-[#1E3A5F]/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active Users</CardTitle>
            <Users className="h-4 w-4 text-[#60A5FA]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{activeUsers}</div>
            <p className="text-xs text-gray-300">Total registered users</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1B2E] border-[#1E3A5F]/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Pending Invitations</CardTitle>
            <Mail className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{pendingInvitations}</div>
            <p className="text-xs text-gray-300">Awaiting acceptance</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1B2E] border-[#1E3A5F]/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">System Status</CardTitle>
            <Shield className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">Online</div>
            <p className="text-xs text-gray-300">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Debug Information */}
      <Card className="bg-[#0F1B2E] border-[#1E3A5F]/30">
        <CardHeader>
          <CardTitle className="text-white text-sm">🔧 Debug Information</CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <div className="text-gray-300">
            <p>
              <strong>Current User:</strong> {user?.email}
            </p>
            <p>
              <strong>User ID:</strong> {user?.id}
            </p>
            <p>
              <strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing"}
            </p>
            <p>
              <strong>Supabase Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing"}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              try {
                console.log("🧪 Testing Edge Function connection...")
                const { data, error } = await supabase.functions.invoke("create-user-with-credentials", {
                  body: { test: true },
                })
                console.log("🧪 Test result:", { data, error })
                alert(`Test result: ${error ? `Error: ${error.message}` : "Function accessible!"}`)
              } catch (e: any) {
                console.error("🧪 Test failed:", e)
                alert(`Test failed: ${e.message}`)
              }
            }}
            className="border-[#1E3A5F] text-gray-300 hover:bg-[#1E3A5F]/20"
          >
            Test Edge Function
          </Button>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card className="bg-[#0F1B2E] border-[#1E3A5F]/30">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-white">User Management</CardTitle>
              <CardDescription className="text-gray-300">
                Create user accounts with automatic email delivery
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Create User
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Create User Form */}
          {showCreateForm && (
            <Card className="bg-[#1E3A5F]/20 border-[#1E3A5F]/30">
              <CardHeader>
                <CardTitle className="text-white text-lg">Create New User</CardTitle>
                <CardDescription className="text-gray-300">
                  User will receive an email with their login credentials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="userName" className="text-gray-200">
                        Full Name
                      </Label>
                      <Input
                        id="userName"
                        placeholder="Enter full name"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        className="bg-[#1E3A5F]/20 border-[#1E3A5F] text-white placeholder:text-gray-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userEmail" className="text-gray-200">
                        Email Address
                      </Label>
                      <Input
                        id="userEmail"
                        type="email"
                        placeholder="Enter email address"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        className="bg-[#1E3A5F]/20 border-[#1E3A5F] text-white placeholder:text-gray-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userRole" className="text-gray-200">
                      Role
                    </Label>
                    <Select value={newUserRole} onValueChange={(value: "admin" | "user") => setNewUserRole(value)}>
                      <SelectTrigger className="bg-[#1E3A5F]/20 border-[#1E3A5F] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0F1B2E] border-[#1E3A5F]">
                        <SelectItem value="user" className="text-white hover:bg-[#1E3A5F]/50">
                          User
                        </SelectItem>
                        <SelectItem value="admin" className="text-white hover:bg-[#1E3A5F]/50">
                          Admin
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={createStatus === "loading"}
                    >
                      {createStatus === "loading" ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating User...
                        </div>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Create User & Send Email
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                      className="border-[#1E3A5F] text-gray-300 hover:bg-[#1E3A5F]/20"
                      disabled={createStatus === "loading"}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Status Alerts */}
          {createStatus === "success" && successMessage && (
            <Alert className="bg-green-900/50 border-green-700/50">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-300">
                <div className="space-y-3">
                  <p>{successMessage}</p>
                  {createdCredentials && (
                    <div className="bg-green-800/30 rounded-lg p-4 space-y-2">
                      <p className="font-semibold">User Credentials (for your reference):</p>
                      <div className="space-y-1 text-sm">
                        <p>
                          <strong>Email:</strong> {createdCredentials.email}
                        </p>
                        <div className="flex items-center gap-2">
                          <strong>Temporary Password:</strong>
                          <code className="bg-green-700/30 px-2 py-1 rounded text-green-200">
                            {showPassword ? createdCredentials.temporary_password : "••••••••••••"}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-green-300 hover:text-green-100 h-6 w-6 p-0"
                          >
                            {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={copyCredentials}
                            className="text-green-300 hover:text-green-100 h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-green-200 mt-2">
                        ✅ Welcome email sent to user with login instructions
                      </p>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {(error || createStatus === "error") && (
            <Alert className="bg-red-900/50 border-red-700/50">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">{error}</AlertDescription>
            </Alert>
          )}

          {/* Active Users List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Active Users</h3>
            {profiles.map((profile) => (
              <Card key={profile.id} className="bg-[#1E3A5F]/20 border-[#1E3A5F]/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#2563EB] rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {(profile.full_name || profile.email)
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{profile.full_name || "No name"}</h3>
                        <p className="text-gray-300 text-sm">{profile.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            className={
                              profile.role === "admin"
                                ? "bg-purple-500/20 text-purple-300"
                                : "bg-blue-500/20 text-blue-300"
                            }
                          >
                            {profile.role}
                          </Badge>
                          <Badge
                            className={
                              profile.is_active ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"
                            }
                          >
                            {profile.is_active ? "active" : "inactive"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right text-sm text-gray-300">
                        <p>Joined: {new Date(profile.created_at).toLocaleDateString()}</p>
                      </div>
                      {profile.id !== user?.id && profile.is_active && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeactivateUser(profile.id)}
                          className="border-red-500/50 text-red-300 hover:bg-red-500/20"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pending Invitations (if any exist from old system) */}
          {invitations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Legacy Invitations</h3>
              {invitations.map((invitation) => (
                <Card key={invitation.id} className="bg-[#1E3A5F]/20 border-[#1E3A5F]/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                          <Mail className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{invitation.email}</h3>
                          <p className="text-gray-300 text-sm">
                            Invited by {invitation.invited_by.full_name || invitation.invited_by.email}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              className={
                                invitation.role === "admin"
                                  ? "bg-purple-500/20 text-purple-300"
                                  : "bg-blue-500/20 text-blue-300"
                              }
                            >
                              {invitation.role}
                            </Badge>
                            <Badge className={getStatusColor(invitation.status)}>{invitation.status}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-300">
                        <p className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Expires: {new Date(invitation.expires_at).toLocaleDateString()}
                        </p>
                        <p>Sent: {new Date(invitation.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
