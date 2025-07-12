"use client"

import { useState, useEffect } from "react"
import { Activity, AlertTriangle, CheckCircle, Clock, Heart, Server, Wifi, Zap, DollarSign, MessageCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface EndpointStatus {
  name: string
  url: string
  status: 'online' | 'offline' | 'slow' | 'checking'
  latency: number
  lastCheck: string
  uptime: number
}

export default function StatusPage() {
  const [endpoints, setEndpoints] = useState<EndpointStatus[]>([
    {
      name: "LegalLens API",
      url: "https://amit098-legal-lens.hf.space",
      status: 'checking',
      latency: 0,
      lastCheck: '',
      uptime: 0
    },
    {
      name: "Local Ping API",
      url: "/api/ping",
      status: 'checking',
      latency: 0,
      lastCheck: '',
      uptime: 0
    }
  ])
  const [overallStatus, setOverallStatus] = useState<'operational' | 'degraded' | 'down'>('operational')
  const [lastUpdated, setLastUpdated] = useState<string>('')

  const checkEndpoint = async (endpoint: EndpointStatus): Promise<EndpointStatus> => {
    const startTime = Date.now()
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      // Add authorization headers for Hugging Face API
      if (endpoint.url.includes('hf.space')) {
        headers['Authorization'] = 'Bearer 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'
        headers['api-key'] = 'amit123'
      }
      
      const response = await fetch(endpoint.url, {
        method: 'GET',
        headers,
        // Add timeout for external API
        signal: AbortSignal.timeout(endpoint.url.includes('hf.space') ? 10000 : 5000)
      })
      
      const endTime = Date.now()
      const latency = endTime - startTime
      
      if (response.ok) {
        const data = await response.json()
        return {
          ...endpoint,
          status: latency > 2000 ? 'slow' : 'online',
          latency,
          lastCheck: new Date().toISOString(),
          uptime: data.uptime || 0
        }
      } else {
        return {
          ...endpoint,
          status: 'offline',
          latency: 0,
          lastCheck: new Date().toISOString(),
          uptime: 0
        }
      }
    } catch (error) {
      return {
        ...endpoint,
        status: 'offline',
        latency: 0,
        lastCheck: new Date().toISOString(),
        uptime: 0
      }
    }
  }

  const checkAllEndpoints = async () => {
    const updatedEndpoints = await Promise.all(
      endpoints.map(endpoint => checkEndpoint(endpoint))
    )
    
    setEndpoints(updatedEndpoints)
    setLastUpdated(new Date().toLocaleString())
    
    // Determine overall status
    const offlineCount = updatedEndpoints.filter(e => e.status === 'offline').length
    const slowCount = updatedEndpoints.filter(e => e.status === 'slow').length
    
    if (offlineCount > 0) {
      setOverallStatus('down')
    } else if (slowCount > 0) {
      setOverallStatus('degraded')
    } else {
      setOverallStatus('operational')
    }
  }

  useEffect(() => {
    checkAllEndpoints()
    
    // Check every 30 seconds
    const interval = setInterval(checkAllEndpoints, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'slow':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'offline':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4" />
      case 'slow':
        return <Clock className="h-4 w-4" />
      case 'offline':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getOverallStatusIcon = () => {
    switch (overallStatus) {
      case 'operational':
        return <CheckCircle className="h-8 w-8 text-green-600" />
      case 'degraded':
        return <AlertTriangle className="h-8 w-8 text-yellow-600" />
      case 'down':
        return <AlertTriangle className="h-8 w-8 text-red-600" />
    }
  }

  const getOverallStatusText = () => {
    switch (overallStatus) {
      case 'operational':
        return 'All Systems Operational'
      case 'degraded':
        return 'Partial System Outage'
      case 'down':
        return 'Major System Outage'
    }
  }

  const getOverallStatusColor = () => {
    switch (overallStatus) {
      case 'operational':
        return 'text-green-600'
      case 'degraded':
        return 'text-yellow-600'
      case 'down':
        return 'text-red-600'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <img
              src="/logo.png"
              alt="LegalLens AI Logo"
              className="h-10 sm:h-12 w-auto object-contain"
            />
            <span className="text-xl sm:text-3xl font-bold text-gray-900">LegalLens AI</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Overall Status */}
        <div className="mb-8">
          <Card className="border-2">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                {getOverallStatusIcon()}
              </div>
              <CardTitle className={`text-2xl font-bold ${getOverallStatusColor()}`}>
                {getOverallStatusText()}
              </CardTitle>
              <CardDescription>
                Last updated: {lastUpdated || 'Checking...'}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Endpoints Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {endpoints.map((endpoint, index) => (
            <Card key={index} className="border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Server className="h-5 w-5 text-gray-600" />
                    <CardTitle className="text-lg">{endpoint.name}</CardTitle>
                  </div>
                  <Badge className={getStatusColor(endpoint.status)}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(endpoint.status)}
                      <span className="capitalize">{endpoint.status}</span>
                    </div>
                  </Badge>
                </div>
                <CardDescription className="text-sm text-gray-500">
                  {endpoint.url}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Latency:</span>
                    <span className="font-mono text-sm">
                      {endpoint.latency > 0 ? `${endpoint.latency}ms` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Check:</span>
                    <span className="text-sm text-gray-500">
                      {endpoint.lastCheck ? new Date(endpoint.lastCheck).toLocaleTimeString() : 'Never'}
                    </span>
                  </div>
                  {endpoint.uptime > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Uptime:</span>
                      <span className="font-mono text-sm">
                        {Math.floor(endpoint.uptime / 3600)}h {Math.floor((endpoint.uptime % 3600) / 60)}m
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Manual Refresh */}
        <div className="text-center mb-8">
          <Button onClick={checkAllEndpoints} className="bg-blue-600 hover:bg-blue-700">
            <Zap className="h-4 w-4 mr-2" />
            Refresh Status
          </Button>
        </div>

        {/* Support Section - Show when there are issues */}
        {(overallStatus === 'degraded' || overallStatus === 'down') && (
          <Card className="border-2 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center text-yellow-800">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Service Issues Detected
              </CardTitle>
              <CardDescription className="text-yellow-700">
                We're experiencing some technical difficulties. Your support helps us maintain and improve our services.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/support">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Get Support
                  </Button>
                </Link>
                <Link href="/support">
                  <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Donate for Better Servers
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Information */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Environment:</span>
                  <span className="ml-2 font-mono">Production</span>
                </div>
                <div>
                  <span className="text-gray-600">Monitoring:</span>
                  <span className="ml-2">Real-time</span>
                </div>
                <div>
                  <span className="text-gray-600">Update Interval:</span>
                  <span className="ml-2">30 seconds</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 