-- Manual migration script for chat_messages table
-- Run this in your Supabase SQL editor after running the document_mappings migration

-- Create chat_messages table to store chat history for each document
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  document_mapping_id UUID NOT NULL REFERENCES public.document_mappings ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'bot')),
  message_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create index for faster lookups
CREATE INDEX idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX idx_chat_messages_document_mapping_id ON public.chat_messages(document_mapping_id);
CREATE INDEX idx_chat_messages_message_timestamp ON public.chat_messages(message_timestamp);

-- Enable Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for chat_messages table
CREATE POLICY "Users can view their own chat messages" 
  ON public.chat_messages 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages" 
  ON public.chat_messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat messages" 
  ON public.chat_messages 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat messages" 
  ON public.chat_messages 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create a function to get chat history for a document
CREATE OR REPLACE FUNCTION public.get_chat_history_for_document(
  p_user_id UUID,
  p_document_mapping_id UUID
)
RETURNS TABLE (
  id UUID,
  message_text TEXT,
  sender TEXT,
  message_timestamp TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cm.id,
    cm.message_text,
    cm.sender,
    cm.message_timestamp
  FROM public.chat_messages cm
  WHERE cm.user_id = p_user_id 
    AND cm.document_mapping_id = p_document_mapping_id
  ORDER BY cm.message_timestamp ASC;
END;
$$; 