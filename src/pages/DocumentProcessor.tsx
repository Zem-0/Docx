import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  Eye, 
  Edit, 
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  Clock,
  File,
  FileSpreadsheet,
  FileImage,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  Users,
  Zap,
  ChevronsRight,
  ChevronsLeft
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Document {
  id: string;
  name: string;
  type: 'docx' | 'pdf' | 'xlsx' | 'image';
  size: number;
  uploadedAt: Date;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress?: number;
  filePath?: string;
}

interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp?: number;
}

// Simple Markdown to React elements (bold, italics, code, line breaks)
function renderMarkdown(text: string) {
    // Replace **bold**
    let parts = text.split(/(\*\*[^*]+\*\*)/g).map(part => {
        if (/^\*\*[^*]+\*\*$/.test(part)) {
            return <strong key={Math.random()}>{part.slice(2, -2)}</strong>;
        }
        return part;
    });
    // Replace *italic*
    parts = parts.flatMap(part =>
        typeof part === 'string'
            ? part.split(/(\*[^*]+\*)/g).map(p =>
                /^\*[^*]+\*$/.test(p) ? <em key={Math.random()}>{p.slice(1, -1)}</em> : p
              )
            : [part]
    );
    // Replace `code`
    parts = parts.flatMap(part =>
        typeof part === 'string'
            ? part.split(/(`[^`]+`)/g).map(p =>
                /^`[^`]+`$/.test(p) ? <code key={Math.random()} className="bg-gray-100 px-1 rounded">{p.slice(1, -1)}</code> : p
              )
            : [part]
    );
    // Replace newlines
    return parts.flatMap((part, i) => [part, <br key={i + '-br'} />]).slice(0, -1);
}

const DocumentProcessor: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);
  const [docToRename, setDocToRename] = useState<Document | null>(null);
  const [newName, setNewName] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Fetch user documents from Supabase on component mount
  useEffect(() => {
    const fetchUserDocuments = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // List all files in the user's folder in Supabase storage
        const { data: files, error } = await supabase.storage
          .from('documents')
          .list(user.id, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'created_at', order: 'desc' }
          });

        if (error) {
          console.error('Error fetching documents:', error);
          toast({ 
            title: 'Error', 
            description: 'Failed to load your documents', 
            variant: 'destructive' 
          });
          return;
        }

        // Transform the files data into Document objects
        const userDocuments: Document[] = files
          .filter(file => file.name && !file.name.startsWith('.')) // Filter out hidden files
          .map(file => ({
            id: file.id || `file-${Date.now()}-${file.name}`,
            name: file.name,
            type: getFileType(file.name),
            size: file.metadata?.size || 0,
            uploadedAt: new Date(file.created_at || Date.now()),
            status: 'completed' as const,
            progress: 100,
            filePath: `${user.id}/${file.name}`
          }));

        setDocuments(userDocuments);
      } catch (error) {
        console.error('Error fetching documents:', error);
        toast({ 
          title: 'Error', 
          description: 'Failed to load your documents', 
          variant: 'destructive' 
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDocuments();
  }, [user, toast]);

  const updateDocumentProgress = (id: string, progress: number) => {
    setDocuments(prev => prev.map(doc => doc.id === id ? { ...doc, progress } : doc));
  };

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    const newDocuments: Document[] = Array.from(files).map(file => ({
      id: `temp-${Date.now()}-${file.name}`,
      name: file.name,
      type: getFileType(file.name),
      size: file.size,
      uploadedAt: new Date(),
      status: 'uploading',
      progress: 0,
    }));

    setDocuments(prev => [...prev, ...newDocuments]);

    for (const file of files) {
      const tempId = newDocuments.find(d => d.name === file.name)!.id;
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      try {
        // Step 1: Upload to Supabase Storage
        const { error: supabaseError } = await supabase.storage
          .from('documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (supabaseError) throw new Error(`Supabase upload failed: ${supabaseError.message}`);
        updateDocumentProgress(tempId, 50);

        // Step 2: Upload to your backend to get document_id
        const formData = new FormData();
        formData.append('file', file);
        
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        const response = await fetch(`${baseUrl}/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Backend upload failed');
        }

        const result = await response.json();
        const documentId = result.document_id;
        
        updateDocumentProgress(tempId, 100);

        // Remove the temporary document and refresh the list from Supabase
        setDocuments(prev => prev.filter(doc => doc.id !== tempId));
        
        // Refresh documents from Supabase
        const { data: files, error } = await supabase.storage
          .from('documents')
          .list(user.id, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'created_at', order: 'desc' }
          });

        if (!error && files) {
          const userDocuments: Document[] = files
            .filter(file => file.name && !file.name.startsWith('.'))
            .map(file => ({
              id: file.id || `file-${Date.now()}-${file.name}`,
              name: file.name,
              type: getFileType(file.name),
              size: file.metadata?.size || 0,
              uploadedAt: new Date(file.created_at || Date.now()),
              status: 'completed' as const,
              progress: 100,
              filePath: `${user.id}/${file.name}`
            }));

          setDocuments(userDocuments);
        }

        toast({ title: "Success", description: `${file.name} uploaded successfully.` });

      } catch (error: any) {
        console.error('Upload failed:', error);
        toast({ title: 'Error', description: `Failed to upload ${file.name}: ${error.message}`, variant: 'destructive' });
        setDocuments(prev => prev.map(doc => 
          doc.id === tempId ? { ...doc, status: 'error' } : doc
        ));
      }
    }
  }, [user, toast]);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedDocument) return;

    const userMessage: ChatMessage = { id: `msg-${Date.now()}`, text: chatInput, sender: 'user', timestamp: Date.now() };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatting(true);

    try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        const response = await fetch(`${baseUrl}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: chatInput,
                document_id: selectedDocument.id,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Chat API error');
        }

        const result = await response.json();
        const botMessage: ChatMessage = { id: `msg-${Date.now()}-bot`, text: result.response, sender: 'bot', timestamp: Date.now() };
        setChatMessages(prev => [...prev, botMessage]);

    } catch (error: any) {
        toast({ title: 'Error', description: `Chat failed: ${error.message}`, variant: 'destructive' });
    } finally {
        setIsChatting(false);
    }
  };

  const getFileType = (filename: string): Document['type'] => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'docx': return 'docx';
      case 'pdf': return 'pdf';
      case 'xlsx': return 'xlsx';
      default: return 'image';
    }
  };

  const getFileIcon = (type: Document['type']) => {
    switch (type) {
      case 'docx': return <FileText className="h-4 w-4" />;
      case 'pdf': return <File className="h-4 w-4" />;
      case 'xlsx': return <FileSpreadsheet className="h-4 w-4" />;
      default: return <FileImage className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'uploading': return <Upload className="h-4 w-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || doc.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const openChat = (doc: Document) => {
      setSelectedDocument(doc);
      setChatMessages([]);
  };

  const handleView = (doc: Document) => {
      if (!doc.filePath) {
          toast({ title: 'Error', description: 'File path not available.', variant: 'destructive'});
          return;
      }
      const { data } = supabase.storage.from('documents').getPublicUrl(doc.filePath);
      if (data.publicUrl) {
          window.open(data.publicUrl, '_blank');
      } else {
        toast({ title: 'Error', description: 'Could not get public URL.', variant: 'destructive'});
      }
  };

  const handleDownload = async (doc: Document) => {
    if (!doc.filePath) {
        toast({ title: 'Error', description: 'File path not available.', variant: 'destructive'});
        return;
    }
    try {
        const { data, error } = await supabase.storage.from('documents').download(doc.filePath);
        if (error) throw error;
        const blob = new Blob([data]);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = doc.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: 'Success', description: `${doc.name} downloaded.` });
    } catch (error: any) {
        toast({ title: 'Error', description: `Could not download file: ${error.message}`, variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
      if (!docToDelete || !docToDelete.filePath || !user) return;
      try {
          const { error } = await supabase.storage.from('documents').remove([docToDelete.filePath]);
          if (error) throw error;
          
          // Refresh documents from Supabase after deletion
          const { data: files, error: listError } = await supabase.storage
            .from('documents')
            .list(user.id, {
              limit: 100,
              offset: 0,
              sortBy: { column: 'created_at', order: 'desc' }
            });

          if (!listError && files) {
            const userDocuments: Document[] = files
              .filter(file => file.name && !file.name.startsWith('.'))
              .map(file => ({
                id: file.id || `file-${Date.now()}-${file.name}`,
                name: file.name,
                type: getFileType(file.name),
                size: file.metadata?.size || 0,
                uploadedAt: new Date(file.created_at || Date.now()),
                status: 'completed' as const,
                progress: 100,
                filePath: `${user.id}/${file.name}`
              }));

            setDocuments(userDocuments);
          }
          
          toast({ title: 'Success', description: `${docToDelete.name} deleted.` });
      } catch (error: any) {
        toast({ title: 'Error', description: `Could not delete file: ${error.message}`, variant: 'destructive' });
      } finally {
          setDocToDelete(null);
      }
  };

  const handleRename = () => {
    if (!docToRename) return;
    setDocuments(prev => prev.map(d => d.id === docToRename.id ? { ...d, name: newName } : d));
    toast({ title: 'Success', description: `Renamed to ${newName}.` });
    setDocToRename(null);
    setNewName("");
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full overflow-hidden">
        {/* Main Content Area with Sidebar */}
        <div className="flex gap-8 relative h-full">
          {/* Main Chat Area */}
          <main className="flex-1 transition-all duration-300">
             {selectedDocument ? (
              <Card className="shadow-lg border-0 h-full flex flex-col">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">AI Chat Assistant</CardTitle>
                        <CardDescription className="flex items-center space-x-2">
                          <div className="p-1 bg-gray-200 rounded">
                            {getFileIcon(selectedDocument.type)}
                          </div>
                          <span className="truncate font-medium">{selectedDocument.name}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Ready to chat</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-br from-gray-50 to-blue-50">
                    {chatMessages.length === 0 && (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <MessageSquare className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Your Conversation</h3>
                        <p className="text-gray-600 mb-4">
                          Ask questions about "{selectedDocument.name}" and get instant AI-powered answers.
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setChatInput("What is this document about?")}
                            className="text-xs"
                          >
                            "What is this document about?"
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setChatInput("Summarize the key points")}
                            className="text-xs"
                          >
                            "Summarize the key points"
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setChatInput("What are the main findings?")}
                            className="text-xs"
                          >
                            "What are the main findings?"
                          </Button>
                        </div>
                      </div>
                    )}
                    {chatMessages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} items-end gap-4`}>
                        {msg.sender === 'bot' && (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0">
                            AI
                          </div>
                        )}
                        <div className={`max-w-2xl px-6 py-4 rounded-2xl shadow-sm ${
                          msg.sender === 'user' 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-none' 
                            : 'bg-white border rounded-bl-none shadow-md'
                        }`}>
                          {msg.sender === 'bot' ? (
                            <div className="text-base leading-relaxed">{renderMarkdown(msg.text)}</div>
                          ) : (
                            <span className="text-base">{msg.text}</span>
                          )}
                          <div className="flex items-center gap-3 mt-3 text-xs opacity-70">
                            <span>{new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {msg.sender === 'bot' && (
                              <>
                                <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                                  <ThumbsUp className="h-4 w-4" />
                                </button>
                                <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                                  <ThumbsDown className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        {msg.sender === 'user' && (
                          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-bold text-sm shadow-lg flex-shrink-0">
                            You
                          </div>
                        )}
                      </div>
                    ))}
                    {isChatting && (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                          AI
                        </div>
                        <div className="p-4 rounded-lg bg-white border shadow-md">
                          <div className="flex space-x-2">
                            <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <form onSubmit={handleChatSubmit} className="p-4 border-t bg-white">
                    <div className="flex items-end space-x-4">
                      <div className="flex-1">
                        <Input
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Ask anything about your document..."
                          disabled={isChatting}
                          className="h-14 text-base"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Press Enter to send, Shift+Enter for new line
                        </p>
                      </div>
                      <Button 
                        type="submit" 
                        disabled={isChatting}
                        size="lg"
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 h-14 px-8"
                      >
                        {isChatting ? 'Sending...' : 'Send Message'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-lg border-0 h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="text-center p-12 max-w-md">
                  <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                    <MessageSquare className="h-16 w-16 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Welcome to AI Chat</h3>
                  <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                    Select a document from the sidebar to start an intelligent conversation with your AI assistant.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                      <Zap className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">Powered by Advanced AI</span>
                    </div>
                    <div className="grid grid-cols-1 gap-3 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Ask questions about your documents</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Get instant summaries and insights</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Extract key information quickly</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </main>
          
          {/* Expandable Sidebar */}
          <aside className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-[400px]' : 'w-0'} h-full`}>
            <Card className="shadow-lg border-0 h-full flex flex-col overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <span>Your Documents</span>
                  </CardTitle>
                  <Badge variant="secondary">
                    {filteredDocuments.length} files
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col">
                <div className="p-4 border-b space-y-4">
                  <Input
                    type="file"
                    multiple
                    accept=".docx,.pdf,.xlsx,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload-sidebar"
                  />
                  <Button asChild size="lg" className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                    <label htmlFor="file-upload-sidebar" className="cursor-pointer w-full flex items-center justify-center">
                      <Upload className="h-5 w-5 mr-2" />
                      Upload Documents
                    </label>
                  </Button>
                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search documents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 h-10"
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <Filter className="h-4 w-4 mr-2" />
                          Filter ({selectedFilter === 'all' ? 'All' : selectedFilter.toUpperCase()})
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[350px]">
                        <DropdownMenuLabel>File Type</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setSelectedFilter('all')}>All Files</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedFilter('docx')}>DOCX Files</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedFilter('pdf')}>PDF Files</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedFilter('xlsx')}>XLSX Files</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                {filteredDocuments.length > 0 ? (
                  <div className="overflow-y-auto flex-1">
                    <Table>
                      <TableHeader><TableRow><TableHead>Document</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {filteredDocuments.map((doc) => (
                          <TableRow key={doc.id} className="hover:bg-gray-50 transition-colors">
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gray-100 rounded-lg">{getFileIcon(doc.type)}</div>
                                <div>
                                  <span className="font-medium text-gray-900 text-sm block truncate w-48">{doc.name}</span>
                                  <span className="text-gray-500 text-xs">{formatFileSize(doc.size)} - {doc.uploadedAt.toLocaleDateString()}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openChat(doc)} className="cursor-pointer">
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Chat with AI
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleView(doc)} className="cursor-pointer">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Document
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => { setDocToRename(doc); setNewName(doc.name); }} className="cursor-pointer">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Rename
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDownload(doc)} className="cursor-pointer">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={() => setDocToDelete(doc)}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : isLoading ? (
                  <div className="flex-1 flex items-center justify-center text-center p-4">
                    <div>
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-gray-500 text-sm font-medium">Loading your documents...</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-center p-4">
                    <div>
                      <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 text-sm font-medium">No documents found</p>
                      <p className="text-gray-400 text-xs">Upload some to get started</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>

          {/* Sidebar Toggle Button */}
          <div className={`absolute top-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'right-[380px]' : '-right-5'}`}>
             <Button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              size="icon"
              className="rounded-full h-10 w-10 bg-white/80 backdrop-blur-sm border border-slate-200 shadow-md hover:bg-slate-50 text-slate-600"
            >
              {isSidebarOpen ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Alert Dialogs */}
      {docToDelete && (
        <AlertDialog open onOpenChange={() => setDocToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Document</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{docToDelete.name}" from storage. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {docToRename && (
        <AlertDialog open onOpenChange={() => setDocToRename(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Rename Document</AlertDialogTitle>
              <AlertDialogDescription>
                Enter a new name for "{docToRename.name}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Input 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter new name..."
                autoFocus
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRename}>
                Rename
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default DocumentProcessor; 