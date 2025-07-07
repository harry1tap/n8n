"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, User, FileText, Search, Filter } from "lucide-react"

interface Project {
  id: string
  title: string
  client: string
  type: "Blog" | "Website"
  status: "In Progress" | "Completed" | "Pending Review" | "Draft"
  assignedTo: string
  dueDate: string
  keywords: string[]
  description: string
}

const mockProjects: Project[] = [
  {
    id: "1",
    title: "E-commerce SEO Strategy Guide",
    client: "TechCorp Inc.",
    type: "Blog",
    status: "In Progress",
    assignedTo: "staff@seobrand.com",
    dueDate: "2024-01-15",
    keywords: ["e-commerce", "SEO", "strategy"],
    description: "Comprehensive guide on e-commerce SEO best practices",
  },
  {
    id: "2",
    title: "Homepage Content Optimization",
    client: "StartupXYZ",
    type: "Website",
    status: "Completed",
    assignedTo: "staff@seobrand.com",
    dueDate: "2024-01-10",
    keywords: ["homepage", "conversion", "optimization"],
    description: "Optimize homepage content for better conversions",
  },
  {
    id: "3",
    title: "Local SEO Best Practices",
    client: "Local Business Co.",
    type: "Blog",
    status: "Pending Review",
    assignedTo: "admin@seobrand.com",
    dueDate: "2024-01-20",
    keywords: ["local SEO", "Google My Business", "citations"],
    description: "Complete guide to local SEO optimization",
  },
  {
    id: "4",
    title: "Product Page Content",
    client: "Fashion Brand",
    type: "Website",
    status: "Draft",
    assignedTo: "staff@seobrand.com",
    dueDate: "2024-01-25",
    keywords: ["product pages", "fashion", "descriptions"],
    description: "Create compelling product page content",
  },
]

export function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [userRole, setUserRole] = useState<string>("")
  const [userEmail, setUserEmail] = useState<string>("")

  useEffect(() => {
    const role = localStorage.getItem("userRole") || ""
    const email = localStorage.getItem("userEmail") || ""
    setUserRole(role)
    setUserEmail(email)

    // Filter projects based on user role
    if (role === "admin") {
      setProjects(mockProjects) // Admins see all projects
    } else {
      // Users only see their assigned projects
      const userProjects = mockProjects.filter((project) => project.assignedTo === email)
      setProjects(userProjects)
    }
  }, [])

  useEffect(() => {
    let filtered = projects

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.keywords.some((keyword) => keyword.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((project) => project.status === statusFilter)
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((project) => project.type === typeFilter)
    }

    setFilteredProjects(filtered)
  }, [projects, searchTerm, statusFilter, typeFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-500/20 text-green-300 border-green-500/50"
      case "In Progress":
        return "bg-blue-500/20 text-blue-300 border-blue-500/50"
      case "Pending Review":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50"
      case "Draft":
        return "bg-gray-500/20 text-gray-300 border-gray-500/50"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/50"
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/20">
                <SelectItem value="all" className="text-white hover:bg-white/10">
                  All Status
                </SelectItem>
                <SelectItem value="In Progress" className="text-white hover:bg-white/10">
                  In Progress
                </SelectItem>
                <SelectItem value="Completed" className="text-white hover:bg-white/10">
                  Completed
                </SelectItem>
                <SelectItem value="Pending Review" className="text-white hover:bg-white/10">
                  Pending Review
                </SelectItem>
                <SelectItem value="Draft" className="text-white hover:bg-white/10">
                  Draft
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/20">
                <SelectItem value="all" className="text-white hover:bg-white/10">
                  All Types
                </SelectItem>
                <SelectItem value="Blog" className="text-white hover:bg-white/10">
                  Blog
                </SelectItem>
                <SelectItem value="Website" className="text-white hover:bg-white/10">
                  Website
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card
            key={project.id}
            className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-white text-lg">{project.title}</CardTitle>
                <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
              </div>
              <CardDescription className="text-blue-200">{project.client}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white/80 text-sm">{project.description}</p>

              <div className="flex items-center gap-2 text-sm text-white/70">
                <FileText className="h-4 w-4" />
                <span>{project.type}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-white/70">
                <User className="h-4 w-4" />
                <span>{project.assignedTo}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-white/70">
                <Calendar className="h-4 w-4" />
                <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
              </div>

              <div className="flex flex-wrap gap-1">
                {project.keywords.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="text-xs border-white/30 text-white/70">
                    {keyword}
                  </Badge>
                ))}
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">View Details</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-white/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Projects Found</h3>
            <p className="text-white/70">No projects match your current filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
