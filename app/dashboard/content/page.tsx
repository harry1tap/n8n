import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ContentForm } from "@/components/dashboard/content-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Content Creation - SKYWIDE",
  description: "Create and submit content requests through SKYWIDE AI",
}

export default function ContentPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Content Creation</h1>
          <p className="text-blue-200 mt-2">Submit new content requests to the content engine</p>
        </div>
        <ContentForm />
      </div>
    </DashboardLayout>
  )
}
