import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Check for bearer token in Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Bearer token required' },
        { status: 401 }
      );
    }
    // Extract and verify the bearer token
    const token = authHeader.substring(7);
    const supabase = createRouteHandlerClient({ cookies });
    // Verify the token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    // Only JSON body supported
    const body = await request.json();
    const pdfText = body.pdf_text;
    const documentId = body.document_id;
   
    if (!pdfText) {
      return NextResponse.json(
        { error: 'pdf_text is required' },
        { status: 400 }
      );
    }
    if (!documentId) {
      return NextResponse.json(
        { error: 'document_id is required' },
        { status: 400 }
      );
    }
    // Call actual Hugging Face Space API for analysis
    const externalApiUrl = 'https://amit098-legal-lens.hf.space/analyze';
    let analysisResult = null;
    let analysisError = null;
    
    try {
    
      const response = await fetch(externalApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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',
          'api-key': 'amit123'
        },
        body: JSON.stringify({ legal_text: pdfText })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('External API error:', errorText);
        analysisError = errorText;
      } else {
        analysisResult = await response.json();
       
      }
    } catch (err) {
      console.error('External API call failed:', err);
      analysisError = err instanceof Error ? err.message : 'Unknown error';
    }
    // Save analysis result or error to DB
    if (analysisResult) {
    
      
      // Save to analysis_results with correct field names
      const { data: insertData, error: insertError } = await supabase
        .from('analysis_results')
        .insert([
          {
            document_id: documentId,
            summary: analysisResult.full_summary || '',
            risk_score: analysisResult.risk_score || '',
            risks_detected: analysisResult.key_findings || [],
            categories: analysisResult.categories || {},
            suggested_questions: analysisResult.legal_questions || [],
          }
        ])
        .select();
      
      if (insertError) {
        console.error('Failed to save analysis result:', insertError);
        return NextResponse.json(
          { error: 'Failed to save analysis result', details: insertError.message },
          { status: 500 }
        );
      }
      
      console.log('Analysis result saved successfully:', insertData);
      
      // Update document status to completed
      const { error: updateError } = await supabase
        .from('documents')
        .update({ status: 'completed' })
        .eq('id', documentId);
      
      if (updateError) {
        console.error('Failed to update document status:', updateError);
        return NextResponse.json(
          { error: 'Failed to update document status', details: updateError.message },
          { status: 500 }
        );
      }
      
      console.log('Document status updated to completed');
      return NextResponse.json({ success: true, analysis: analysisResult });
    } else {
      console.error('No analysis result to save');
      // Update document status to failed
      await supabase.from('documents').update({ status: 'failed' }).eq('id', documentId);
      return NextResponse.json(
        { error: 'Analysis failed', details: analysisError },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Analyze route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
