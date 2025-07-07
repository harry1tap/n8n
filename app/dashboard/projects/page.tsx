import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ProjectsList } from "@/components/dashboard/projects-list"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Projects - SKYWIDE",
  description: "Manage and track your assigned projects in SKYWIDE",
}

export default function ProjectsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-blue-200 mt-2">Manage and track your assigned projects</p>
        </div>
        <ProjectsList />
      </div>
    </DashboardLayout>
  )
}
