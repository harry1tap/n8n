import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SKYWIDE - Internal Staff Dashboard",
  description: "SKYWIDE internal staff dashboard powered by SEOBRAND AI for content creation and project management",
  keywords: ["SKYWIDE", "dashboard", "content creation", "SEO", "AI"],
  authors: [{ name: "SKYWIDE Team" }],
  creator: "SKYWIDE",
  publisher: "SKYWIDE",
  robots: "noindex, nofollow", // Since this is an internal dashboard
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
