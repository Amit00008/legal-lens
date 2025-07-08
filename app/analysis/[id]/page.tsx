"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Download,
  Share2,
  AlertTriangle,
  CheckCircle,
  Brain,
  HelpCircle,
  Eye,
  Clock,
  Users,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { analysisApi, documentApi, type Analysis, utils } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function AnalysisPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("overview")
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSharing, setIsSharing] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const { toast } = useToast()

  const documentId = Number.parseInt(params.id)

  useEffect(() => {
    loadAnalysis()
  }, [documentId])

  const loadAnalysis = async () => {
    setIsLoading(true)
    try {
      const analysisData = await analysisApi.getAnalysis(documentId)
      if (analysisData) {
        setAnalysis(analysisData)
      } else {
        toast({
          title: "Error",
          description: "Analysis not found",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load analysis",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    if (!analysis) return

    setIsSharing(true)
    try {
      const result = await analysisApi.shareAnalysis(analysis.id)
      if (result.success && result.shareUrl) {
        await navigator.clipboard.writeText(result.shareUrl)
        toast({
          title: "Success",
          description: "Share link copied to clipboard",
        })
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate share link",
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
    }
  }

  const handleDownload = async () => {
    if (!analysis) return

    setIsDownloading(true)
    try {
      const result = await documentApi.downloadReport(analysis.id)
      if (result.success && result.url) {
        window.open(result.url, "_blank")
        toast({
          title: "Success",
          description: result.message,
        })
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download report",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const getRiskBadge = (riskLevel: string) => {
    const props = utils.getRiskBadgeProps(riskLevel)
    return <Badge {...props}>{props.children}</Badge>
  }

  const getOverallRiskLevel = (riskScore: string): "low" | "medium" | "high" => {
    const score = utils.parseRiskScore(riskScore)
    if (score >= 70) return "low"
    if (score >= 40) return "medium"
    return "high"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-4 sm:py-8">
          <div className="animate-pulse">
            <div className="h-6 sm:h-8 bg-gray-200 rounded w-2/3 sm:w-1/3 mb-4"></div>
            <div className="h-24 sm:h-32 bg-gray-200 rounded mb-4 sm:mb-6"></div>
            <div className="h-64 sm:h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-4 sm:py-8 text-center">
          <AlertTriangle className="h-8 w-8 sm:h-12 sm:w-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Analysis Not Found</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4">The requested analysis could not be found.</p>
          <Link href="/dashboard">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const overallScore = utils.parseRiskScore(analysis.risk_score)
  const overallRiskLevel = getOverallRiskLevel(analysis.risk_score)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Document Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 truncate">
                {analysis.title}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm sm:text-base text-gray-600">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Analyzed on </span>
                  {utils.formatDate(analysis.uploadDate)}
                </span>
                <span className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  Analysis Complete
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="text-center sm:text-right">
                {getRiskBadge(overallRiskLevel)}
                <div className="mt-2">
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">{overallScore}</span>
                  <span className="text-gray-600">/100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
            <Button
              variant="outline"
              onClick={handleShare}
              disabled={isSharing}
              className="w-full sm:w-auto bg-transparent"
            >
              {isSharing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Share2 className="w-4 h-4 mr-2" />}
              Share
            </Button>
            <Button onClick={handleDownload} disabled={isDownloading} className="w-full sm:w-auto">
              {isDownloading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              <span className="hidden sm:inline">Download Report</span>
              <span className="sm:hidden">Download</span>
            </Button>
          </div>

          {/* Overall Score */}
          <Card className="mb-4 sm:mb-6">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <h3 className="text-base sm:text-lg font-semibold">Overall Risk Assessment</h3>
                {getRiskBadge(overallRiskLevel)}
              </div>
              <Progress value={overallScore} className="mb-2" />
              <p className="text-xs sm:text-sm text-gray-600">{analysis.risk_score}</p>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-4 sm:mb-6">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Info</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Categories</span>
              <span className="sm:hidden">Cats</span>
            </TabsTrigger>
            <TabsTrigger value="findings" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Key Findings</span>
              <span className="sm:hidden">Findings</span>
            </TabsTrigger>
            <TabsTrigger value="questions" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Legal Questions</span>
              <span className="sm:hidden">Q&A</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <Brain className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                  AI Summary
                </CardTitle>
                <CardDescription className="text-sm">Plain English summary of your legal document</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{analysis.full_summary}</p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <Card>
                <CardContent className="p-4 sm:p-6 text-center">
                  <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 mx-auto mb-2" />
                  <div className="text-xl sm:text-2xl font-bold text-red-600">
                    {analysis.key_findings.filter((f) => f.risk_level === "High").length}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">High Risk Issues</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6 text-center">
                  <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                    {analysis.key_findings.filter((f) => f.risk_level === "Medium").length}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">Medium Risk Issues</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6 text-center">
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-xl sm:text-2xl font-bold text-green-600">
                    {analysis.key_findings.filter((f) => f.risk_level === "Low").length}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">Low Risk Issues</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4 sm:space-y-6">
            {Object.entries(analysis.categories).map(([categoryName, categoryData], index) => (
              <Card key={index}>
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-base sm:text-lg">{categoryName}</CardTitle>
                    {getRiskBadge(categoryData.risk_level)}
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <ul className="space-y-2 sm:space-y-3">
                    {categoryData.points.map((point, pointIndex) => (
                      <li key={pointIndex} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm sm:text-base text-gray-700 leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Key Findings Tab */}
          <TabsContent value="findings" className="space-y-3 sm:space-y-4">
            {analysis.key_findings.map((finding, index) => (
              <Card
                key={index}
                className={`border-l-4 ${
                  finding.risk_level === "High"
                    ? "border-l-red-500"
                    : finding.risk_level === "Medium"
                      ? "border-l-yellow-500"
                      : "border-l-green-500"
                }`}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl sm:text-2xl">{finding.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{finding.title}</h3>
                        <div className="mt-1">{getRiskBadge(finding.risk_level)}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs self-start">
                      {finding.section}
                    </Badge>
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{finding.description}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Legal Questions Tab */}
          <TabsContent value="questions" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                  Legal Questions for Review
                </CardTitle>
                <CardDescription className="text-sm">
                  These AI-generated questions can help guide your discussion with a legal professional
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-3 sm:space-y-4">
                  {analysis.legal_questions.map((question, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{question}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start space-x-3">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Need Legal Advice?</h3>
                    <p className="text-blue-800 text-xs sm:text-sm mb-3">
                      While our AI provides valuable insights, consider consulting with a qualified attorney for complex
                      legal matters.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent w-full sm:w-auto"
                    >
                      Find Legal Professionals
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
