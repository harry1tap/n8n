import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { AdminPanel } from "@/components/dashboard/admin-panel"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Panel - SKYWIDE",
  description: "Manage staff, projects, and system settings in SKYWIDE",
}

export default function AdminPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          <p className="text-blue-200 mt-2">Manage staff, projects, and system settings</p>
        </div>
        <AdminPanel />
      </div>
    </DashboardLayout>
  )
}
