"use client"

import type React from "react"

import { useState, useCallback } from "react"
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
import { documentApi, utils } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [autoDelete, setAutoDelete] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const router = useRouter()
  const { toast } = useToast()

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
      const validation = utils.validateFile(file)
      if (validation.valid) {
        validFiles.push(file)
      } else {
        errors.push(`${file.name}: ${validation.error}`)
      }
    })

    if (errors.length > 0) {
      setValidationErrors(errors)
      toast({
        title: "File Validation Error",
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
        title: "Error",
        description: "Please select at least one file to upload",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const result = await documentApi.uploadDocument(files, title, description, autoDelete)

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (result.success) {
        setUploadComplete(true)
        toast({
          title: "Success",
          description: result.message,
        })

        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        toast({
          title: "Upload Failed",
          description: result.message,
          variant: "destructive",
        })
        setIsUploading(false)
        setUploadProgress(0)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred during upload",
        variant: "destructive",
      })
      setIsUploading(false)
      setUploadProgress(0)
    }
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
                          <p className="text-xs sm:text-sm text-gray-600">{utils.formatFileSize(file.size)}</p>
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
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-sm sm:text-base">
                    Document Title (Optional)
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Service Agreement - Company Name"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isUploading}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm sm:text-base">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Add any context or specific areas you'd like us to focus on..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    disabled={isUploading}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Privacy Options */}
              <div className="space-y-4 p-3 sm:p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Privacy & Security</h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Your documents are encrypted and processed securely
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="auto-delete"
                    checked={autoDelete}
                    onCheckedChange={(checked) => setAutoDelete(checked as boolean)}
                    disabled={isUploading}
                    className="mt-0.5"
                  />
                  <Label htmlFor="auto-delete" className="text-xs sm:text-sm leading-relaxed">
                    Auto-delete document after analysis (recommended for sensitive documents)
                  </Label>
                </div>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {uploadComplete ? "Analysis complete!" : "Uploading and analyzing..."}
                    </span>
                    <span className="text-sm text-gray-600">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                  {uploadComplete && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Upload successful! Redirecting to dashboard...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isUploading}
                    className="w-full sm:w-auto bg-transparent"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>

                <Button
                  type="submit"
                  disabled={files.length === 0 || isUploading}
                  className="w-full sm:w-auto min-w-[140px]"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {uploadProgress < 90 ? "Uploading..." : "Analyzing..."}
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Start Analysis
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 sm:mt-8">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-900 text-sm sm:text-base">What You'll Get</h3>
                  <ul className="text-xs sm:text-sm text-green-800 mt-1 space-y-1">
                    <li>• Plain English summary</li>
                    <li>• Risk assessment</li>
                    <li>• Key clause identification</li>
                    <li>• Expert questions to ask</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 text-sm sm:text-base">Processing Time</h3>
                  <p className="text-xs sm:text-sm text-blue-800 mt-1">
                    Most documents are analyzed within 2-5 minutes. Complex documents may take longer.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
