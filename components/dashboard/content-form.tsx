"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Send, CheckCircle, AlertCircle } from "lucide-react"

interface FormData {
  articleTitle: string
  targetAudience: string
  seoKeywords: string
  articleType: string
  clientName: string
  creativeBrief: string
}

export function ContentForm() {
  const [formData, setFormData] = useState<FormData>({
    articleTitle: "",
    targetAudience: "",
    seoKeywords: "",
    articleType: "",
    clientName: "",
    creativeBrief: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    try {
      const response = await fetch("https://seobrand.app.n8n.cloud/webhook/content-engine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          articleTitle: formData.articleTitle,
          titleAudience: formData.targetAudience,
          seoKeywords: formData.seoKeywords,
          articleType: formData.articleType,
          clientName: formData.clientName,
          creativeBrief: formData.creativeBrief,
        }),
      })

      if (response.ok) {
        setSubmitStatus("success")
        setFormData({
          articleTitle: "",
          targetAudience: "",
          seoKeywords: "",
          articleType: "",
          clientName: "",
          creativeBrief: "",
        })
      } else {
        throw new Error("Failed to submit form")
      }
    } catch (error) {
      setSubmitStatus("error")
      setErrorMessage("Failed to submit content request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-[#0F1B2E] border-[#1E3A5F]/30">
      <CardHeader className="pb-6">
        <CardTitle className="text-3xl text-white">Content Request Form</CardTitle>
        <CardDescription className="text-gray-300 text-lg">
          Submit your content requirements to the SKYWIDE AI content engine
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="articleTitle" className="text-gray-200 font-medium text-sm">
                Article Title
              </Label>
              <Input
                id="articleTitle"
                placeholder="Enter the article title"
                value={formData.articleTitle}
                onChange={(e) => handleInputChange("articleTitle", e.target.value)}
                className="bg-[#1E3A5F]/20 border-[#1E3A5F] text-white placeholder:text-gray-500 h-12 rounded-lg focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
                required
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="targetAudience" className="text-gray-200 font-medium text-sm">
                Target Audience
              </Label>
              <Input
                id="targetAudience"
                placeholder="Describe the target audience"
                value={formData.targetAudience}
                onChange={(e) => handleInputChange("targetAudience", e.target.value)}
                className="bg-[#1E3A5F]/20 border-[#1E3A5F] text-white placeholder:text-gray-500 h-12 rounded-lg focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
                required
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="seoKeywords" className="text-gray-200 font-medium text-sm">
                SEO Keywords
              </Label>
              <Input
                id="seoKeywords"
                placeholder="Enter SEO keywords (comma separated)"
                value={formData.seoKeywords}
                onChange={(e) => handleInputChange("seoKeywords", e.target.value)}
                className="bg-[#1E3A5F]/20 border-[#1E3A5F] text-white placeholder:text-gray-500 h-12 rounded-lg focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
                required
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="articleType" className="text-gray-200 font-medium text-sm">
                Article Type
              </Label>
              <Select value={formData.articleType} onValueChange={(value) => handleInputChange("articleType", value)}>
                <SelectTrigger className="bg-[#1E3A5F]/20 border-[#1E3A5F] text-white h-12 rounded-lg focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]">
                  <SelectValue placeholder="Select article type" />
                </SelectTrigger>
                <SelectContent className="bg-[#0F1B2E] border-[#1E3A5F] rounded-lg">
                  <SelectItem
                    value="Blog"
                    className="text-white hover:bg-[#1E3A5F]/50 rounded-md focus:bg-[#1E3A5F]/50"
                  >
                    Blog
                  </SelectItem>
                  <SelectItem
                    value="Website"
                    className="text-white hover:bg-[#1E3A5F]/50 rounded-md focus:bg-[#1E3A5F]/50"
                  >
                    Website
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 lg:col-span-2">
              <Label htmlFor="clientName" className="text-gray-200 font-medium text-sm">
                Client Name
              </Label>
              <Input
                id="clientName"
                placeholder="Enter client name"
                value={formData.clientName}
                onChange={(e) => handleInputChange("clientName", e.target.value)}
                className="bg-[#1E3A5F]/20 border-[#1E3A5F] text-white placeholder:text-gray-500 h-12 rounded-lg focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="creativeBrief" className="text-gray-200 font-medium text-sm">
              Creative Brief
            </Label>
            <Textarea
              id="creativeBrief"
              placeholder="Provide detailed creative brief and requirements..."
              value={formData.creativeBrief}
              onChange={(e) => handleInputChange("creativeBrief", e.target.value)}
              className="bg-[#1E3A5F]/20 border-[#1E3A5F] text-white placeholder:text-gray-500 min-h-[150px] rounded-lg focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all resize-none"
              required
            />
          </div>

          {submitStatus === "success" && (
            <Alert className="bg-green-900/50 border-green-700/50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <AlertDescription className="text-green-300 font-medium">
                Content request submitted successfully! Your request has been sent to the SKYWIDE AI content engine.
              </AlertDescription>
            </Alert>
          )}

          {submitStatus === "error" && (
            <Alert className="bg-red-900/50 border-red-700/50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <AlertDescription className="text-red-300 font-medium">{errorMessage}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white h-14 rounded-lg font-semibold text-lg transition-all duration-200"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting Request...
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Send className="h-5 w-5" />
                Submit Content Request
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
