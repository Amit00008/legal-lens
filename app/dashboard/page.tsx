"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Upload,
  FileText,
  Search,
  MoreHorizontal,
  Download,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  Star,
  Copy,
  Tag,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Zap,
  TrendingUp,
  Calendar,
  FileCheck,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { documentApi, userApi, analysisApi } from "@/lib/api"
import { type Document as SupabaseDocument } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ContextMenu {
  x: number
  y: number
  documentId: string
  visible: boolean
}

interface DeleteModal {
  isOpen: boolean
  document: SupabaseDocument | null
  isDeleting: boolean
  isBulkDelete: boolean
  selectedDocuments: SupabaseDocument[]
}

// LocalStorage keys
const FAVORITES_STORAGE_KEY = "legallens-favorites"

// Utility functions for localStorage
const getFavoritesFromStorage = (): Set<string> => {
  if (typeof window === "undefined") return new Set()
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY)
    if (stored) {
      const favorites = JSON.parse(stored)
      return new Set(favorites)
    }
  } catch (error) {
    console.error("Error reading favorites from localStorage:", error)
  }
  return new Set()
}

const saveFavoritesToStorage = (favorites: Set<string>) => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(favorites)))
  } catch (error) {
    console.error("Error saving favorites to localStorage:", error)
  }
}

export const clearFavoritesFromStorage = () => {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(FAVORITES_STORAGE_KEY)
  } catch (error) {
    console.error("Error clearing favorites from localStorage:", error)
  }
}

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [documents, setDocuments] = useState<SupabaseDocument[]>([])
  const [userStats, setUserStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [sortBy, setSortBy] = useState<"date" | "title" | "risk">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [favoriteDocuments, setFavoriteDocuments] = useState<Set<string>>(new Set())
  const [contextMenu, setContextMenu] = useState<ContextMenu>({ x: 0, y: 0, documentId: "", visible: false })
  const [hoveredDocument, setHoveredDocument] = useState<string | null>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)
  const [deleteModal, setDeleteModal] = useState<DeleteModal>({ isOpen: false, document: null, isDeleting: false, isBulkDelete: false, selectedDocuments: [] })
  const [downloadingReports, setDownloadingReports] = useState<Set<string>>(new Set())

  const { user, loading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // Auth protection - redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?redirectTo=/dashboard")
    }
  }, [user, loading, router])

  // Load favorites from localStorage on component mount
  useEffect(() => {
    const storedFavorites = getFavoritesFromStorage()
    setFavoriteDocuments(storedFavorites)
  }, [])

  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    saveFavoritesToStorage(favoriteDocuments)
  }, [favoriteDocuments])

  // Load initial data
  useEffect(() => {
    if (user) loadDashboardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== "") {
        handleSearch()
      } else {
        loadDocuments()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "k":
            e.preventDefault()
            document.getElementById("search-input")?.focus()
            break
          case "u":
            e.preventDefault()
            window.location.href = "/upload"
            break
          case "a":
            e.preventDefault()
            if (selectedDocuments.size === documents.length) {
              setSelectedDocuments(new Set())
            } else {
              setSelectedDocuments(new Set(documents.map((d) => d.id)))
            }
            break
        }
      }
      if (e.key === "Escape") {
        setSelectedDocuments(new Set())
        setContextMenu((prev) => ({ ...prev, visible: false }))
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [documents, selectedDocuments])

  // Handle click outside context menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu((prev) => ({ ...prev, visible: false }))
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      if (!user) {
        toast({ title: "Error", description: "User not loaded.", variant: "destructive" })
        setIsLoading(false)
        return
      }
      const [documentsData, statsData] = await Promise.all([
        documentApi.getDocuments(user.id),
        userApi.getUserStats(user.id)
      ])
      setDocuments(documentsData)
      setUserStats(statsData)
    
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadDocuments = async () => {
    try {
      if (!user) return
      const documentsData = await documentApi.getDocuments(user.id)
      setDocuments(documentsData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      })
    }
  }

  const handleSearch = async () => {
    setIsSearching(true)
    try {
      if (!user) return
      const results = await documentApi.getDocuments(user.id, searchTerm)
      setDocuments(results)
    } catch (error) {
      toast({
        title: "Error",
        description: "Search failed",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleDeleteDocument = async (id: string, skipConfirmation = false) => {
    // Get document details for confirmation
    const document = documents.find(doc => doc.id === id)
    if (!document) {
      toast({
        title: "Error",
        description: "Document not found",
        variant: "destructive",
      })
      return
    }

    // Show confirmation dialog unless skipped
    if (!skipConfirmation) {
      setDeleteModal({ isOpen: true, document, isDeleting: false, isBulkDelete: false, selectedDocuments: [] })
      return
    }

    setDeletingId(id)
    try {
      toast({
        title: "Deleting...",
        description: `Deleting "${document.title}" and all associated files...`,
      })

      const result = await documentApi.deleteDocument(id)
      if (result.success) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== id))
        setSelectedDocuments((prev) => {
          const newSet = new Set(prev)
          newSet.delete(id)
          return newSet
        })
        // Remove from favorites if it was favorited
        setFavoriteDocuments((prev) => {
          const newSet = new Set(prev)
          newSet.delete(id)
          return newSet
        })
        toast({
          title: "Success",
          description: `"${document.title}" has been permanently deleted`,
        })
        // Refresh stats
        if (user) {
          const statsData = await userApi.getUserStats(user.id)
          setUserStats(statsData)
        }
      } else {
        toast({
          title: "❌ Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: "❌ Error",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleShareDocument = async (documentId: string) => {
    try {
      const result = await analysisApi.shareAnalysis(documentId)
      if (result.success && result.shareUrl) {
        await navigator.clipboard.writeText(result.shareUrl)
        toast({
          title: "🔗 Success",
          description: "Share link copied to clipboard",
        })
      } else {
        toast({
          title: "❌ Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to generate share link",
        variant: "destructive",
      })
    }
  }

  const handleDownloadReport = async (id: string) => {
    try {
      setDownloadingReports(prev => new Set(prev).add(id))
      
      const result = await documentApi.downloadReport(id, false) // Don't save to blob for now
      
      if (result.success && result.pdfData) {
        // Create download link
        const link = document.createElement('a')
        link.href = result.pdfData
        link.download = result.fileName || 'legal-analysis-report.pdf'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        toast({
          title: "Success",
          description: "Report downloaded successfully",
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
      setDownloadingReports(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const handleRightClick = (e: React.MouseEvent, documentId: string) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      documentId,
      visible: true,
    })
  }

  const handleContextMenuAction = (action: string, documentId: string) => {
    setContextMenu((prev) => ({ ...prev, visible: false }))

    switch (action) {
      case "view":
        window.location.href = `/analysis/${documentId}`
        break
      case "download":
        handleDownloadReport(documentId)
        break
      case "delete":
        handleDeleteDocument(documentId)
        break
      case "favorite":
        toggleFavorite(documentId)
        break
      case "copy":
        handleShareDocument(documentId)
        break
      case "duplicate":
        toast({ title: "Info", description: "Duplicate feature coming soon!" })
        break
    }
  }

  const toggleFavorite = (id: string) => {
    setFavoriteDocuments((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
        toast({ title: "Removed from favorites" })
      } else {
        newSet.add(id)
        toast({ title: "Added to favorites" })
      }
      return newSet
    })
  }

  const toggleDocumentSelection = (id: string) => {
    setSelectedDocuments((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleBulkDelete = async () => {
    if (selectedDocuments.size === 0) return

    const selectedDocs = documents.filter(doc => selectedDocuments.has(doc.id))
    setDeleteModal({ 
      isOpen: true, 
      document: null, 
      isDeleting: false, 
      isBulkDelete: true, 
      selectedDocuments: selectedDocs 
    })
  }

  const handleModalDelete = async () => {
    if (deleteModal.isBulkDelete) {
      // Handle bulk delete
      setDeleteModal({ ...deleteModal, isDeleting: true })
      try {
        let successCount = 0
        let errorCount = 0

        for (const doc of deleteModal.selectedDocuments) {
          try {
            const result = await documentApi.deleteDocument(doc.id)
            if (result.success) {
              successCount++
            } else {
              errorCount++
              console.error(`Failed to delete document ${doc.id}:`, result.message)
            }
          } catch (error) {
            errorCount++
            console.error(`Error deleting document ${doc.id}:`, error)
          }
        }

        // Update UI
        setDocuments((prev) => prev.filter((doc) => !selectedDocuments.has(doc.id)))
        setSelectedDocuments(new Set())
        setFavoriteDocuments((prev) => {
          const newSet = new Set(prev)
          selectedDocuments.forEach(id => newSet.delete(id))
          return newSet
        })

        // Refresh stats
        if (user) {
          const statsData = await userApi.getUserStats(user.id)
          setUserStats(statsData)
        }

        // Show results
        if (successCount > 0 && errorCount === 0) {
          toast({
            title: "Success",
            description: `Successfully deleted ${successCount} document(s)`,
          })
        } else if (successCount > 0 && errorCount > 0) {
          toast({
            title: "Partial Success",
            description: `Deleted ${successCount} document(s), ${errorCount} failed`,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error",
            description: `Failed to delete ${errorCount} document(s)`,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Bulk delete error:', error)
        toast({
          title: "Error",
          description: "Failed to delete documents. Please try again.",
          variant: "destructive",
        })
      } finally {
        setDeleteModal({ isOpen: false, document: null, isDeleting: false, isBulkDelete: false, selectedDocuments: [] })
      }
    } else {
      // Handle single delete
      if (!deleteModal.document) return

      setDeleteModal({ ...deleteModal, isDeleting: true })
      try {
        const result = await documentApi.deleteDocument(deleteModal.document.id)
        if (result.success) {
          setDocuments((prev) => prev.filter((doc) => doc.id !== deleteModal.document!.id))
          setSelectedDocuments((prev) => {
            const newSet = new Set(prev)
            newSet.delete(deleteModal.document!.id)
            return newSet
          })
          setFavoriteDocuments((prev) => {
            const newSet = new Set(prev)
            newSet.delete(deleteModal.document!.id)
            return newSet
          })
          toast({
            title: "Success",
            description: `"${deleteModal.document.title}" has been permanently deleted`,
          })
          if (user) {
            const statsData = await userApi.getUserStats(user.id)
            setUserStats(statsData)
          }
        } else {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Delete error:', error)
        toast({
          title: "Error",
          description: "Failed to delete document. Please try again.",
          variant: "destructive",
        })
      } finally {
        setDeleteModal({ isOpen: false, document: null, isDeleting: false, isBulkDelete: false, selectedDocuments: [] })
      }
    }
  }

  const handleModalOpenChange = (open: boolean) => {
    if (!open) {
      setDeleteModal({ isOpen: false, document: null, isDeleting: false, isBulkDelete: false, selectedDocuments: [] })
    }
  }

  const sortedDocuments = [...documents].sort((a, b) => {
    let comparison = 0
    switch (sortBy) {
      case "title":
        comparison = a.title.localeCompare(b.title)
        break
      case "date":
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        break
      case "risk":
        // Risk sorting removed: risk_level not present in Document type
        comparison = 0;
        break

    }
    return sortOrder === "asc" ? comparison : -comparison
  })

  // Get favorite documents that exist in current documents
  const favoriteDocumentsList = documents.filter((doc) => favoriteDocuments.has(doc.id))

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
            <CheckCircle className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Completed</span>
            <span className="sm:hidden">Done</span>
          </Badge>
        )
      case "processing":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-xs">
            <Clock className="w-3 h-3 mr-1 animate-spin" />
            <span className="hidden sm:inline">Processing</span>
            <span className="sm:hidden">...</span>
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive" className="text-xs">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            {status}
          </Badge>
        )
    }
  }


  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="container mx-auto px-4 py-4 sm:py-8">
          {/* Welcome Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 flex items-center">
                  <span className="truncate">
                    Welcome back, {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"}!
                  </span>
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 ml-2 text-yellow-500 flex-shrink-0" />
                </h1>
                <p className="text-sm sm:text-base text-gray-600">Manage your legal document analyses and insights</p>
              </div>
              <div className="hidden lg:block text-right text-sm text-gray-500">
                <p>
                  💡 Press <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl+K</kbd> to search
                </p>
                <p>
                  💡 Press <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl+U</kbd> to upload
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium">Total Documents</CardTitle>
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="text-lg sm:text-2xl font-bold">{userStats?.totalDocuments || 0}</div>
                <p className="text-xs text-gray-600 flex items-center">
                  <TrendingUp className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                  <span className="hidden sm:inline">+{userStats?.monthlyGrowth || 0} from last month</span>
                  <span className="sm:hidden">+{userStats?.monthlyGrowth || 0}</span>
                </p>
              </CardContent>
            </Card>


            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="text-lg sm:text-2xl font-bold text-green-600">{userStats?.completedDocuments || 0}</div>
                <p className="text-xs text-gray-600">
                  <span className="hidden sm:inline">Ready for review</span>
                  <span className="sm:hidden">Ready</span>
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium">Processing</CardTitle>
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600 group-hover:animate-spin" />
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="text-lg sm:text-2xl font-bold text-yellow-600">
                  {userStats?.processingDocuments || 0}
                </div>
                <p className="text-xs text-gray-600">In progress</p>
              </CardContent>
            </Card>
          </div>

          {/* Favorite Documents - Only show if there are favorites */}
          {favoriteDocumentsList.length > 0 && (
            <Card className="mb-4 sm:mb-6 border-yellow-200 bg-yellow-50">
              <CardHeader className="pb-3 p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg flex items-center">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-yellow-600" />
                  <span className="hidden sm:inline">Favorite Documents ({favoriteDocumentsList.length})</span>
                  <span className="sm:hidden">Favorites ({favoriteDocumentsList.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="flex flex-wrap gap-2">
                  {favoriteDocumentsList.slice(0, 3).map((doc) => (
                    <Link key={doc.id} href={`/analysis/${doc.id}`}>
                      <Badge variant="outline" className="hover:bg-yellow-100 cursor-pointer text-xs">
                        <FileCheck className="w-3 h-3 mr-1" />
                        <span className="truncate max-w-[120px] sm:max-w-none">
                          {doc.title.length > 20 ? `${doc.title.substring(0, 20)}...` : doc.title}
                        </span>
                      </Badge>
                    </Link>
                  ))}
                  {favoriteDocumentsList.length > 3 && (
                    <Badge variant="outline" className="text-yellow-700 text-xs">
                      +{favoriteDocumentsList.length - 3} more
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents Section */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Your Documents</CardTitle>
                  <CardDescription className="text-sm">Manage and review your analyzed legal documents</CardDescription>
                </div>

                {/* Mobile Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
                  {selectedDocuments.size > 0 && (
                    <div className="flex items-center justify-between sm:justify-start space-x-2 p-2 sm:p-0 bg-blue-50 sm:bg-transparent rounded sm:rounded-none">
                      <span className="text-sm text-gray-600">{selectedDocuments.size} selected</span>
                      <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                        <Trash2 className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Delete Selected</span>
                        <span className="sm:hidden">Delete</span>
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
                          className="hidden sm:flex"
                        >
                          {viewMode === "list" ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Switch to {viewMode === "list" ? "grid" : "list"} view</TooltipContent>
                    </Tooltip>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          {sortOrder === "asc" ? (
                            <SortAsc className="w-4 h-4 mr-1" />
                          ) : (
                            <SortDesc className="w-4 h-4 mr-1" />
                          )}
                          <span className="hidden sm:inline">Sort</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setSortBy("date")}>
                          <Calendar className="w-4 h-4 mr-2" />
                          Date {sortBy === "date" && "✓"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortBy("title")}>
                          <FileText className="w-4 h-4 mr-2" />
                          Title {sortBy === "title" && "✓"}
                        </DropdownMenuItem>
                      
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                          {sortOrder === "asc" ? (
                            <SortDesc className="w-4 h-4 mr-2" />
                          ) : (
                            <SortAsc className="w-4 h-4 mr-2" />
                          )}
                          {sortOrder === "asc" ? "Descending" : "Ascending"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Link href="/upload" className="flex-1 sm:flex-none">
                      <Button className="w-full sm:w-auto">
                        <Upload className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Upload Document</span>
                        <span className="sm:hidden">Upload</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                {isSearching && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />}
                <Input
                  id="search-input"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-3 sm:space-y-4">
                {sortedDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className={`border rounded-lg p-3 sm:p-4 transition-all duration-200 cursor-pointer ${
                      selectedDocuments.has(doc.id)
                        ? "bg-blue-50 border-blue-300 shadow-md"
                        : hoveredDocument === doc.id
                          ? "bg-gray-50 shadow-md border-gray-300"
                          : "hover:bg-gray-50 hover:shadow-sm"
                    }`}
                    onContextMenu={(e) => handleRightClick(e, doc.id)}
                    onMouseEnter={() => setHoveredDocument(doc.id)}
                    onMouseLeave={() => setHoveredDocument(null)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <Checkbox
                          checked={selectedDocuments.has(doc.id)}
                          onCheckedChange={() => toggleDocumentSelection(doc.id)}
                          className="mt-1 flex-shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors text-sm sm:text-base truncate">
                              {doc.title}
                            </h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              {favoriteDocuments.has(doc.id) && (
                                <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                              )}
                              {getStatusBadge(doc.status)}
                              {/* Risk badge removed: risk_level not present in Document type */}
                            </div>
                          </div>

                          {/* Summary removed: not present in Document type */}

                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {doc.created_at}
                            </span>
                            {/* Categories and file size fields removed: not present in Document type */}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(doc.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 sm:p-2"
                            >
                              <Star
                                className={`h-3 w-3 sm:h-4 sm:w-4 ${favoriteDocuments.has(doc.id) ? "text-yellow-500 fill-current" : "text-gray-400"}`}
                              />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {favoriteDocuments.has(doc.id) ? "Remove from favorites" : "Add to favorites"}
                          </TooltipContent>
                        </Tooltip>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={deletingId === doc.id} className="p-1 sm:p-2">
                              {deletingId === doc.id ? (
                                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/analysis/${doc.id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Analysis
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDownloadReport(doc.id)}
                              disabled={doc.status !== "completed" || downloadingReports.has(doc.id)}
                            >
                              {downloadingReports.has(doc.id) ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Download className="w-4 h-4 mr-2" />
                              )}
                              {downloadingReports.has(doc.id) ? "Generating..." : "Download Report"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleFavorite(doc.id)}>
                              <Star className="w-4 h-4 mr-2" />
                              {favoriteDocuments.has(doc.id) ? "Remove from Favorites" : "Add to Favorites"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleShareDocument(doc.id)}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Link
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteDocument(doc.id)}
                              disabled={deletingId === doc.id}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}

                {sortedDocuments.length === 0 && !isSearching && (
                  <div className="text-center py-8 sm:py-12">
                    <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No documents found</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4">
                      {searchTerm
                        ? "Try adjusting your search terms"
                        : "Upload your first legal document to get started"}
                    </p>
                    <Link href="/upload">
                      <Button>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Document
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Context Menu */}
        {contextMenu.visible && (
          <div
            ref={contextMenuRef}
            className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 min-w-[180px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center text-sm"
              onClick={() => handleContextMenuAction("view", contextMenu.documentId)}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Analysis
            </button>
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center text-sm"
              onClick={() => handleContextMenuAction("download", contextMenu.documentId)}
              disabled={downloadingReports.has(contextMenu.documentId)}
            >
              {downloadingReports.has(contextMenu.documentId) ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {downloadingReports.has(contextMenu.documentId) ? "Generating..." : "Download Report"}
            </button>
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center text-sm"
              onClick={() => handleContextMenuAction("favorite", contextMenu.documentId)}
            >
              <Star className="w-4 h-4 mr-2" />
              {favoriteDocuments.has(contextMenu.documentId) ? "Remove from Favorites" : "Add to Favorites"}
            </button>
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center text-sm"
              onClick={() => handleContextMenuAction("copy", contextMenu.documentId)}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </button>
            
            <hr className="my-1" />
            <button
              className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center text-sm text-red-600"
              onClick={() => handleContextMenuAction("delete", contextMenu.documentId)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Dialog 
          open={deleteModal.isOpen} 
          onOpenChange={handleModalOpenChange}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span>
                  {deleteModal.isBulkDelete 
                    ? `Delete ${deleteModal.selectedDocuments.length} Documents` 
                    : 'Confirm Deletion'
                  }
                </span>
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                {deleteModal.isBulkDelete ? (
                  <>
                    Are you sure you want to delete <strong>{deleteModal.selectedDocuments.length} selected document(s)</strong>?
                  </>
                ) : (
                  <>
                    Are you sure you want to delete <strong>"{deleteModal.document?.title}"</strong>?
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {deleteModal.isBulkDelete && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="text-yellow-800 font-semibold text-sm mb-2">Selected Documents:</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {deleteModal.selectedDocuments.map((doc, index) => (
                      <div key={doc.id} className="flex items-center text-yellow-700 text-sm">
                        <FileText className="h-3 w-3 mr-2 flex-shrink-0" />
                        <span className="truncate">{doc.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="text-red-800 font-semibold text-sm mb-2">This will permanently delete:</h4>
                <ul className="text-red-700 text-sm space-y-1">
                  <li className="flex items-center">
                    <Trash2 className="h-3 w-3 mr-2" />
                    {deleteModal.isBulkDelete ? 'All PDF files from storage' : 'The PDF file from storage'}
                  </li>
                  <li className="flex items-center">
                    <Trash2 className="h-3 w-3 mr-2" />
                    {deleteModal.isBulkDelete ? 'All analysis results' : 'All analysis results'}
                  </li>
                  <li className="flex items-center">
                    <Trash2 className="h-3 w-3 mr-2" />
                    {deleteModal.isBulkDelete ? 'All document records' : 'The document record'}
                  </li>
                </ul>
                <p className="text-red-600 text-xs mt-2 font-medium">This action cannot be undone.</p>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={() => setDeleteModal({ isOpen: false, document: null, isDeleting: false, isBulkDelete: false, selectedDocuments: [] })}
                disabled={deleteModal.isDeleting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleModalDelete}
                disabled={deleteModal.isDeleting}
                className="w-full sm:w-auto"
              >
                {deleteModal.isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {deleteModal.isBulkDelete ? 'Deleting...' : 'Deleting...'}
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deleteModal.isBulkDelete ? `Delete ${deleteModal.selectedDocuments.length} Documents` : 'Delete Document'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
