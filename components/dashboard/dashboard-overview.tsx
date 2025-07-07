"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { FileText, TrendingUp, Users, Target } from "lucide-react"

const monthlyData = [
  { month: "Jan", articles: 45, clients: 12 },
  { month: "Feb", articles: 52, clients: 15 },
  { month: "Mar", articles: 48, clients: 13 },
  { month: "Apr", articles: 61, clients: 18 },
  { month: "May", articles: 55, clients: 16 },
  { month: "Jun", articles: 67, clients: 20 },
]

const articleTypeData = [
  { name: "Blog Posts", value: 65, color: "#2563EB" },
  { name: "Website Content", value: 35, color: "#60A5FA" },
]

export function DashboardOverview() {
  const totalArticles = monthlyData.reduce((sum, month) => sum + month.articles, 0)
  const totalClients = Math.max(...monthlyData.map((month) => month.clients))
  const avgArticlesPerMonth = Math.round(totalArticles / monthlyData.length)

  return (
    <div className="space-y-8 w-full">
      <div className="text-left">
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard Overview</h1>
        <p className="text-gray-300 text-lg">Track your content performance and metrics</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="bg-[#0F1B2E] border-[#1E3A5F]/30 hover:border-[#2563EB]/50 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-300">Total Articles</CardTitle>
            <div className="p-2 bg-[#2563EB]/20 rounded-lg">
              <FileText className="h-5 w-5 text-[#60A5FA]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">{totalArticles}</div>
            <p className="text-xs text-gray-300">Generated this year</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1B2E] border-[#1E3A5F]/30 hover:border-[#2563EB]/50 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-300">Active Clients</CardTitle>
            <div className="p-2 bg-[#2563EB]/20 rounded-lg">
              <Users className="h-5 w-5 text-[#60A5FA]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">{totalClients}</div>
            <p className="text-xs text-gray-300">Currently active</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1B2E] border-[#1E3A5F]/30 hover:border-[#2563EB]/50 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-300">Avg per Month</CardTitle>
            <div className="p-2 bg-[#2563EB]/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-[#60A5FA]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">{avgArticlesPerMonth}</div>
            <p className="text-xs text-gray-300">Articles generated</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1B2E] border-[#1E3A5F]/30 hover:border-[#2563EB]/50 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-300">Success Rate</CardTitle>
            <div className="p-2 bg-[#2563EB]/20 rounded-lg">
              <Target className="h-5 w-5 text-[#60A5FA]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">94%</div>
            <p className="text-xs text-gray-300">Content approval rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8">
        <Card className="bg-[#0F1B2E] border-[#1E3A5F]/30">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-xl">Monthly Article Production</CardTitle>
            <CardDescription className="text-gray-300">Articles generated over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F1B2E",
                    border: "1px solid #1E3A5F",
                    borderRadius: "8px",
                    color: "white",
                  }}
                />
                <Bar dataKey="articles" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1B2E] border-[#1E3A5F]/30">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-xl">Article Type Distribution</CardTitle>
            <CardDescription className="text-gray-300">Breakdown of content types generated</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={articleTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {articleTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F1B2E",
                    border: "1px solid #1E3A5F",
                    borderRadius: "8px",
                    color: "white",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-6">
              {articleTypeData.map((entry, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-sm text-gray-300 font-medium">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
