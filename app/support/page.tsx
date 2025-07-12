"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Github, Heart, Star, Code, Users, ArrowLeft, Mail, Phone, Check } from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { useState } from "react"

export default function SupportPage() {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedAddress(type)
      setTimeout(() => setCopiedAddress(null), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />

      {/* Header Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-100">
              Support the Project
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Support LegalLens AI
            </h1>
            <p className="text-xl text-gray-600">
              Help us build better AI-powered legal document analysis tools for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Buy Me a Coffee Section */}
      <section className="py-12 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl text-white">☕</span>
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                Support the Development
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                If you find LegalLens AI helpful, consider supporting the development!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <span className="text-green-600 mr-2">🇮🇳</span>
                      UPI (India)
                    </h3>
                    <div className="flex items-center justify-between">
                      <code className="bg-white px-3 py-2 rounded text-sm font-mono border flex-1 mr-2">amitdey@fam</code>
                      <button 
                        onClick={() => handleCopy('amitdey@fam', 'upi')}
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                      >
                        {copiedAddress === 'upi' ? (
                          <>
                            <Check className="w-4 h-4 mr-1 text-green-600" />
                            Copied!
                          </>
                        ) : (
                          'Copy'
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <span className="text-purple-600 mr-2">⚡</span>
                      Solana
                    </h3>
                    <div className="flex items-center justify-between">
                      <code className="bg-white px-3 py-2 rounded text-sm font-mono truncate max-w-xs border flex-1 mr-2">
                        AdpFDgbdxs5E3YpCN7VyYwmtorZbHN8g4fJvFN4PmwxH
                      </code>
                      <button 
                        onClick={() => handleCopy('AdpFDgbdxs5E3YpCN7VyYwmtorZbHN8g4fJvFN4PmwxH', 'solana')}
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                      >
                        {copiedAddress === 'solana' ? (
                          <>
                            <Check className="w-4 h-4 mr-1 text-green-600" />
                            Copied!
                          </>
                        ) : (
                          'Copy'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <span className="text-blue-600 mr-2">🔷</span>
                      Ethereum
                    </h3>
                    <div className="flex items-center justify-between">
                      <code className="bg-white px-3 py-2 rounded text-sm font-mono truncate max-w-xs border flex-1 mr-2">
                        0xb2F23122d70777788107014E738E99a594AE25d7
                      </code>
                      <button 
                        onClick={() => handleCopy('0xb2F23122d70777788107014E738E99a594AE25d7', 'eth')}
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                      >
                        {copiedAddress === 'eth' ? (
                          <>
                            <Check className="w-4 h-4 mr-1 text-green-600" />
                            Copied!
                          </>
                        ) : (
                          'Copy'
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <span className="text-orange-600 mr-2">₿</span>
                      Bitcoin
                    </h3>
                    <div className="flex items-center justify-between">
                      <code className="bg-white px-3 py-2 rounded text-sm font-mono truncate max-w-xs border flex-1 mr-2">
                        bc1p6w2ml948pnyzn59xd88etj5knaw2g7cknkegux47uuxcnkhgxe4stxk75x
                      </code>
                      <button 
                        onClick={() => handleCopy('bc1p6w2ml948pnyzn59xd88etj5knaw2g7cknkegux47uuxcnkhgxe4stxk75x', 'btc')}
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                      >
                        {copiedAddress === 'btc' ? (
                          <>
                            <Check className="w-4 h-4 mr-1 text-green-600" />
                            Copied!
                          </>
                        ) : (
                          'Copy'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                  💝 Every contribution helps keep the development going! Thank you for your support!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Project Info */}
      <section className="py-8 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Code className="h-6 w-6 text-blue-600" />
                  <CardTitle>About the Project</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  LegalLens AI is a development project focused on making legal document analysis accessible to freelancers, 
                  startups, and small businesses through AI-powered insights.
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Status:</strong> Development Phase</p>
                  <p><strong>Technology:</strong> Next.js, TypeScript, AI/ML</p>
                  <p><strong>Goal:</strong> Democratize legal document understanding</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Heart className="h-6 w-6 text-red-600" />
                  <CardTitle>Why Support Us?</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Help improve AI legal analysis tools</li>
                  <li>Make legal document review more accessible</li>
                  <li>Support open-source development</li>
                  <li>Contribute to legal tech innovation</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* GitHub Section */}
          <Card className="border-0 shadow-lg mb-8">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Github className="h-6 w-6 text-gray-900" />
                <CardTitle>Open Source on GitHub</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                LegalLens AI is an open-source project. You can view the source code, contribute, or star the repository to show your support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="https://github.com/Amit00008/LegalLens" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Github className="w-5 h-5 mr-2" />
                  View on GitHub
                </a>
                <a 
                  href="https://github.com/Amit00008/LegalLens" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Star className="w-5 h-5 mr-2" />
                  Star Repository
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Ways to Support */}
          <Card className="border-0 shadow-lg mb-8">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-purple-600" />
                <CardTitle>Ways to Support</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">For Developers</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>Star the GitHub repository</li>
                    <li>Fork and contribute code</li>
                    <li>Report bugs and issues</li>
                    <li>Suggest new features</li>
                    <li>Share with your network</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">For Users</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>Test the application</li>
                    <li>Provide feedback</li>
                    <li>Share with colleagues</li>
                    <li>Report any issues</li>
                    <li>Suggest improvements</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Developer */}
          <Card className="border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle>Contact the Developer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Have questions, suggestions, or want to collaborate? Feel free to reach out!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <a href="mailto:amitdey1350@gmail.com" className="text-blue-600 hover:text-blue-700">
                        amitdey1350@gmail.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Phone</p>
                      <a href="tel:+916003160229" className="text-green-600 hover:text-green-700">
                        +91 6003160229
                      </a>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Github className="h-5 w-5 text-gray-900" />
                    <div>
                      <p className="font-medium text-gray-900">GitHub</p>
                      <a 
                        href="https://github.com/Amit00008/LegalLens" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-700"
                      >
                        @Amit00008/LegalLens
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Code className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">Project Status</p>
                      <p className="text-gray-600">Development Phase</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Features */}
          <Card className="border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle>Current Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Implemented</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>Document upload and processing</li>
                    <li>AI-powered document analysis</li>
                    <li>Risk detection and highlighting</li>
                    <li>User authentication system</li>
                    <li>Dashboard for document management</li>
                    <li>PDF report generation</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Planned Features</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>Advanced AI models</li>
                    <li>Multi-language support</li>
                    <li>Collaborative document review</li>
                    <li>API for integrations</li>
                    <li>Mobile application</li>
                    <li>Advanced analytics</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Support LegalLens AI?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Every contribution helps make legal document analysis more accessible and powerful.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://github.com/Amit00008/LegalLens" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center justify-center"
            >
              <Github className="w-5 h-5 mr-2" />
              Star on GitHub
            </a>
            <a 
              href="mailto:amitdey1350@gmail.com" 
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contact Developer
            </a>
            <Link href="/" className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
} 