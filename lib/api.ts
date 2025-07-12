import { supabase, Document as SupabaseDocument, Analysis as SupabaseAnalysis, User as SupabaseUser } from './supabase';

// Document API functions
export const documentApi = {
  // Get all documents for the current user
  async getDocuments(userId: string, searchTerm?: string): Promise<SupabaseDocument[]> {
    let query = supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (searchTerm) {
      query = query.ilike('title', `%${searchTerm}%`);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Get a specific document by ID
  async getDocument(id: string): Promise<SupabaseDocument | null> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data || null;
  },

  // Upload a new document
  async uploadDocument(
    userId: string,
    title: string,
    filePath: string,
    status: string = 'processing',
  ): Promise<{ success: boolean; documentId?: string; message: string }> {
    const { data, error } = await supabase
      .from('documents')
      .insert([{ user_id: userId, title, file_path: filePath, status }])
      .select('id')
      .single();
    if (error) return { success: false, message: error.message };
    return { success: true, documentId: data.id, message: 'Document uploaded successfully.' };
  },

  // Delete a document
  async deleteDocument(id: string): Promise<{ success: boolean; message: string }> {
    try {
      // Step 1: Get the document to retrieve file_path
      const { data: document, error: getError } = await supabase
        .from('documents')
        .select('file_path')
        .eq('id', id)
        .single();
      
      if (getError) {
        console.error('Error getting document for deletion:', getError);
        return { success: false, message: 'Document not found' };
      }

      // Step 2: Delete the PDF file from storage if it exists
      if (document?.file_path) {
        try {
          const { error: storageError } = await supabase.storage
            .from('pdfs')
            .remove([document.file_path]);
          
          if (storageError) {
            console.error('Error deleting file from storage:', storageError);
            // Continue with deletion even if storage deletion fails
          } else {
            console.log('File deleted from storage:', document.file_path);
          }
        } catch (storageError) {
          console.error('Error deleting file from storage:', storageError);
          // Continue with deletion even if storage deletion fails
        }
      }

      // Step 3: Delete analysis_results first (if any)
      const { error: analysisError } = await supabase
        .from('analysis_results')
        .delete()
        .eq('document_id', id);
      
      if (analysisError) {
        console.error('Error deleting analysis results:', analysisError);
        // Continue with document deletion even if analysis deletion fails
      } else {
        console.log('Analysis results deleted for document:', id);
      }

      // Step 4: Delete the document record
      const { error: documentError } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);
      
      if (documentError) {
        console.error('Error deleting document record:', documentError);
        return { success: false, message: documentError.message };
      }

      console.log('Document deleted successfully:', id);
      return { success: true, message: 'Document and all associated files deleted successfully' };
      
    } catch (error) {
      console.error('Unexpected error during document deletion:', error);
      return { success: false, message: 'An unexpected error occurred during deletion' };
    }
  },

  // Generate and download PDF report
  async downloadReport(id: string, saveToBlob = false): Promise<{ success: boolean; url?: string; pdfData?: string; fileName?: string; message: string }> {
    try {
      const response = await fetch('/api/generate-report-blob', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId: id, saveToBlob }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, message: result.message || 'Failed to generate report' };
      }

      return result;
    } catch (error) {
      console.error('Error generating report:', error);
      return { success: false, message: 'Failed to generate report' };
    }
  },
};

// Analysis API functions
export const analysisApi = {
  // Get analysis for a specific document
  async getAnalysis(documentId: string): Promise<SupabaseAnalysis | null> {
    const { data, error } = await supabase
      .from('analysis_results')
      .select('*')
      .eq('document_id', documentId)
      .single();
    if (error) throw error;
    return data || null;
  },

  // Create or update analysis for a document
  async upsertAnalysis(analysis: Partial<SupabaseAnalysis>): Promise<{ success: boolean; message: string }> {
    const { error } = await supabase
      .from('analysis_results')
      .upsert([analysis], { onConflict: 'document_id' });
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Analysis saved.' };
  },

  // Share analysis (returns a share URL)
  async shareAnalysis(documentId: string, email?: string): Promise<{ success: boolean; shareUrl?: string; message: string }> {
    try {
      const response = await fetch('/api/share-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, message: result.message || 'Failed to generate share link' };
      }

      return result;
    } catch (error) {
      console.error('Error sharing analysis:', error);
      return { success: false, message: 'Failed to generate share link' };
    }
  },
};

// User stats API functions
export const userApi = {
  // Get user dashboard stats
  async getUserStats(userId: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('status')
      .eq('user_id', userId);
    if (error) throw error;
    const userDocs = data || [];
    const totalDocuments = userDocs.length;
    const completedDocuments = userDocs.filter((doc: any) => doc.status === 'completed').length;
    const processingDocuments = userDocs.filter((doc: any) => doc.status === 'processing').length;
    return {
      totalDocuments,
      highRiskDocuments: 0, // Not available in schema
      completedDocuments,
      processingDocuments,
      monthlyGrowth: 0,
    };
  },

  // Get recent activity
  async getRecentActivity(userId: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('id, title, created_at, status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) throw error;
    return (data || []).map((doc: any) => ({
      id: doc.id,
      type: doc.status === 'completed' ? 'analysis' : 'upload',
      title: doc.title,
      timestamp: doc.created_at,
    }));
  },
};

// Search API functions
export const searchApi = {
  // Search across documents for a user
  async searchDocuments(userId: string, query: string, filters?: {
    status?: 'processing' | 'completed' | 'failed',
    dateRange?: { from: string; to: string },
  }): Promise<SupabaseDocument[]> {
    let supaQuery = supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId);
    if (query) {
      supaQuery = supaQuery.ilike('title', `%${query}%`);
    }
    if (filters?.status) {
      supaQuery = supaQuery.eq('status', filters.status);
    }
    if (filters?.dateRange) {
      supaQuery = supaQuery.gte('created_at', filters.dateRange.from).lte('created_at', filters.dateRange.to);
    }
    const { data, error } = await supaQuery;
    if (error) throw error;
    return data || [];
  },
};
