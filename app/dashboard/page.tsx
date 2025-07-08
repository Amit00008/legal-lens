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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { documentApi, userApi, type Document, type UserStats, utils } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ContextMenu {
  x: number
  y: number
  documentId: number
  visible: boolean
}

// LocalStorage keys
const FAVORITES_STORAGE_KEY = "legallens-favorites"

// Utility functions for localStorage
const getFavoritesFromStorage = (): Set<number> => {
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

const saveFavoritesToStorage = (favorites: Set<number>) => {
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
  const [documents, setDocuments] = useState<Document[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [selectedDocuments, setSelectedDocuments] = useState<Set<number>>(new Set())
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [sortBy, setSortBy] = useState<"date" | "title" | "risk">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [favoriteDocuments, setFavoriteDocuments] = useState<Set<number>>(new Set())
  const [contextMenu, setContextMenu] = useState<ContextMenu>({ x: 0, y: 0, documentId: 0, visible: false })
  const [hoveredDocument, setHoveredDocument] = useState<number | null>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)

  const { user } = useAuth()
  const { toast } = useToast()

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
    loadDashboardData()
  }, [])

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
      const [documentsData, statsData] = await Promise.all([documentApi.getDocuments(), userApi.getUserStats()])

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
      const documentsData = await documentApi.getDocuments()
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
      const results = await documentApi.getDocuments(searchTerm)
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

  const handleDeleteDocument = async (id: number) => {
    setDeletingId(id)
    try {
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
          description: result.message,
        })
        // Refresh stats
        const statsData = await userApi.getUserStats()
        setUserStats(statsData)
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
        description: "Failed to delete document",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleDownloadReport = async (id: number) => {
    try {
      const result = await documentApi.downloadReport(id)
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
    }
  }

  const handleRightClick = (e: React.MouseEvent, documentId: number) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      documentId,
      visible: true,
    })
  }

  const handleContextMenuAction = (action: string, documentId: number) => {
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
        navigator.clipboard.writeText(`${window.location.origin}/analysis/${documentId}`)
        toast({ title: "Success", description: "Link copied to clipboard" })
        break
      case "duplicate":
        toast({ title: "Info", description: "Duplicate feature coming soon!" })
        break
    }
  }

  const toggleFavorite = (id: number) => {
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

  const toggleDocumentSelection = (id: number) => {
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

    const confirmDelete = window.confirm(`Delete ${selectedDocuments.size} selected documents?`)
    if (!confirmDelete) return

    for (const id of selectedDocuments) {
      await handleDeleteDocument(id)
    }
    setSelectedDocuments(new Set())
  }

  const sortedDocuments = [...documents].sort((a, b) => {
    let comparison = 0
    switch (sortBy) {
      case "title":
        comparison = a.title.localeCompare(b.title)
        break
      case "date":
        comparison = new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()
        break
      case "risk":
        const riskOrder = { low: 0, medium: 1, high: 2 }
        comparison = riskOrder[a.riskLevel] - riskOrder[b.riskLevel]
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

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "high":
        return (
          <Badge variant="destructive" className="text-xs">
            High Risk
          </Badge>
        )
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-xs">Medium Risk</Badge>
      case "low":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">Low Risk</Badge>
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            {risk}
          </Badge>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-4 sm:py-8">
          <div className="animate-pulse">
            <div className="h-6 sm:h-8 bg-gray-200 rounded w-2/3 sm:w-1/3 mb-2"></div>
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2 sm:w-1/4 mb-6 sm:mb-8"></div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 sm:h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-64 sm:h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
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
                <CardTitle className="text-xs sm:text-sm font-medium">High Risk</CardTitle>
                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 group-hover:animate-pulse" />
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="text-lg sm:text-2xl font-bold text-red-600">{userStats?.highRiskDocuments || 0}</div>
                <p className="text-xs text-gray-600">
                  <span className="hidden sm:inline">Requires attention</span>
                  <span className="sm:hidden">Attention</span>
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
                        <DropdownMenuItem onClick={() => setSortBy("risk")}>
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Risk Level {sortBy === "risk" && "✓"}
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
                              {getRiskBadge(doc.riskLevel)}
                            </div>
                          </div>

                          <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">{doc.summary}</p>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {utils.formatDate(doc.uploadDate)}
                            </span>
                            {doc.fileSize && (
                              <span className="flex items-center">
                                <FileText className="w-3 h-3 mr-1" />
                                {utils.formatFileSize(doc.fileSize)}
                              </span>
                            )}
                            <div className="flex items-center space-x-1 flex-wrap">
                              <Tag className="w-3 h-3 flex-shrink-0" />
                              <span className="hidden sm:inline">Categories:</span>
                              <span className="sm:hidden">Tags:</span>
                              {doc.categories.slice(0, 1).map((category, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {category}
                                </Badge>
                              ))}
                              {doc.categories.length > 1 && (
                                <Badge variant="outline" className="text-xs">
                                  +{doc.categories.length - 1}
                                </Badge>
                              )}
                            </div>
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
                              disabled={doc.status !== "completed"}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download Report
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleFavorite(doc.id)}>
                              <Star className="w-4 h-4 mr-2" />
                              {favoriteDocuments.has(doc.id) ? "Remove from Favorites" : "Add to Favorites"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/analysis/${doc.id}`)
                                toast({ title: "Success", description: "Link copied to clipboard" })
                              }}
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
            >
              <Download className="w-4 h-4 mr-2" />
              Download Report
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
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center text-sm"
              onClick={() => handleContextMenuAction("duplicate", contextMenu.documentId)}
            >
              <FileText className="w-4 h-4 mr-2" />
              Duplicate
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
      </div>
    </TooltipProvider>
  )
}
