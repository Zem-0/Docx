import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Share2, 
  Edit, 
  Eye, 
  FileText, 
  Calendar,
  User,
  Tag,
  BarChart3,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { ProcessedDocument } from '@/lib/documentProcessor';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DocumentViewerProps {
  document: ProcessedDocument;
  onClose?: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, onClose }) => {
  const [activeTab, setActiveTab] = useState('content');

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="h-4 w-4" />;
      case 'negative': return <AlertCircle className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-blue-500" />
            <div>
              <h2 className="text-xl font-semibold">{document.name}</h2>
              <p className="text-sm text-gray-500">
                {document.metadata?.title || 'Untitled Document'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="border-b px-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6 h-full overflow-y-auto">
              <TabsContent value="content" className="h-full">
                <div className="space-y-6">
                  {/* Document Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>Document Content</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none">
                        {document.extractedText ? (
                          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                            {document.extractedText}
                          </div>
                        ) : (
                          <p className="text-gray-500">No content available</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tables */}
                  {document.content?.tables && document.content.tables.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Tables</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {document.content.tables.map((table, tableIndex) => (
                          <div key={tableIndex} className="mb-6">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  {table[0]?.map((header, headerIndex) => (
                                    <TableHead key={headerIndex}>{header}</TableHead>
                                  ))}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {table.slice(1).map((row, rowIndex) => (
                                  <TableRow key={rowIndex}>
                                    {row.map((cell, cellIndex) => (
                                      <TableCell key={cellIndex}>{cell}</TableCell>
                                    ))}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Images */}
                  {document.content?.images && document.content.images.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Images</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {document.content.images.map((image, index) => (
                            <div key={index} className="border rounded-lg p-4 text-center">
                              <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center mb-2">
                                <FileText className="h-8 w-8 text-gray-400" />
                              </div>
                              <p className="text-sm text-gray-600">{image}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="metadata" className="h-full">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Document Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <User className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium">Author</p>
                              <p className="text-sm text-gray-600">
                                {document.metadata?.author || 'Unknown'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium">Created</p>
                              <p className="text-sm text-gray-600">
                                {document.metadata?.created ? formatDate(document.metadata.created) : 'Unknown'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium">Modified</p>
                              <p className="text-sm text-gray-600">
                                {document.metadata?.modified ? formatDate(document.metadata.modified) : 'Unknown'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium">Pages</p>
                            <p className="text-sm text-gray-600">
                              {document.metadata?.pages || 'Unknown'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Word Count</p>
                            <p className="text-sm text-gray-600">
                              {document.metadata?.wordCount?.toLocaleString() || 'Unknown'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Language</p>
                            <p className="text-sm text-gray-600">
                              {document.metadata?.language?.toUpperCase() || 'Unknown'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Category</p>
                            <p className="text-sm text-gray-600">
                              {document.metadata?.category || 'Uncategorized'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {document.metadata?.tags && document.metadata.tags.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Tag className="h-5 w-5" />
                          <span>Tags</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {document.metadata.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="analysis" className="h-full">
                <div className="space-y-6">
                  {document.analysis && (
                    <>
                      <Card>
                        <CardHeader>
                          <CardTitle>Document Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            {/* Sentiment Analysis */}
                            <div>
                              <h4 className="font-medium mb-3">Sentiment Analysis</h4>
                              <div className="flex items-center space-x-3">
                                {getSentimentIcon(document.analysis.sentiment)}
                                <Badge className={getSentimentColor(document.analysis.sentiment)}>
                                  {document.analysis.sentiment.charAt(0).toUpperCase() + document.analysis.sentiment.slice(1)}
                                </Badge>
                              </div>
                            </div>

                            {/* Summary */}
                            <div>
                              <h4 className="font-medium mb-3">Summary</h4>
                              <p className="text-gray-700 leading-relaxed">
                                {document.analysis.summary}
                              </p>
                            </div>

                            {/* Key Phrases */}
                            {document.analysis.keyPhrases && document.analysis.keyPhrases.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-3">Key Phrases</h4>
                                <div className="flex flex-wrap gap-2">
                                  {document.analysis.keyPhrases.map((phrase, index) => (
                                    <Badge key={index} variant="outline">
                                      {phrase}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Entities */}
                            {document.analysis.entities && document.analysis.entities.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-3">Identified Entities</h4>
                                <div className="space-y-2">
                                  {document.analysis.entities.map((entity, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                      <div>
                                        <p className="font-medium">{entity.name}</p>
                                        <p className="text-sm text-gray-600">{entity.type}</p>
                                      </div>
                                      <Badge variant="secondary">
                                        {Math.round(entity.confidence * 100)}%
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="preview" className="h-full">
                <Card>
                  <CardHeader>
                    <CardTitle>Document Preview</CardTitle>
                    <CardDescription>
                      Preview of the document as it would appear in its original format
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg p-8 bg-white shadow-sm">
                      <div className="max-w-4xl mx-auto">
                        {/* Document Header */}
                        {document.content?.headers && document.content.headers.length > 0 && (
                          <div className="text-center mb-8 pb-4 border-b">
                            {document.content.headers.map((header, index) => (
                              <h1 key={index} className="text-2xl font-bold text-gray-900 mb-2">
                                {header}
                              </h1>
                            ))}
                          </div>
                        )}

                        {/* Document Content */}
                        <div className="prose max-w-none">
                          {document.content?.paragraphs && document.content.paragraphs.map((paragraph, index) => (
                            <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                              {paragraph}
                            </p>
                          ))}
                        </div>

                        {/* Document Footer */}
                        {document.content?.footers && document.content.footers.length > 0 && (
                          <div className="text-center mt-8 pt-4 border-t text-sm text-gray-500">
                            {document.content.footers.map((footer, index) => (
                              <p key={index}>{footer}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer; 