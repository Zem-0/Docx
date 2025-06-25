import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from './types';

export class ChatMessageService {
  /**
   * Save a chat message to the database
   */
  static async saveMessage(
    userId: string,
    documentMappingId: string,
    messageText: string,
    sender: 'user' | 'bot'
  ): Promise<ChatMessage> {
    const { data, error } = await (supabase as any)
      .from('chat_messages')
      .insert({
        user_id: userId,
        document_mapping_id: documentMappingId,
        message_text: messageText,
        sender: sender,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save chat message: ${error.message}`);
    }

    return data as ChatMessage;
  }

  /**
   * Get chat history for a specific document
   */
  static async getChatHistory(
    userId: string,
    documentMappingId: string
  ): Promise<ChatMessage[]> {
    const { data, error } = await (supabase as any)
      .rpc('get_chat_history_for_document', {
        p_user_id: userId,
        p_document_mapping_id: documentMappingId
      });

    if (error) {
      throw new Error(`Failed to fetch chat history: ${error.message}`);
    }

    return (data || []) as ChatMessage[];
  }

  /**
   * Get chat history for multiple documents
   */
  static async getChatHistoryForDocuments(
    userId: string,
    documentMappingIds: string[]
  ): Promise<Record<string, ChatMessage[]>> {
    if (documentMappingIds.length === 0) {
      return {};
    }

    const { data, error } = await (supabase as any)
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .in('document_mapping_id', documentMappingIds)
      .order('timestamp', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch chat history: ${error.message}`);
    }

    // Group messages by document mapping ID
    const groupedMessages: Record<string, ChatMessage[]> = {};
    (data || []).forEach((message: ChatMessage) => {
      if (!groupedMessages[message.document_mapping_id]) {
        groupedMessages[message.document_mapping_id] = [];
      }
      groupedMessages[message.document_mapping_id].push(message);
    });

    return groupedMessages;
  }

  /**
   * Delete all chat messages for a specific document
   */
  static async deleteChatHistory(
    userId: string,
    documentMappingId: string
  ): Promise<void> {
    const { error } = await (supabase as any)
      .from('chat_messages')
      .delete()
      .eq('user_id', userId)
      .eq('document_mapping_id', documentMappingId);

    if (error) {
      throw new Error(`Failed to delete chat history: ${error.message}`);
    }
  }

  /**
   * Get the last message timestamp for a document
   */
  static async getLastMessageTime(
    userId: string,
    documentMappingId: string
  ): Promise<string | null> {
    const { data, error } = await (supabase as any)
      .from('chat_messages')
      .select('message_timestamp')
      .eq('user_id', userId)
      .eq('document_mapping_id', documentMappingId)
      .order('message_timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No messages found
        return null;
      }
      throw new Error(`Failed to get last message time: ${error.message}`);
    }

    return data?.message_timestamp || null;
  }

  /**
   * Check if a document has any chat history
   */
  static async hasChatHistory(
    userId: string,
    documentMappingId: string
  ): Promise<boolean> {
    const { count, error } = await (supabase as any)
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('document_mapping_id', documentMappingId);

    if (error) {
      throw new Error(`Failed to check chat history: ${error.message}`);
    }

    return (count || 0) > 0;
  }
} 