"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Download,
  AlertTriangle,
  CheckCircle,
  Brain,
  HelpCircle,
  Eye,
  Clock,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { analysisApi, documentApi } from "@/lib/api"
import { type Analysis as SupabaseAnalysis } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function SharedAnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const [activeTab, setActiveTab] = useState("overview")
  const [analysis, setAnalysis] = useState<SupabaseAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Unwrap params using React.use() as required by Next.js 15
  const resolvedParams = use(params)
  const documentId = resolvedParams.id // string

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

  const handleDownload = async () => {
    if (!analysis) return

    setIsDownloading(true)
    try {
      // First try to download with blob storage
      let result = await documentApi.downloadReport(analysis.document_id, true)
      
      if (result.success && result.url) {
        // If blob storage worked, download from the URL
        const link = document.createElement('a')
        link.href = result.url
        link.download = result.fileName || 'legal-analysis-report.pdf'
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        toast({
          title: "📄 Success",
          description: "Report downloaded successfully",
        })
      } else if (result.success && result.pdfData) {
        // Fallback to direct download
        const link = document.createElement('a')
        link.href = result.pdfData
        link.download = result.fileName || 'legal-analysis-report.pdf'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        toast({
          title: "📄 Success",
          description: "Report downloaded successfully",
        })
      } else {
        // If blob failed, try direct download
        result = await documentApi.downloadReport(analysis.document_id, false)
        
        if (result.success && result.pdfData) {
          const link = document.createElement('a')
          link.href = result.pdfData
          link.download = result.fileName || 'legal-analysis-report.pdf'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          toast({
            title: "📄 Success",
            description: "Report downloaded successfully",
          })
        } else {
          toast({
            title: "❌ Error",
            description: result.message,
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to download report",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  // Utility: parse risk score (string)
  const parseRiskScore = (riskScore: string) => {
    if (!riskScore) return 0;
    const match = riskScore.match(/(\d+)\/100/);
    return match ? parseInt(match[1]) : 0;
  };

  // Utility: get risk badge props
  const getRiskBadge = (riskLevel: string) => {
    switch ((riskLevel || '').toLowerCase()) {
      case 'high':
      case 'high risk':
        return <Badge variant="destructive" className="text-xs">High Risk</Badge>;
      case 'medium':
      case 'medium risk':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-xs">Medium Risk</Badge>;
      case 'low':
      case 'low risk':
        return <Badge className="bg-green-100 text-green-800 hover:bg-yellow-100 text-xs">Low Risk</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{riskLevel}</Badge>;
    }
  };

  const getOverallRiskLevel = (riskScore: string): "low" | "medium" | "high" => {
    const score = parseRiskScore(riskScore);
    if (score >= 70) return "low";
    if (score >= 40) return "medium";
    return "high";
  };

  // Helper function to extract risks from risks_detected (key_findings)
  const getRisksFromAnalysis = (analysis: SupabaseAnalysis) => {
    if (!analysis.risks_detected || !Array.isArray(analysis.risks_detected)) {
      return [];
    }
    
    return analysis.risks_detected.map((finding: any) => ({
      title: finding.title || 'Unknown Finding',
      risk_level: finding.risk_level || 'medium',
      description: finding.description || '',
      section: finding.section || '',
      icon: finding.icon || '⚠️'
    }));
  };

  // Helper function to extract categories from analysis
  const getCategoriesFromAnalysis = (analysis: SupabaseAnalysis) => {
    if (!analysis.categories || typeof analysis.categories !== 'object') {
      return [];
    }
    
    return Object.entries(analysis.categories).map(([name, category]: [string, any]) => ({
      name,
      risk_level: category.risk_level || 'Medium Risk',
      points: Array.isArray(category.points) ? category.points : []
    }));
  };

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
          <p className="text-sm sm:text-base text-gray-600 mb-4">The requested analysis could not be found or is not publicly accessible.</p>
          <Link href="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // No risk_score field; set defaults
  const overallScore = parseRiskScore(analysis.risk_score);
  const overallRiskLevel = getOverallRiskLevel(analysis.risk_score);

  // Extract data from analysis
  const risks = getRisksFromAnalysis(analysis);
  const categories = getCategoriesFromAnalysis(analysis);
  const suggestedQuestions = analysis.suggested_questions || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Document Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 truncate">
                Shared Analysis
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm sm:text-base text-gray-600">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Analyzed on </span>
                  {analysis.created_at}
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
                <h3 className="text-base sm:text-lg font-semibold">Risk Assessment</h3>
                {getRiskBadge(overallRiskLevel)}
              </div>
              <Progress value={overallScore} className="mb-2" />
              <p className="text-xs sm:text-sm text-gray-600">{analysis.risk_score}</p>
              <div className="grid grid-cols-3 gap-4 text-center mt-4">
                <div>
                  <div className="text-2xl font-bold text-red-600">{risks.filter(r => r.risk_level.toLowerCase().includes('high')).length}</div>
                  <div className="text-xs text-gray-600">High Risk</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{risks.filter(r => r.risk_level.toLowerCase().includes('medium')).length}</div>
                  <div className="text-xs text-gray-600">Medium Risk</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{risks.filter(r => r.risk_level.toLowerCase().includes('low')).length}</div>
                  <div className="text-xs text-gray-600">Low Risk</div>
                </div>
              </div>
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
            <TabsTrigger value="findings" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Key Findings</span>
              <span className="sm:hidden">Findings</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Categories</span>
              <span className="sm:hidden">Categories</span>
            </TabsTrigger>
            <TabsTrigger value="questions" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Questions</span>
              <span className="sm:hidden">Q&A</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{analysis.summary}</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Risk Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{overallScore}/100</div>
                    <p className="text-sm text-gray-600">{analysis.risk_score}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HelpCircle className="w-5 h-5 mr-2" />
                    Key Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {suggestedQuestions.slice(0, 3).map((question: string, index: number) => (
                      <div key={index} className="text-sm text-gray-700">
                        • {question}
                      </div>
                    ))}
                    {suggestedQuestions.length > 3 && (
                      <div className="text-sm text-gray-500">
                        +{suggestedQuestions.length - 3} more questions
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Key Findings Tab */}
          <TabsContent value="findings" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {risks.map((finding: any, index: number) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm sm:text-base">{finding.title}</CardTitle>
                      <span className="text-2xl">{finding.icon}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 mb-3">{finding.description}</p>
                    <div className="flex items-center justify-between">
                      {getRiskBadge(finding.risk_level)}
                      <span className="text-xs text-gray-500">{finding.section}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4 sm:space-y-6">
            {categories.map((cat: any, idx: number) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg">{cat.name || `Category ${idx+1}`}</CardTitle>
                    {getRiskBadge(cat.risk_level)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cat.points.map((point: string, i: number) => (
                      <div key={i} className="text-sm text-gray-700 leading-relaxed">
                        • {point}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HelpCircle className="w-5 h-5 mr-2" />
                  Legal Questions
                </CardTitle>
                <CardDescription>
                  These questions can help you discuss the document with legal professionals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suggestedQuestions.map((question: string, index: number) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <HelpCircle className="w-4 h-4 text-blue-500 mt-1" />
                        <span className="text-gray-800 text-sm">{question}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 