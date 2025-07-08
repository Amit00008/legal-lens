// Mock API helper functions for LegalLens AI

export interface Document {
  id: number
  title: string
  status: "processing" | "completed" | "failed"
  uploadDate: string
  riskLevel: "low" | "medium" | "high"
  summary: string
  categories: string[]
  fileSize?: number
  fileName?: string
}

export interface Analysis {
  id: number
  title: string
  uploadDate: string
  status: string
  full_summary: string
  risk_score: string // Format: "42/100 (Higher scores indicate lower risk)"
  categories: {
    [categoryName: string]: {
      risk_level: string // "Low Risk", "Medium Risk", "High Risk"
      points: string[]
    }
  }
  key_findings: {
    title: string
    description: string
    risk_level: string // "Low", "Medium", "High"
    icon: string
    section: string
  }[]
  legal_questions: string[]
}

export interface UserStats {
  totalDocuments: number
  highRiskDocuments: number
  completedDocuments: number
  processingDocuments: number
  monthlyGrowth: number
}

// Mock data
const mockDocuments: Document[] = [
  {
    id: 1,
    title: "Consulting Agreement - XYZ Corporation",
    status: "completed",
    uploadDate: "2024-01-15",
    riskLevel: "medium",
    summary: "Business consulting agreement with moderate risk factors regarding termination and IP ownership.",
    categories: [
      "Liability & Indemnification",
      "Payment Terms",
      "Confidentiality",
      "Termination",
      "Dispute Resolution",
    ],
    fileSize: 245760,
    fileName: "consulting-agreement-xyz.pdf",
  },
  {
    id: 2,
    title: "NDA - TechStart Inc",
    status: "completed",
    uploadDate: "2024-01-14",
    riskLevel: "low",
    summary: "Standard non-disclosure agreement with typical confidentiality terms.",
    categories: ["Confidentiality", "Duration", "Exceptions"],
    fileSize: 156432,
    fileName: "nda-techstart.pdf",
  },
  {
    id: 3,
    title: "Employment Contract - Remote Work",
    status: "processing",
    uploadDate: "2024-01-16",
    riskLevel: "high",
    summary: "Employment contract with several concerning clauses regarding intellectual property.",
    categories: ["IP Rights", "Compensation", "Termination"],
    fileSize: 312456,
    fileName: "employment-contract-remote.docx",
  },
  {
    id: 4,
    title: "Software License Agreement",
    status: "completed",
    uploadDate: "2024-01-13",
    riskLevel: "medium",
    summary: "Software licensing terms with standard usage restrictions and liability limitations.",
    categories: ["Usage Rights", "Liability", "Support"],
    fileSize: 198765,
    fileName: "software-license.pdf",
  },
]

const mockAnalyses: { [key: number]: Analysis } = {
  1: {
    id: 1,
    title: "Consulting Agreement - XYZ Corporation",
    uploadDate: "2024-01-15",
    status: "completed",
    full_summary:
      'XYZ Corporation ("Company") and Jane Smith Consulting LLC ("Consultant") will provide business advisory services. The Company agrees to pay Consultant a fee of $10,000 per month, payable upon invoice receipt. This Agreement shall be governed by the laws of the State of California. Any disputes shall be resolved through binding arbitration under the rules of the American Arbitration Association, to be held in San Francisco.',
    risk_score: "42/100 (Higher scores indicate lower risk)",
    categories: {
      "Liability & Indemnification": {
        risk_level: "Medium Risk",
        points: [
          'This Consulting Agreement ("Agreement") is entered into by and between XYZ Corporation ("Company") and Jane Smith Consulting LLC ("Consultant").',
          "Each party agrees to indemnify the other against any third-party claims arising from gross negligence or willful misconduct. Consultant's total liability is capped at the total amount paid under this Agreement.",
          "Ownership of any intellectual property developed during the engagement will be determined through mutual agreement. No clear assignment of IP rights is stated in this Agreement.",
        ],
      },
      "Payment Terms": {
        risk_level: "Low Risk",
        points: [
          "Consultant will provide business advisory services focused on operational improvements and market expansion.",
          "The Company agrees to pay Consultant a fee of $10,000 per month, payable upon invoice receipt. Late fees of 2% per month will apply to overdue payments.",
        ],
      },
      Confidentiality: {
        risk_level: "Medium Risk",
        points: [
          "Both parties agree to maintain the confidentiality of all proprietary information shared during the engagement. The confidentiality obligation shall survive for 3 years after the termination of this Agreement.",
        ],
      },
      Termination: {
        risk_level: "High Risk",
        points: [
          "This Agreement shall commence on July 1, 2025, and continue for a term of 12 months. Either party may terminate this Agreement with 30 days' prior written notice. Immediate termination is allowed in case of a material breach.",
          "IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date.",
        ],
      },
      "Dispute Resolution": {
        risk_level: "Medium Risk",
        points: [
          "Any disputes shall be resolved through binding arbitration under the rules of the American Arbitration Association, to be held in San Francisco, CA.",
          "This Agreement shall be governed by the laws of the State of California.",
        ],
      },
    },
    key_findings: [
      {
        title: "Broad Termination Clause",
        description: "Agreement allows broad termination clauses which may result in early contract cancellation.",
        risk_level: "High",
        icon: "🔴",
        section: "Section 8.2",
      },
      {
        title: "Limited Liability Cap",
        description: "Liability limits are present, potentially capping damages recoverable under this agreement.",
        risk_level: "Medium",
        icon: "🟡",
        section: "Section 12.1",
      },
      {
        title: "Clear Payment Terms",
        description: "Clear payment terms are defined, reducing payment-related ambiguities.",
        risk_level: "Low",
        icon: "🟢",
        section: "Section 4",
      },
      {
        title: "IP Ownership Ambiguity",
        description: "Intellectual Property (IP) ownership clauses may lack clarity, review is recommended.",
        risk_level: "Medium",
        icon: "🟡",
        section: "Section 9.3",
      },
    ],
    legal_questions: [
      'What specific operational improvements and market expansion strategies are within the scope of the "business advisory services," and what deliverables are expected from the Consultant each month?',
      'Regarding intellectual property, what happens if the parties fail to reach a "mutual agreement" on ownership of intellectual property developed during the engagement?',
      'What constitutes a "material breach" that would justify immediate termination of the Agreement?',
      "What is the Consultant's insurance coverage, and are the coverage limits adequate to address potential liability?",
    ],
  },
  2: {
    id: 2,
    title: "NDA - TechStart Inc",
    uploadDate: "2024-01-14",
    status: "completed",
    full_summary:
      "This Non-Disclosure Agreement establishes confidentiality obligations between TechStart Inc and the receiving party. The agreement covers proprietary information, trade secrets, and business strategies. Standard exceptions apply for publicly available information and independently developed materials.",
    risk_score: "78/100 (Higher scores indicate lower risk)",
    categories: {
      Confidentiality: {
        risk_level: "Low Risk",
        points: [
          "Both parties agree to maintain strict confidentiality of all proprietary information.",
          "Standard exceptions for publicly available information and independently developed materials.",
          "Confidentiality obligations survive for 5 years after agreement termination.",
        ],
      },
      Duration: {
        risk_level: "Low Risk",
        points: [
          "Agreement term is clearly defined as 2 years from execution date.",
          "Automatic renewal clause with 30-day opt-out notice period.",
        ],
      },
      Exceptions: {
        risk_level: "Low Risk",
        points: [
          "Standard exceptions for publicly available information clearly outlined.",
          "Independent development exception properly defined.",
          "Required disclosure by law exception included.",
        ],
      },
    },
    key_findings: [
      {
        title: "Standard Confidentiality Terms",
        description: "Agreement contains industry-standard confidentiality provisions with appropriate exceptions.",
        risk_level: "Low",
        icon: "🟢",
        section: "Section 2",
      },
      {
        title: "Clear Duration Terms",
        description: "Agreement duration and survival clauses are clearly defined and reasonable.",
        risk_level: "Low",
        icon: "🟢",
        section: "Section 5",
      },
    ],
    legal_questions: [
      "Are the confidentiality obligations mutual, or does one party have broader disclosure rights?",
      "What specific remedies are available in case of breach of confidentiality?",
      'How is "proprietary information" specifically defined in this agreement?',
    ],
  },
}

// Utility function to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Document API functions
export const documentApi = {
  // Get all documents for the current user
  async getDocuments(searchTerm?: string): Promise<Document[]> {
    await delay(800) // Simulate API delay

    let documents = [...mockDocuments]

    if (searchTerm) {
      documents = documents.filter((doc) => doc.title.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    return documents
  },

  // Get a specific document by ID
  async getDocument(id: number): Promise<Document | null> {
    await delay(500)

    const document = mockDocuments.find((doc) => doc.id === id)
    return document || null
  },

  // Upload a new document
  async uploadDocument(
    files: File[],
    title?: string,
    description?: string,
    autoDelete?: boolean,
  ): Promise<{ success: boolean; documentId?: number; message: string }> {
    await delay(2000) // Simulate upload time

    // Simulate upload validation
    if (files.length === 0) {
      return {
        success: false,
        message: "No files provided",
      }
    }

    // Check file types
    const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    const invalidFiles = files.filter((file) => !validTypes.includes(file.type))

    if (invalidFiles.length > 0) {
      return {
        success: false,
        message: "Invalid file type. Only PDF and DOCX files are supported.",
      }
    }

    // Check file sizes (10MB limit)
    const oversizedFiles = files.filter((file) => file.size > 10 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      return {
        success: false,
        message: "File size exceeds 10MB limit.",
      }
    }

    // Create new document
    const newDocumentId = Math.max(...mockDocuments.map((d) => d.id)) + 1
    const newDocument: Document = {
      id: newDocumentId,
      title: title || files[0].name,
      status: "processing",
      uploadDate: new Date().toISOString().split("T")[0],
      riskLevel: "medium",
      summary: "Document is being analyzed...",
      categories: [],
      fileSize: files[0].size,
      fileName: files[0].name,
    }

    // Add to mock data (in real app, this would be sent to server)
    mockDocuments.push(newDocument)

    // Create corresponding analysis data
    mockAnalyses[newDocumentId] = {
      id: newDocumentId,
      title: newDocument.title,
      uploadDate: newDocument.uploadDate,
      status: "processing",
      full_summary: "Analysis in progress...",
      risk_score: "0/100 (Analysis in progress)",
      categories: {},
      key_findings: [],
      legal_questions: [],
    }

    // Simulate processing completion after 3 seconds
    setTimeout(() => {
      const docIndex = mockDocuments.findIndex((d) => d.id === newDocumentId)
      if (docIndex !== -1) {
        mockDocuments[docIndex] = {
          ...mockDocuments[docIndex],
          status: "completed",
          summary: "AI analysis completed successfully.",
          categories: ["Contract Terms", "Risk Assessment", "Legal Compliance"],
        }

        // Update analysis data
        mockAnalyses[newDocumentId] = {
          ...mockAnalyses[newDocumentId],
          status: "completed",
          full_summary:
            "This document has been successfully analyzed. The agreement contains standard terms with moderate risk factors that should be reviewed by legal counsel.",
          risk_score: "65/100 (Higher scores indicate lower risk)",
          categories: {
            "Contract Terms": {
              risk_level: "Medium Risk",
              points: [
                "Standard contract structure with clear parties identification.",
                "Terms and conditions are generally well-defined.",
                "Some clauses may require clarification or negotiation.",
              ],
            },
            "Risk Assessment": {
              risk_level: "Medium Risk",
              points: [
                "Moderate risk factors identified in liability and termination clauses.",
                "Recommended legal review before execution.",
              ],
            },
          },
          key_findings: [
            {
              title: "Standard Contract Structure",
              description: "Document follows industry-standard contract format with clear identification of parties.",
              risk_level: "Low",
              icon: "🟢",
              section: "Section 1",
            },
            {
              title: "Moderate Risk Clauses",
              description: "Several clauses present moderate risk and should be reviewed by legal counsel.",
              risk_level: "Medium",
              icon: "🟡",
              section: "Various",
            },
          ],
          legal_questions: [
            "Are the terms and conditions clearly understood by both parties?",
            "Have all liability and indemnification clauses been reviewed?",
            "Are the termination conditions acceptable to both parties?",
          ],
        }
      }
    }, 3000)

    return {
      success: true,
      documentId: newDocumentId,
      message: "Document uploaded successfully and analysis started.",
    }
  },

  // Delete a document
  async deleteDocument(id: number): Promise<{ success: boolean; message: string }> {
    await delay(500)

    const index = mockDocuments.findIndex((doc) => doc.id === id)
    if (index === -1) {
      return {
        success: false,
        message: "Document not found",
      }
    }

    mockDocuments.splice(index, 1)
    delete mockAnalyses[id] // Also remove analysis data
    return {
      success: true,
      message: "Document deleted successfully",
    }
  },

  // Download document report
  async downloadReport(id: number): Promise<{ success: boolean; url?: string; message: string }> {
    await delay(1000)

    const document = mockDocuments.find((doc) => doc.id === id)
    if (!document) {
      return {
        success: false,
        message: "Document not found",
      }
    }

    if (document.status !== "completed") {
      return {
        success: false,
        message: "Document analysis not completed yet",
      }
    }

    // In a real app, this would generate and return a download URL
    return {
      success: true,
      url: `/api/reports/${id}/download`,
      message: "Report ready for download",
    }
  },
}

// Analysis API functions
export const analysisApi = {
  // Get analysis for a specific document
  async getAnalysis(id: number): Promise<Analysis | null> {
    await delay(1000)

    const analysis = mockAnalyses[id]
    return analysis || null
  },

  // Share analysis
  async shareAnalysis(id: number, email?: string): Promise<{ success: boolean; shareUrl?: string; message: string }> {
    await delay(800)

    const shareUrl = `${window.location.origin}/shared/analysis/${id}`

    return {
      success: true,
      shareUrl,
      message: email ? `Analysis shared with ${email}` : "Share link generated successfully",
    }
  },
}

// User stats API functions
export const userApi = {
  // Get user dashboard stats
  async getUserStats(): Promise<UserStats> {
    await delay(600)

    const totalDocuments = mockDocuments.length
    const highRiskDocuments = mockDocuments.filter((doc) => doc.riskLevel === "high").length
    const completedDocuments = mockDocuments.filter((doc) => doc.status === "completed").length
    const processingDocuments = mockDocuments.filter((doc) => doc.status === "processing").length

    return {
      totalDocuments,
      highRiskDocuments,
      completedDocuments,
      processingDocuments,
      monthlyGrowth: 2, // Mock growth
    }
  },

  // Get recent activity
  async getRecentActivity(): Promise<
    {
      id: number
      type: "upload" | "analysis" | "download"
      title: string
      timestamp: string
    }[]
  > {
    await delay(400)

    return [
      {
        id: 1,
        type: "analysis",
        title: "Analysis completed for Consulting Agreement - XYZ Corporation",
        timestamp: "2024-01-16T10:30:00Z",
      },
      {
        id: 2,
        type: "upload",
        title: "Uploaded Employment Contract - Remote Work",
        timestamp: "2024-01-16T09:15:00Z",
      },
      {
        id: 3,
        type: "download",
        title: "Downloaded report for NDA - TechStart Inc",
        timestamp: "2024-01-15T16:45:00Z",
      },
    ]
  },
}

// Search API functions
export const searchApi = {
  // Search across documents and analyses
  async searchDocuments(
    query: string,
    filters?: {
      riskLevel?: "low" | "medium" | "high"
      status?: "processing" | "completed" | "failed"
      dateRange?: { from: string; to: string }
    },
  ): Promise<Document[]> {
    await delay(600)

    let results = mockDocuments.filter(
      (doc) =>
        doc.title.toLowerCase().includes(query.toLowerCase()) ||
        doc.summary.toLowerCase().includes(query.toLowerCase()) ||
        doc.categories.some((cat) => cat.toLowerCase().includes(query.toLowerCase())),
    )

    if (filters?.riskLevel) {
      results = results.filter((doc) => doc.riskLevel === filters.riskLevel)
    }

    if (filters?.status) {
      results = results.filter((doc) => doc.status === filters.status)
    }

    if (filters?.dateRange) {
      results = results.filter((doc) => {
        const docDate = new Date(doc.uploadDate)
        const fromDate = new Date(filters.dateRange!.from)
        const toDate = new Date(filters.dateRange!.to)
        return docDate >= fromDate && docDate <= toDate
      })
    }

    return results
  },
}

// Utility functions
export const utils = {
  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  },

  // Format date
  formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  },

  // Parse risk score from string format "42/100 (Higher scores indicate lower risk)"
  parseRiskScore(riskScore: string): number {
    const match = riskScore.match(/^(\d+)\/100/)
    return match ? Number.parseInt(match[1]) : 0
  },

  // Convert risk level string to lowercase for consistency
  normalizeRiskLevel(riskLevel: string): "low" | "medium" | "high" {
    const normalized = riskLevel.toLowerCase().replace(" risk", "")
    if (normalized === "low") return "low"
    if (normalized === "medium") return "medium"
    if (normalized === "high") return "high"
    return "medium" // default
  },

  // Get risk color classes
  getRiskColorClasses(risk: "low" | "medium" | "high"): string {
    switch (risk) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200"
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "low":
        return "text-green-600 bg-green-50 border-green-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  },

  // Get risk badge component props
  getRiskBadgeProps(riskLevel: string): { variant: "destructive" | "default"; className?: string; children: string } {
    const normalized = this.normalizeRiskLevel(riskLevel)
    switch (normalized) {
      case "high":
        return { variant: "destructive", children: "High Risk" }
      case "medium":
        return {
          variant: "default",
          className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
          children: "Medium Risk",
        }
      case "low":
        return {
          variant: "default",
          className: "bg-green-100 text-green-800 hover:bg-green-100",
          children: "Low Risk",
        }
      default:
        return { variant: "default", children: riskLevel }
    }
  },

  // Validate file for upload
  validateFile(file: File): { valid: boolean; error?: string } {
    const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: "Invalid file type. Only PDF and DOCX files are supported.",
      }
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: "File size exceeds 10MB limit.",
      }
    }

    return { valid: true }
  },
}
