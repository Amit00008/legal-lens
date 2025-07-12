"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Shield, Upload, FileText, X, CheckCircle, AlertCircle, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { useAuth } from "@/components/auth-provider"
import { documentApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [autoDelete, setAutoDelete] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStep, setUploadStep] = useState<string>("")
  const [uploadComplete, setUploadComplete] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [documentId, setDocumentId] = useState<string>("")
  const router = useRouter()
  const { user, loading } = useAuth()
  const { toast } = useToast()

  // Auth protection - redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?redirectTo=/upload")
    }
  }, [user, loading, router])

  // Reset form when upload completes
  useEffect(() => {
    if (uploadComplete) {
      const timer = setTimeout(() => {
        router.push("/dashboard")
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [uploadComplete, router])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files)
      validateAndAddFiles(newFiles)
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      validateAndAddFiles(newFiles)
    }
  }

  const validateAndAddFiles = (newFiles: File[]) => {
    const errors: string[] = []
    const validFiles: File[] = []

    newFiles.forEach((file) => {
      const validTypes = ["application/pdf"]
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (!validTypes.includes(file.type)) {
        errors.push(`${file.name}: Invalid file type. Only PDF files are supported.`)
      } else if (file.size > maxSize) {
        errors.push(`${file.name}: File size exceeds 10MB limit.`)
      } else {
        validFiles.push(file)
      }
    })

    if (errors.length > 0) {
      setValidationErrors(errors)
      toast({
        title: "⚠️ File Validation Error",
        description: `${errors.length} file(s) were rejected`,
        variant: "destructive",
      })
    } else {
      setValidationErrors([])
    }

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setValidationErrors([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (files.length === 0) {
      toast({
        title: "❌ Error",
        description: "Please select a PDF file to upload",
        variant: "destructive",
      })
      return
    }
    if (!user) return

    setIsUploading(true)
    setUploadProgress(0)
    setUploadStep("Preparing upload...")
    setUploadComplete(false)
    setValidationErrors([])

    try {
      const file = files[0]
      if (file.type !== "application/pdf") {
        toast({
          title: "❌ Error",
          description: "Only PDF files are supported",
          variant: "destructive",
        })
        setIsUploading(false)
        return
      }

      // Step 1: Upload to Supabase Storage
      let filePath = ""
      if (!autoDelete) {
        // Step 1: Upload to Supabase Storage
        setUploadStep("Uploading file to storage...")
        setUploadProgress(10)
      
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${user.id}.${fileExt}`
        filePath = `${user.id}/${fileName}`
      
        const { data: storageData, error: storageError } = await supabase.storage
          .from('pdfs')
          .upload(filePath, file, { upsert: true })
      
        if (storageError) {
          toast({ 
            title: "❌ Upload Failed", 
            description: storageError.message, 
            variant: "destructive" 
          })
          setIsUploading(false)
          setUploadStep("")
          return
        }
      } else {
        setUploadStep("Skipping file storage (auto-delete enabled)...")
        toast({ 
          title: "🧠 Notice", 
          description: "Skipping file storage (auto-delete enabled)...", 
          variant: "default" 
        })
        setUploadProgress(10)
      }
      setUploadProgress(30)
      setUploadStep("Creating document record...")

      // Step 2: Create document row in DB
      const docRes = await documentApi.uploadDocument(user.id, title || file.name, filePath, 'processing')
      if (!docRes.success || !docRes.documentId) {
        toast({ 
          title: "❌ Error", 
          description: docRes.message, 
          variant: "destructive" 
        })
        setIsUploading(false)
        setUploadStep("")
        return
      }
      
      const docId = docRes.documentId
      setDocumentId(docId)
      setUploadProgress(50)
      setUploadStep("Extracting text from PDF...")

      // Step 3: Extract text from PDF using Hugging Face Space
      setUploadProgress(55)
      
      let pdfText = ""
      try {
        // Create FormData to send file directly
        const formData = new FormData()
        formData.append('file', file)
        
        // Send to Hugging Face Space for text extraction
        const extractRes = await fetch('https://amit098-legal-lens.hf.space/extract-text', {
          method: "POST",
          headers: {
            "Authorization": "Bearer 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",
            "api_key": "amit123"
          },
          body: formData
        })
        
        if (!extractRes.ok) {
          const errorData = await extractRes.json().catch(() => ({}))
          throw new Error(errorData.error || `HTTP ${extractRes.status}: Failed to extract text`)
        }
        
        const result = await extractRes.json()
        pdfText = result.extracted_text || result.text || ""
        
        if (!pdfText || pdfText.trim().length === 0) {
          toast({
            title: "⚠️ Warning",
            description: "Could not extract text from PDF. The file might be image-based or corrupted.",
            variant: "destructive",
          })
          pdfText = "[No text could be extracted from this PDF]"
        } else {
       
        }
        
      } catch (extractError) {
        console.error('PDF text extraction error:', extractError)
        toast({
          title: "❌ Extraction Failed",
          description: `Failed to extract text: ${extractError instanceof Error ? extractError.message : 'Unknown error'}`,
          variant: "destructive",
        })
        pdfText = "[PDF text extraction failed]"
      }

      // Step 4: Start background analysis
      setUploadStep("Starting AI analysis in background...")
      setUploadProgress(60)
      
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token || '';
      
      const analyzeRes = await fetch("/api/analyze-background", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ pdf_text: pdfText, document_id: docId }),
      })
      
      if (!analyzeRes.ok) {
        const errorData = await analyzeRes.json().catch(() => ({}))
        toast({ 
          title: "❌ Analysis Failed", 
          description: errorData.error || "Failed to start analysis.", 
          variant: "destructive" 
        })
        setIsUploading(false)
        setUploadStep("")
        return
      }

      setUploadProgress(70)
      setUploadStep("Analysis started! You can close this tab. Checking status...")

      // Step 5: Poll for document status with longer timeout
      let status = 'processing'
      let pollCount = 0
      const maxPolls = 180 // 3 minutes total (180 * 1 second intervals)
      
      while (status === 'processing' && pollCount < maxPolls) {
        await new Promise((res) => setTimeout(res, 2000)) // Poll every 2 seconds
        try {
          const doc = await documentApi.getDocument(docId)
          status = doc?.status || 'processing'
          setUploadProgress(70 + (pollCount * 30 / maxPolls))
          setUploadStep(`Analysis in progress... (${Math.floor(pollCount / 30)}:${(Math.floor((pollCount % 30) * 2)).toString().padStart(2, '0')} elapsed)`)
          pollCount++
        } catch (error) {
          console.error('Error polling document status:', error)
          pollCount++
        }
      }

      if (status === 'completed') {
        setUploadProgress(100)
        setUploadStep("Analysis completed successfully!")
        setUploadComplete(true)
        toast({ 
          title: "✅ Success", 
          description: "Document analyzed successfully! Redirecting to dashboard..." 
        })
      } else {
        toast({ 
          title: "❌ Error", 
          description: "Analysis failed or timed out.", 
          variant: "destructive" 
        })
        setIsUploading(false)
        setUploadProgress(0)
        setUploadStep("")
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast({ 
        title: "❌ Error", 
        description: "An unexpected error occurred during upload", 
        variant: "destructive" 
      })
      setIsUploading(false)
      setUploadProgress(0)
      setUploadStep("")
    }
  }

  // Show loading state if auth is still loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-4xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Upload Legal Document</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Upload your legal document for AI-powered analysis and insights
          </p>
        </div>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Document Upload</CardTitle>
            <CardDescription className="text-sm">
              Supported formats: PDF, DOCX (Max size: 10MB per file)
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 pt-0">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 sm:p-4">
                  <h4 className="text-red-800 font-semibold mb-2 text-sm sm:text-base">File Validation Errors:</h4>
                  <ul className="text-red-700 text-xs sm:text-sm space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors ${
                  dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  <span className="hidden sm:inline">Drop your files here, or click to browse</span>
                  <span className="sm:hidden">Tap to select files</span>
                </h3>
                <p className="text-sm text-gray-600 mb-4">Upload PDF or DOCX files up to 10MB each</p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                  disabled={isUploading}
                />
                <label htmlFor="file-upload">
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    disabled={isUploading}
                    className="w-full sm:w-auto bg-transparent"
                  >
                    <span>Choose Files</span>
                  </Button>
                </label>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Selected Files</Label>
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{file.name}</p>
                          <p className="text-xs sm:text-sm text-gray-600">{file.size}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={isUploading}
                        className="flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Document Details */}
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm sm:text-base">
                    Document Title (Optional)
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter a title for your document"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isUploading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm sm:text-base">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Add any additional context about this document"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isUploading}
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="auto-delete"
                    checked={autoDelete}
                    onCheckedChange={(checked) => setAutoDelete(checked as boolean)}
                    disabled={isUploading}
                  />
                  <Label htmlFor="auto-delete" className="text-sm sm:text-base">
                    Auto-delete after analysis (recommended for sensitive documents)
                  </Label>
                </div>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="font-medium text-blue-900">{uploadStep}</span>
                    </div>
                    <span className="text-sm font-medium text-blue-700">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                  
                  {/* Step indicators */}
                  <div className="grid grid-cols-6 gap-2 text-xs">
                    <div className={`text-center ${uploadProgress >= 10 ? 'text-blue-600' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${uploadProgress >= 10 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                      Upload
                    </div>
                    <div className={`text-center ${uploadProgress >= 30 ? 'text-blue-600' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${uploadProgress >= 30 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                      Create
                    </div>
                    <div className={`text-center ${uploadProgress >= 50 ? 'text-blue-600' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${uploadProgress >= 50 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                      Extract
                    </div>
                    <div className={`text-center ${uploadProgress >= 60 ? 'text-blue-600' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${uploadProgress >= 60 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                      Start Analysis
                    </div>
                    <div className={`text-center ${uploadProgress >= 70 ? 'text-blue-600' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${uploadProgress >= 70 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                      Monitor
                    </div>
                    <div className={`text-center ${uploadProgress >= 100 ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${uploadProgress >= 100 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                      Complete
                    </div>
                  </div>
                  
                  {/* Info message */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <span className="text-xs text-blue-800 font-medium">
                        ✅ Analysis runs in background. You can close this tab and check back later!
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Complete */}
              {uploadComplete && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <h3 className="text-green-800 font-semibold text-lg">Upload Complete!</h3>
                      <p className="text-green-700 text-sm">Your document has been successfully analyzed.</p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Document ID:</span>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">{documentId}</code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Status:</span>
                      <span className="text-sm text-green-600 font-medium">Completed</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center space-x-2 text-sm text-green-700">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Redirecting to dashboard in 3 seconds...</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isUploading || files.length === 0}
                size="lg"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload and Analyze
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
