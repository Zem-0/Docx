import { supabase } from '@/integrations/supabase/client';
import { DocumentMapping } from './types';

export class DocumentMappingService {
  /**
   * Create a new document mapping
   */
  static async createMapping(
    userId: string,
    backendDocumentId: string,
    supabaseFilePath: string,
    fileName: string,
    fileType: string,
    fileSize: number
  ): Promise<DocumentMapping> {
    const { data, error } = await (supabase as any)
      .from('document_mappings')
      .insert({
        user_id: userId,
        backend_document_id: backendDocumentId,
        supabase_file_path: supabaseFilePath,
        file_name: fileName,
        file_type: fileType,
        file_size: fileSize,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create document mapping: ${error.message}`);
    }

    return data as DocumentMapping;
  }

  /**
   * Get all document mappings for a user
   */
  static async getUserMappings(userId: string): Promise<DocumentMapping[]> {
    const { data, error } = await (supabase as any)
      .from('document_mappings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch document mappings: ${error.message}`);
    }

    return (data || []) as DocumentMapping[];
  }

  /**
   * Get a specific document mapping by backend document ID
   */
  static async getMappingByBackendId(
    userId: string,
    backendDocumentId: string
  ): Promise<DocumentMapping | null> {
    const { data, error } = await (supabase as any)
      .from('document_mappings')
      .select('*')
      .eq('user_id', userId)
      .eq('backend_document_id', backendDocumentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new Error(`Failed to fetch document mapping: ${error.message}`);
    }

    return data as DocumentMapping;
  }

  /**
   * Get a specific document mapping by Supabase file path
   */
  static async getMappingByFilePath(
    userId: string,
    supabaseFilePath: string
  ): Promise<DocumentMapping | null> {
    const { data, error } = await (supabase as any)
      .from('document_mappings')
      .select('*')
      .eq('user_id', userId)
      .eq('supabase_file_path', supabaseFilePath)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new Error(`Failed to fetch document mapping: ${error.message}`);
    }

    return data as DocumentMapping;
  }

  /**
   * Delete a document mapping
   */
  static async deleteMapping(mappingId: string): Promise<void> {
    const { error } = await (supabase as any)
      .from('document_mappings')
      .delete()
      .eq('id', mappingId);

    if (error) {
      throw new Error(`Failed to delete document mapping: ${error.message}`);
    }
  }

  /**
   * Delete a document mapping by backend document ID
   */
  static async deleteMappingByBackendId(
    userId: string,
    backendDocumentId: string
  ): Promise<void> {
    const { error } = await (supabase as any)
      .from('document_mappings')
      .delete()
      .eq('user_id', userId)
      .eq('backend_document_id', backendDocumentId);

    if (error) {
      throw new Error(`Failed to delete document mapping: ${error.message}`);
    }
  }

  /**
   * Delete a document mapping by Supabase file path
   */
  static async deleteMappingByFilePath(
    userId: string,
    supabaseFilePath: string
  ): Promise<void> {
    const { error } = await (supabase as any)
      .from('document_mappings')
      .delete()
      .eq('user_id', userId)
      .eq('supabase_file_path', supabaseFilePath);

    if (error) {
      throw new Error(`Failed to delete document mapping: ${error.message}`);
    }
  }
} 