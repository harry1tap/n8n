"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardSidebar } from "./dashboard-sidebar"
import { useAuth } from "@/lib/auth/auth-context"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1426] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0B1426]">
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <DashboardSidebar user={user} />
          <main className="flex-1 min-w-0 overflow-hidden">
            <div className="h-full overflow-auto">
              <div className="p-6 lg:p-8">
                <div className="mb-6 lg:hidden">
                  <SidebarTrigger className="text-white hover:bg-white/10 mb-4" />
                </div>
                <div className="w-full max-w-none">{children}</div>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  )
}
