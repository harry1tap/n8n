import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard - SKYWIDE",
  description: "SKYWIDE dashboard overview with analytics and metrics",
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardOverview />
    </DashboardLayout>
  )
}
