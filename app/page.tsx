"use client"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, FileText, Brain, Users, Upload, Search, Download, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { useAuth } from "@/components/auth-provider"

export default function HomePage() {
  const { user, loading } = useAuth()

  const HeroSection = () => {
    if (loading) {
      return (
        <section className="py-20 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-6"></div>
              <div className="h-16 bg-gray-200 rounded w-full mb-6"></div>
              <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto mb-8"></div>
              <div className="flex justify-center gap-4">
                <div className="h-12 bg-gray-200 rounded w-48"></div>
                <div className="h-12 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </div>
        </section>
      )
    }

    if (user) {
      return (
        <section className="py-20 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-100">
              Welcome back, {user.user_metadata?.full_name || user.email?.split("@")[0]}!
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Ready to analyze your next <span className="text-blue-600">legal document</span>?
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Upload contracts, agreements, and legal documents to get instant AI-powered analysis, risk detection, and
              expert insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/upload">
                <Button size="lg" className="text-lg px-8 py-3">
                  <Upload className="mr-2 h-5 w-5" />
                  Upload New Document
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="text-lg px-8 py-3 bg-transparent">
                  <ArrowRight className="mr-2 h-5 w-5" />
                  View Dashboard
                </Button>
              </Link>
            </div>

            {/* Quick Stats for Logged In Users */}
            <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-2xl mx-auto">
              <Card className="border-0 shadow-lg">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold">4</CardTitle>
                  <CardDescription>Documents Analyzed</CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold">3</CardTitle>
                  <CardDescription>Completed Reviews</CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Brain className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold">12</CardTitle>
                  <CardDescription>AI Insights Generated</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>
      )
    }

    return (
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">AI-Powered Legal Document Analysis</Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Understand Legal Documents with <span className="text-blue-600">AI Clarity</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Upload contracts, terms of service, and agreements to get instant AI-powered summaries, risk detection, and
            expert insights. Make informed decisions before you sign.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 py-3">
                <Upload className="mr-2 h-5 w-5" />
                Analyze Your First Document
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3 bg-transparent">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />

      <HeroSection />

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features for Legal Clarity</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI analyzes legal documents to provide you with the insights you need
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Brain className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>AI-Powered Summarization</CardTitle>
                <CardDescription>
                  Get clear, concise summaries of complex legal documents in plain English
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Search className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle>Risk Detection</CardTitle>
                <CardDescription>
                  Automatically identify potentially problematic clauses and uncommon terms
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <FileText className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Smart Categorization</CardTitle>
                <CardDescription>Documents are automatically organized by legal topics and sections</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Expert Questions</CardTitle>
                <CardDescription>
                  Get AI-generated questions to ask legal professionals for deeper review
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>Your documents are encrypted and can be auto-deleted after analysis</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Download className="h-12 w-12 text-teal-600 mb-4" />
                <CardTitle>PDF Reports</CardTitle>
                <CardDescription>Download comprehensive analysis reports for your records</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How LegalLens AI Works</h2>
            <p className="text-xl text-gray-600">Simple, fast, and secure document analysis in three steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Document</h3>
              <p className="text-gray-600">Securely upload your legal document (PDF, DOCX) to our encrypted platform</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
              <p className="text-gray-600">Our AI analyzes the document for key terms, risks, and important clauses</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Insights</h3>
              <p className="text-gray-600">
                Receive a comprehensive report with summaries, risks, and expert questions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Perfect for Everyone</h2>
          <p className="text-xl text-gray-600 mb-12">Whether you're a freelancer, startup, or established business</p>

          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Freelancers</h3>
              <p className="text-sm text-gray-600">Review client contracts with confidence</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Brain className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Startups</h3>
              <p className="text-sm text-gray-600">Understand vendor agreements and partnerships</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Small Business</h3>
              <p className="text-sm text-gray-600">Navigate complex business agreements</p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Legal Teams</h3>
              <p className="text-sm text-gray-600">Accelerate document review processes</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-20 px-4 bg-blue-600 text-white">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Understand Your Legal Documents?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of users who trust LegalLens AI for legal document analysis
            </p>
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                Start Your Free Analysis
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-6 w-6" />
                <span className="text-xl font-bold">LegalLens AI</span>
              </div>
              <p className="text-gray-400">Making legal documents accessible and understandable for everyone.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#features" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/demo" className="hover:text-white">
                    Demo
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-white">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/status" className="hover:text-white">
                    Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 LegalLens AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
