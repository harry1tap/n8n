"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { FolderOpen, Home, LogOut, Settings, PenTool, User } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import Image from "next/image"

interface DashboardSidebarProps {
  user: SupabaseUser
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  // Determine user role from user metadata or email
  const userRole = user.user_metadata?.role || (user.email?.includes("admin") ? "admin" : "staff")

  const menuItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      roles: ["admin", "staff"],
    },
    {
      title: "Content Creation",
      url: "/dashboard/content",
      icon: PenTool,
      roles: ["admin", "staff"],
    },
    {
      title: "Projects",
      url: "/dashboard/projects",
      icon: FolderOpen,
      roles: ["admin", "staff"],
    },
    {
      title: "Admin Panel",
      url: "/dashboard/admin",
      icon: Settings,
      roles: ["admin"],
    },
  ]

  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(userRole))

  return (
    <Sidebar className="bg-[#0B1426] border-r border-[#1E3A5F]/30">
      <SidebarHeader className="p-6 border-b border-[#1E3A5F]/30 bg-[#0B1426]">
        <div className="text-center">
          <div className="mb-4">
            <Image src="/skywide-logo.svg" alt="SKYWIDE Logo" width={200} height={60} className="mx-auto" />
          </div>
          <p className="text-sm text-[#60A5FA] capitalize font-medium">{userRole} Dashboard</p>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4 bg-[#0B1426]">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-300 text-xs uppercase tracking-wider font-semibold mb-4 px-3">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="text-gray-300 hover:text-white hover:bg-[#1E3A5F]/50 data-[active=true]:bg-[#2563EB] data-[active=true]:text-white rounded-lg transition-all duration-200 py-3 font-medium"
                  >
                    <a href={item.url} className="flex items-center gap-3 px-3">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-[#1E3A5F]/30 bg-[#0B1426]">
        <div className="mb-4 p-3 bg-[#1E3A5F]/20 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#2563EB] rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.email}</p>
              <p className="text-xs text-gray-400 capitalize">{userRole}</p>
            </div>
          </div>
        </div>
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full text-gray-300 hover:text-white hover:bg-red-600/20 rounded-lg transition-all duration-200 py-3"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
