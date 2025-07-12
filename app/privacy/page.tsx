"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Lock, Eye, FileText, Users, Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"

export default function PrivacyPage() {
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
            <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
              Privacy & Data Protection
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600">
              Your privacy and data security are our top priorities. Learn how we protect your information.
            </p>
          </div>

          {/* Last Updated */}
          <Card className="border-0 shadow-lg mb-8">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Last Updated</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">July 2025</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-8 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-lg max-w-none">
            
            {/* Information We Collect */}
            <Card className="border-0 shadow-lg mb-8">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <CardTitle>Information We Collect</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Personal Information</h3>
                  <p className="text-gray-600 mb-4">
                    When you create an account or use our services, we collect:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Name and email address for account creation</li>
                    <li>Profile information you choose to provide</li>
                    <li>Usage data and analytics to improve our service</li>
                    <li>Communication preferences and settings</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Document Data</h3>
                  <p className="text-gray-600 mb-4">
                    When you upload legal documents for analysis:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Document content is processed for AI analysis</li>
                    <li>Analysis results and insights are stored</li>
                    <li>Document metadata (file type, size, upload date)</li>
                    <li>Processing logs for service improvement</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* How We Use Information */}
            <Card className="border-0 shadow-lg mb-8">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Eye className="h-6 w-6 text-green-600" />
                  <CardTitle>How We Use Your Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Service Delivery</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                      <li>Process and analyze your legal documents</li>
                      <li>Generate AI-powered insights and reports</li>
                      <li>Provide customer support and assistance</li>
                      <li>Send important service notifications</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Service Improvement</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                      <li>Improve our AI analysis algorithms</li>
                      <li>Enhance user experience and features</li>
                      <li>Develop new functionality</li>
                      <li>Ensure platform security and stability</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card className="border-0 shadow-lg mb-8">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Shield className="h-6 w-6 text-red-600" />
                  <CardTitle>Data Security & Protection</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Encryption & Storage</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                      <li>End-to-end encryption for all data</li>
                      <li>Secure cloud storage with industry standards</li>
                      <li>Regular security audits and updates</li>
                      <li>Access controls and authentication</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Data Retention</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                      <li>Documents auto-deleted after 30 days</li>
                      <li>Analysis results retained per your settings</li>
                      <li>Account data kept while active</li>
                      <li>Immediate deletion upon account closure</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Sharing */}
            <Card className="border-0 shadow-lg mb-8">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Users className="h-6 w-6 text-purple-600" />
                  <CardTitle>Data Sharing & Third Parties</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 mb-4">
                  We do not sell, trade, or rent your personal information to third parties. We may share data only in these limited circumstances:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li><strong>Service Providers:</strong> Trusted partners who help us deliver our services (cloud storage, AI processing)</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                  <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
                  <li><strong>With Your Consent:</strong> When you explicitly authorize sharing</li>
                </ul>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card className="border-0 shadow-lg mb-8">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Lock className="h-6 w-6 text-orange-600" />
                  <CardTitle>Your Privacy Rights</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Access & Control</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                      <li>Access your personal data</li>
                      <li>Update or correct information</li>
                      <li>Download your data</li>
                      <li>Delete your account and data</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Preferences</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                      <li>Opt-out of marketing communications</li>
                      <li>Control data retention settings</li>
                      <li>Manage document auto-deletion</li>
                      <li>Set privacy preferences</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cookies & Tracking */}
            <Card className="border-0 shadow-lg mb-8">
              <CardHeader>
                <CardTitle>Cookies & Tracking Technologies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 mb-4">
                  We use cookies and similar technologies to:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Maintain your session and preferences</li>
                  <li>Analyze website usage and performance</li>
                  <li>Improve our services and user experience</li>
                  <li>Provide personalized content and features</li>
                </ul>
                <p className="text-gray-600 mt-4">
                  You can control cookie settings through your browser preferences or our privacy settings.
                </p>
              </CardContent>
            </Card>

            {/* Children's Privacy */}
            <Card className="border-0 shadow-lg mb-8">
              <CardHeader>
                <CardTitle>Children's Privacy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.
                </p>
              </CardContent>
            </Card>

           

            {/* Changes to Policy */}
            <Card className="border-0 shadow-lg mb-8">
              <CardHeader>
                <CardTitle>Changes to This Privacy Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  We may update this privacy policy from time to time. We will notify you of any material changes by:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Posting the updated policy on our website</li>
                  <li>Sending email notifications to registered users</li>
                  <li>Displaying prominent notices in our application</li>
                </ul>
                <p className="text-gray-600 mt-4">
                  Your continued use of our service after changes become effective constitutes acceptance of the updated policy.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border-0 shadow-lg mb-8">
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  This is a development project. If you have any questions about this privacy policy or our data practices, please contact the developer:
                </p>
                <div className="space-y-2 text-gray-600">
                  <p><strong>Email:</strong> amitdey1350@gmail.com</p>
                  <p><strong>Phone:</strong> +91 6003160229</p>
                  <p><strong>Project Status:</strong> Development Phase</p>
                  <p><strong>Response Time:</strong> We aim to respond to inquiries within 24-48 hours</p>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Questions About Privacy?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            We're committed to transparency and protecting your data. Reach out if you need clarification.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Back to Home
              </button>
            </Link>
            <a href="mailto:amitdey1350@gmail.com" className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Contact Developer
            </a>
            <Link href="/support">
              <button className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Support Project
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
} 