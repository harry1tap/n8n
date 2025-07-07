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
import { Users, UserPlus, UserMinus, Shield, Mail, Calendar } from "lucide-react"
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
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteStatus, setInviteStatus] = useState<"idle" | "success" | "error">("idle")
  const [error, setError] = useState("")
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
    } finally {
      setLoading(false)
    }
  }

  const loadProfiles = async () => {
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

    if (error) throw error
    setProfiles(data || [])
  }

  const loadInvitations = async () => {
    try {
      const data = await InvitationService.getInvitations()
      setInvitations(data)
    } catch (error) {
      console.error("Error loading invitations:", error)
    }
  }

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      await InvitationService.createInvitation({
        email: newUserEmail,
        role: newUserRole,
        fullName: newUserName,
      })

      setNewUserEmail("")
      setNewUserName("")
      setNewUserRole("user")
      setShowInviteForm(false)
      setInviteStatus("success")
      await loadInvitations()

      setTimeout(() => setInviteStatus("idle"), 3000)
    } catch (error: any) {
      setError(error.message || "Failed to send invitation")
      setInviteStatus("error")
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
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  const activeUsers = profiles.filter((p) => p.is_active).length
  const pendingInvitations = invitations.filter((i) => i.status === "pending").length

  return (
    <div className="space-y-6">
      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Active Users</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{activeUsers}</div>
            <p className="text-xs text-blue-200">Total registered users</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Pending Invitations</CardTitle>
            <Mail className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{pendingInvitations}</div>
            <p className="text-xs text-blue-200">Awaiting acceptance</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">System Status</CardTitle>
            <Shield className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">Online</div>
            <p className="text-xs text-blue-200">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-white">User Management</CardTitle>
              <CardDescription className="text-blue-200">Manage team members and their access levels</CardDescription>
            </div>
            <Button
              onClick={() => setShowInviteForm(!showInviteForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite User
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invite Form */}
          {showInviteForm && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Invite New User</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleInviteUser} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="userName" className="text-white">
                        Full Name
                      </Label>
                      <Input
                        id="userName"
                        placeholder="Enter full name"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userEmail" className="text-white">
                        Email Address
                      </Label>
                      <Input
                        id="userEmail"
                        type="email"
                        placeholder="Enter email address"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userRole" className="text-white">
                      Role
                    </Label>
                    <Select value={newUserRole} onValueChange={(value: "admin" | "user") => setNewUserRole(value)}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-white/20">
                        <SelectItem value="user" className="text-white hover:bg-white/10">
                          User
                        </SelectItem>
                        <SelectItem value="admin" className="text-white hover:bg-white/10">
                          Admin
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Invitation
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowInviteForm(false)}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Status Alerts */}
          {inviteStatus === "success" && (
            <Alert className="bg-green-500/20 border-green-500/50">
              <AlertDescription className="text-green-200">
                Invitation sent successfully! The user will receive an email with setup instructions.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="bg-red-500/20 border-red-500/50">
              <AlertDescription className="text-red-200">{error}</AlertDescription>
            </Alert>
          )}

          {/* Active Users List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Active Users</h3>
            {profiles.map((profile) => (
              <Card key={profile.id} className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
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
                        <p className="text-blue-200 text-sm">{profile.email}</p>
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
                      <div className="text-right text-sm text-white/70">
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

          {/* Pending Invitations */}
          {invitations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Invitations</h3>
              {invitations.map((invitation) => (
                <Card key={invitation.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                          <Mail className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{invitation.email}</h3>
                          <p className="text-blue-200 text-sm">
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
                      <div className="text-right text-sm text-white/70">
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
