import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { success: false, message: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Verify the analysis exists
    const { data: analysis, error: analysisError } = await supabase
      .from('analysis_results')
      .select('*')
      .eq('document_id', documentId)
      .single();

    if (analysisError || !analysis) {
      return NextResponse.json(
        { success: false, message: 'Analysis not found' },
        { status: 404 }
      );
    }

    // Generate share URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/shared/analysis/${documentId}`;

    return NextResponse.json({
      success: true,
      shareUrl,
      message: 'Share link generated successfully'
    });

  } catch (error) {
    console.error('Error sharing analysis:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate share link' },
      { status: 500 }
    );
  }
} 