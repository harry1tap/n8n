"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, UserPlus, UserMinus, BarChart3, Shield, Mail } from "lucide-react"

interface StaffMember {
  id: string
  name: string
  email: string
  role: "admin" | "staff"
  status: "active" | "inactive"
  projectsAssigned: number
  lastActive: string
}

const mockStaff: StaffMember[] = [
  {
    id: "1",
    name: "John Admin",
    email: "admin@seobrand.com",
    role: "admin",
    status: "active",
    projectsAssigned: 15,
    lastActive: "2024-01-08",
  },
  {
    id: "2",
    name: "Sarah Writer",
    email: "sarah@seobrand.com",
    role: "staff",
    status: "active",
    projectsAssigned: 8,
    lastActive: "2024-01-08",
  },
  {
    id: "3",
    name: "Mike Content",
    email: "mike@seobrand.com",
    role: "staff",
    status: "active",
    projectsAssigned: 12,
    lastActive: "2024-01-07",
  },
]

export function AdminPanel() {
  const [staff, setStaff] = useState<StaffMember[]>(mockStaff)
  const [newStaffEmail, setNewStaffEmail] = useState("")
  const [newStaffName, setNewStaffName] = useState("")
  const [newStaffRole, setNewStaffRole] = useState<"admin" | "staff">("staff")
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteStatus, setInviteStatus] = useState<"idle" | "success" | "error">("idle")

  const handleInviteStaff = (e: React.FormEvent) => {
    e.preventDefault()

    const newStaff: StaffMember = {
      id: Date.now().toString(),
      name: newStaffName,
      email: newStaffEmail,
      role: newStaffRole,
      status: "active",
      projectsAssigned: 0,
      lastActive: new Date().toISOString().split("T")[0],
    }

    setStaff((prev) => [...prev, newStaff])
    setNewStaffEmail("")
    setNewStaffName("")
    setNewStaffRole("staff")
    setShowInviteForm(false)
    setInviteStatus("success")

    setTimeout(() => setInviteStatus("idle"), 3000)
  }

  const handleRemoveStaff = (staffId: string) => {
    setStaff((prev) => prev.filter((member) => member.id !== staffId))
  }

  const toggleStaffStatus = (staffId: string) => {
    setStaff((prev) =>
      prev.map((member) =>
        member.id === staffId ? { ...member, status: member.status === "active" ? "inactive" : "active" } : member,
      ),
    )
  }

  const totalProjects = staff.reduce((sum, member) => sum + member.projectsAssigned, 0)
  const activeStaff = staff.filter((member) => member.status === "active").length

  return (
    <div className="space-y-6">
      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{staff.length}</div>
            <p className="text-xs text-blue-200">{activeStaff} active members</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Projects</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalProjects}</div>
            <p className="text-xs text-blue-200">Across all staff</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">System Status</CardTitle>
            <Shield className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">Online</div>
            <p className="text-xs text-blue-200">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Staff Management */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-white">Staff Management</CardTitle>
              <CardDescription className="text-blue-200">Manage team members and their access levels</CardDescription>
            </div>
            <Button
              onClick={() => setShowInviteForm(!showInviteForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Staff
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invite Form */}
          {showInviteForm && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Invite New Staff Member</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleInviteStaff} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="staffName" className="text-white">
                        Full Name
                      </Label>
                      <Input
                        id="staffName"
                        placeholder="Enter full name"
                        value={newStaffName}
                        onChange={(e) => setNewStaffName(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="staffEmail" className="text-white">
                        Email Address
                      </Label>
                      <Input
                        id="staffEmail"
                        type="email"
                        placeholder="Enter email address"
                        value={newStaffEmail}
                        onChange={(e) => setNewStaffEmail(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="staffRole" className="text-white">
                      Role
                    </Label>
                    <Select value={newStaffRole} onValueChange={(value: "admin" | "staff") => setNewStaffRole(value)}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-white/20">
                        <SelectItem value="staff" className="text-white hover:bg-white/10">
                          Staff
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

          {/* Success Alert */}
          {inviteStatus === "success" && (
            <Alert className="bg-green-500/20 border-green-500/50">
              <AlertDescription className="text-green-200">
                Staff member invited successfully! They will receive an email with login instructions.
              </AlertDescription>
            </Alert>
          )}

          {/* Staff List */}
          <div className="space-y-4">
            {staff.map((member) => (
              <Card key={member.id} className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{member.name}</h3>
                        <p className="text-blue-200 text-sm">{member.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            className={
                              member.role === "admin"
                                ? "bg-purple-500/20 text-purple-300"
                                : "bg-blue-500/20 text-blue-300"
                            }
                          >
                            {member.role}
                          </Badge>
                          <Badge
                            className={
                              member.status === "active"
                                ? "bg-green-500/20 text-green-300"
                                : "bg-red-500/20 text-red-300"
                            }
                          >
                            {member.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right text-sm text-white/70">
                        <p>{member.projectsAssigned} projects</p>
                        <p>Last active: {new Date(member.lastActive).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleStaffStatus(member.id)}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          {member.status === "active" ? "Deactivate" : "Activate"}
                        </Button>
                        {member.role !== "admin" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveStaff(member.id)}
                            className="border-red-500/50 text-red-300 hover:bg-red-500/20"
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
