-- Create document_mappings table to store backend document IDs
CREATE TABLE public.document_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  backend_document_id TEXT NOT NULL,
  supabase_file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE(user_id, backend_document_id),
  UNIQUE(user_id, supabase_file_path)
);

-- Create index for faster lookups
CREATE INDEX idx_document_mappings_user_id ON public.document_mappings(user_id);
CREATE INDEX idx_document_mappings_backend_document_id ON public.document_mappings(backend_document_id);
CREATE INDEX idx_document_mappings_supabase_file_path ON public.document_mappings(supabase_file_path);

-- Enable Row Level Security
ALTER TABLE public.document_mappings ENABLE ROW LEVEL SECURITY;

-- Create policies for document_mappings table
CREATE POLICY "Users can view their own document mappings" 
  ON public.document_mappings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own document mappings" 
  ON public.document_mappings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own document mappings" 
  ON public.document_mappings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own document mappings" 
  ON public.document_mappings 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update updated_at
CREATE OR REPLACE TRIGGER update_document_mappings_updated_at
  BEFORE UPDATE ON public.document_mappings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); 