import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import jsPDF from 'jspdf'

export async function POST(request: NextRequest) {
  try {
    const { documentId, saveToStorage = false } = await request.json()

    if (!documentId) {
      return NextResponse.json(
        { success: false, message: 'Document ID is required' },
        { status: 400 }
      )
    }

    // Get document and analysis data
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      return NextResponse.json(
        { success: false, message: 'Document not found' },
        { status: 404 }
      )
    }

    const { data: analysis, error: analysisError } = await supabase
      .from('analysis_results')
      .select('*')
      .eq('document_id', documentId)
      .single()

    if (analysisError || !analysis) {
      return NextResponse.json(
        { success: false, message: 'Analysis not found' },
        { status: 404 }
      )
    }

    // Generate PDF report
    const pdf = new jsPDF()
    
    // Add title
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Legal Document Analysis Report', 20, 20)
    
    // Add document info
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Document: ${document.title}`, 20, 40)
    pdf.text(`Analysis Date: ${new Date(analysis.created_at).toLocaleDateString()}`, 20, 50)
    pdf.text(`Status: ${document.status}`, 20, 60)
    
    // Add risk score
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Risk Assessment', 20, 80)
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Risk Score: ${analysis.risk_score || 'N/A'}`, 20, 90)
    
    // Add categories
    let yPos = 110
    if (analysis.categories && typeof analysis.categories === 'object') {
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Categories', 20, yPos)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      yPos += 10
      
      Object.entries(analysis.categories).forEach(([name, category]: [string, any], index: number) => {
        if (yPos > 250) {
          pdf.addPage()
          yPos = 20
        }
        pdf.text(`${index + 1}. ${name}`, 25, yPos)
        yPos += 8
        
        // Add category details if available
        if (category && typeof category === 'object') {
          if (category.risk_level) {
            pdf.text(`   Risk Level: ${category.risk_level}`, 30, yPos)
            yPos += 6
          }
          if (category.points && Array.isArray(category.points)) {
            category.points.forEach((point: string) => {
              if (yPos > 250) {
                pdf.addPage()
                yPos = 20
              }
              const lines = pdf.splitTextToSize(`   • ${point}`, 160)
              pdf.text(lines.join(' '), 30, yPos)
              yPos += lines.length * 5 + 2
            })
          }
        }
        yPos += 5
      })
    }
    
    // Add risks detected
    if (analysis.risks_detected && Array.isArray(analysis.risks_detected)) {
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Key Findings', 20, yPos + 10)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      let findingsYPos = yPos + 20
      
      analysis.risks_detected.forEach((finding: any, index: number) => {
        if (findingsYPos > 250) {
          pdf.addPage()
          findingsYPos = 20
        }
        
        // Add finding title
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${index + 1}. ${finding.title || 'Finding'}: ${finding.risk_level || 'Medium Risk'}`, 25, findingsYPos)
        findingsYPos += 8
        
        // Add finding description
        pdf.setFont('helvetica', 'normal')
        if (finding.description) {
          const lines = pdf.splitTextToSize(finding.description, 160)
          pdf.text(lines.join(' '), 30, findingsYPos)
          findingsYPos += lines.length * 5 + 3
        }
        
        // Add section if available
        if (finding.section) {
          pdf.text(`Section: ${finding.section}`, 30, findingsYPos)
          findingsYPos += 6
        }
        
        findingsYPos += 5
      })
      yPos = findingsYPos
    }
    
    // Add suggested questions
    if (analysis.suggested_questions && Array.isArray(analysis.suggested_questions)) {
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Legal Questions', 20, yPos + 10)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      let questionsYPos = yPos + 20
      
      analysis.suggested_questions.forEach((question: string, index: number) => {
        if (questionsYPos > 250) {
          pdf.addPage()
          questionsYPos = 20
        }
        // Wrap text if too long
        const lines = pdf.splitTextToSize(question, 160)
        pdf.text(`${index + 1}. ${lines.join(' ')}`, 25, questionsYPos)
        questionsYPos += lines.length * 5 + 3
      })
    }
    
    // Add summary on a new page
    if (analysis.summary) {
      pdf.addPage()
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Summary', 20, 20)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      
      const summaryLines = pdf.splitTextToSize(analysis.summary, 170)
      let summaryYPos = 30
      summaryLines.forEach((line: string) => {
        if (summaryYPos > 250) {
          pdf.addPage()
          summaryYPos = 20
        }
        pdf.text(line, 20, summaryYPos)
        summaryYPos += 5
      })
    }

    // Generate PDF blob
    const pdfBlob = pdf.output('blob')
    const pdfBuffer = await pdfBlob.arrayBuffer()

    if (saveToStorage) {
      try {
        // Save to Supabase Storage
        const fileName = `report-${documentId}-${Date.now()}.pdf`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('reports')
          .upload(fileName, pdfBuffer, {
            contentType: 'application/pdf'
          })

        if (uploadError) {
          console.error('Error uploading report to storage:', uploadError)
          // Fallback to direct download if storage fails
          const base64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)))
          return NextResponse.json({
            success: true,
            message: 'Report generated successfully (storage unavailable)',
            pdfData: `data:application/pdf;base64,${base64}`,
            fileName: `report-${document.title}-${Date.now()}.pdf`
          })
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('reports')
          .getPublicUrl(fileName)

        return NextResponse.json({
          success: true,
          message: 'Report generated and saved successfully',
          url: urlData.publicUrl,
          fileName
        })
      } catch (storageError) {
        console.error('Storage error:', storageError)
        // Fallback to direct download
        const base64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)))
        return NextResponse.json({
          success: true,
          message: 'Report generated successfully (storage unavailable)',
          pdfData: `data:application/pdf;base64,${base64}`,
          fileName: `report-${document.title}-${Date.now()}.pdf`
        })
      }
    } else {
      // Return PDF as base64 for direct download
      const base64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)))
      
      return NextResponse.json({
        success: true,
        message: 'Report generated successfully',
        pdfData: `data:application/pdf;base64,${base64}`,
        fileName: `report-${document.title}-${Date.now()}.pdf`
      })
    }

  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to generate report' },
      { status: 500 }
    )
  }
} 