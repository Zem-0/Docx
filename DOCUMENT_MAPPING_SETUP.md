# Document Mapping System Setup

This guide explains how to set up and use the new document mapping system that fixes the issue with wrong document IDs being passed to the chat endpoint, and adds persistent chat history functionality.

## Problem Solved

Previously, the system was passing incorrect document IDs to the chat endpoint because:
1. Backend generates UUIDs for documents (e.g., `0432969c-43f2-4e01-b7dc-f8893d8e4164`)
2. Frontend was trying to reconstruct these IDs from Supabase file metadata
3. This led to mismatched IDs and chat failures
4. Chat history was lost on page reload

## Solution

The new system creates two tables in Supabase:
1. **`document_mappings`** - Stores the relationship between Supabase storage file paths and backend document IDs
2. **`chat_messages`** - Stores chat history for each document, persisting conversations across page reloads

## Setup Instructions

### 1. Apply the Database Migrations

You need to create both tables in your Supabase database. You can do this in two ways:

#### Option A: Using Supabase CLI (Recommended)
```bash
cd supabase
npx supabase db push
```

#### Option B: Manual SQL Execution
1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. **First**, copy and paste the contents of `supabase/manual_migration.sql` and execute it
4. **Then**, copy and paste the contents of `supabase/manual_chat_migration.sql` and execute it

### 2. Verify the Table Creation

After applying the migrations, you should see two new tables in your Supabase database:

#### document_mappings table:
```sql
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
```

#### chat_messages table:
```sql
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
```

## How It Works

### File Upload Process
1. User uploads a file
2. File is uploaded to Supabase storage
3. File is uploaded to backend (gets a UUID)
4. A mapping record is created linking the Supabase file path to the backend UUID
5. Document list is refreshed with proper backend document IDs

### Document Listing
1. Files are fetched from Supabase storage
2. Document mappings are fetched for the user
3. Chat history information is fetched for each document
4. Files are matched with their backend document IDs and chat history status
5. Only documents with valid backend IDs can be used for chat

### Chat Process
1. User selects a document for chat
2. System loads existing chat history from database
3. User sends a message
4. Message is saved to database and sent to backend
5. Backend response is saved to database and displayed
6. Chat history persists across page reloads

### Chat History Features
- **Persistent Storage**: All chat messages are saved to the database
- **Document-Specific**: Each document has its own chat history
- **User-Specific**: Users can only see their own chat history
- **Real-time Loading**: Chat history loads when you select a document
- **Automatic Cleanup**: Chat history is deleted when documents are deleted

## Code Changes Made

### New Files Created
- `src/lib/types.ts` - TypeScript interfaces for Document, DocumentMapping, and ChatMessage
- `src/lib/documentMappingService.ts` - Service for managing document mappings
- `src/lib/chatMessageService.ts` - Service for managing chat messages
- `supabase/migrations/20250622084906_create_document_mappings.sql` - Database migration for document mappings
- `supabase/migrations/20250622084907_create_chat_messages.sql` - Database migration for chat messages
- `supabase/manual_migration.sql` - Manual migration script for document mappings
- `supabase/manual_chat_migration.sql` - Manual migration script for chat messages

### Files Modified
- `src/pages/DocumentProcessor.tsx` - Updated to use document mapping and chat history services

## Testing the Fix

1. Apply both migrations to your Supabase database
2. Upload a new document
3. Check that the document appears in the list with a valid backend document ID
4. Try chatting with the document - it should work without the "Invalid document ID" error
5. Refresh the page and select the same document - your chat history should be preserved
6. Try chatting with a different document - each document should have its own separate chat history

## Troubleshooting

### If you still get "Invalid document ID" errors:
1. Check that both migrations were applied successfully
2. Verify that both `document_mappings` and `chat_messages` tables exist in your Supabase database
3. Check the browser console for any errors during document upload
4. Ensure your backend is running and accessible

### If chat history doesn't persist:
1. Check that the `chat_messages` table was created correctly
2. Verify that the RLS policies are set up correctly
3. Check the browser console for any errors when loading chat history
4. Ensure the user has the correct permissions

### If documents don't show up with backend IDs:
1. Check that the DocumentMappingService is working correctly
2. Verify that the RLS policies are set up correctly
3. Check that the user has the correct permissions

## Benefits

- **Reliable Chat**: Documents will always have the correct backend IDs for chat
- **Persistent Chat History**: Conversations are saved and persist across page reloads
- **Document-Specific Chats**: Each document maintains its own separate chat history
- **Data Integrity**: Proper relationship between Supabase files and backend documents
- **Scalability**: System can handle multiple documents per user efficiently
- **Maintainability**: Clear separation of concerns between storage and processing

## Migration from Old System

If you have existing documents that were uploaded before this fix:
1. They will still appear in the document list
2. They won't have backend document IDs (no chat functionality)
3. You'll need to re-upload them to get chat functionality
4. Or you can manually create mappings in the database (advanced users only)

## New Features

### Chat History Indicators
- Documents with chat history will show this information in the UI
- You can see when the last chat message was sent
- Chat history is automatically loaded when you select a document

### Persistent Conversations
- All chat messages are automatically saved to the database
- Conversations persist across browser sessions and page reloads
- Each document maintains its own separate chat history
- Chat history is automatically cleaned up when documents are deleted 