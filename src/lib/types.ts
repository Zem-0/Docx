export interface DocumentMapping {
  id: string;
  user_id: string;
  backend_document_id: string;
  supabase_file_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  user_id?: string;
  document_mapping_id?: string;
  message_text: string;
  sender: 'user' | 'bot';
  message_timestamp: string;
  created_at?: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'docx' | 'pdf' | 'xlsx' | 'image';
  size: number;
  uploadedAt: Date;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress?: number;
  filePath?: string;
  document_id?: string; // This will now be the backend_document_id
  mapping_id?: string; // The ID of the mapping record
  has_chat_history?: boolean; // Whether this document has chat history
  last_chat_time?: string; // When the last chat message was sent
} 