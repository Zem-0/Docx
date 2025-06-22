export interface DocumentMetadata {
  title?: string;
  author?: string;
  created?: Date;
  modified?: Date;
  pages?: number;
  wordCount?: number;
  language?: string;
  category?: string;
  tags?: string[];
}

export interface ProcessedDocument {
  id: string;
  name: string;
  type: 'docx' | 'pdf' | 'xlsx' | 'image';
  size: number;
  uploadedAt: Date;
  status: 'processing' | 'completed' | 'error';
  extractedText?: string;
  metadata?: DocumentMetadata;
  content?: {
    paragraphs: string[];
    tables: Array<Array<string[]>>;
    images: string[];
    headers: string[];
    footers: string[];
  };
  analysis?: {
    sentiment: 'positive' | 'negative' | 'neutral';
    keyPhrases: string[];
    entities: Array<{ name: string; type: string; confidence: number }>;
    summary: string;
  };
}

export class DocumentProcessor {
  private static instance: DocumentProcessor;

  private constructor() {}

  static getInstance(): DocumentProcessor {
    if (!DocumentProcessor.instance) {
      DocumentProcessor.instance = new DocumentProcessor();
    }
    return DocumentProcessor.instance;
  }

  async processDocument(file: File): Promise<ProcessedDocument> {
    const document: ProcessedDocument = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: this.getFileType(file.name),
      size: file.size,
      uploadedAt: new Date(),
      status: 'processing'
    };

    try {
      if (document.type === 'docx') {
        return await this.processDocxFile(file, document);
      } else if (document.type === 'pdf') {
        return await this.processPdfFile(file, document);
      } else if (document.type === 'xlsx') {
        return await this.processXlsxFile(file, document);
      } else {
        return await this.processImageFile(file, document);
      }
    } catch (error) {
      document.status = 'error';
      throw error;
    }
  }

  private getFileType(filename: string): ProcessedDocument['type'] {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'docx': return 'docx';
      case 'pdf': return 'pdf';
      case 'xlsx': return 'xlsx';
      default: return 'image';
    }
  }

  private async processDocxFile(file: File, document: ProcessedDocument): Promise<ProcessedDocument> {
    // Simulate DOCX processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    document.status = 'completed';
    document.extractedText = this.generateSampleDocxText();
    document.metadata = {
      title: 'Sample Financial Document',
      author: 'John Doe',
      created: new Date('2024-01-15'),
      modified: new Date(),
      pages: 5,
      wordCount: 1250,
      language: 'en',
      category: 'financial',
      tags: ['contract', 'agreement', 'financial']
    };

    document.content = {
      paragraphs: [
        'This is a sample financial document containing important information about our business operations.',
        'The document outlines key financial metrics and performance indicators for the current fiscal year.',
        'All financial data has been reviewed and verified by our accounting department.',
        'This agreement is binding and enforceable under applicable laws and regulations.',
        'Please review all terms and conditions carefully before proceeding.'
      ],
      tables: [
        [
          ['Revenue', 'Q1', 'Q2', 'Q3', 'Q4'],
          ['Sales', '$1.2M', '$1.5M', '$1.8M', '$2.1M'],
          ['Expenses', '$800K', '$900K', '$1.1M', '$1.3M'],
          ['Profit', '$400K', '$600K', '$700K', '$800K']
        ]
      ],
      images: ['chart1.png', 'logo.png'],
      headers: ['Financial Report 2024', 'Confidential'],
      footers: ['Page 1 of 5', 'Generated on 2024-01-15']
    };

    document.analysis = {
      sentiment: 'positive',
      keyPhrases: ['financial performance', 'revenue growth', 'profit margins', 'business operations'],
      entities: [
        { name: 'John Doe', type: 'PERSON', confidence: 0.95 },
        { name: 'Financial Report 2024', type: 'DOCUMENT', confidence: 0.88 },
        { name: 'Accounting Department', type: 'ORGANIZATION', confidence: 0.92 }
      ],
      summary: 'This financial document contains positive performance indicators with strong revenue growth and improved profit margins across all quarters.'
    };

    return document;
  }

  private async processPdfFile(file: File, document: ProcessedDocument): Promise<ProcessedDocument> {
    // Simulate PDF processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    document.status = 'completed';
    document.extractedText = this.generateSamplePdfText();
    document.metadata = {
      title: 'Financial Statement',
      author: 'Finance Team',
      created: new Date('2024-01-10'),
      modified: new Date(),
      pages: 3,
      wordCount: 800,
      language: 'en',
      category: 'statement',
      tags: ['statement', 'financial', 'report']
    };

    return document;
  }

  private async processXlsxFile(file: File, document: ProcessedDocument): Promise<ProcessedDocument> {
    // Simulate XLSX processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    document.status = 'completed';
    document.extractedText = 'Spreadsheet data extracted successfully';
    document.metadata = {
      title: 'Financial Data',
      author: 'Data Analyst',
      created: new Date('2024-01-12'),
      modified: new Date(),
      pages: 1,
      wordCount: 0,
      language: 'en',
      category: 'spreadsheet',
      tags: ['data', 'spreadsheet', 'financial']
    };

    return document;
  }

  private async processImageFile(file: File, document: ProcessedDocument): Promise<ProcessedDocument> {
    // Simulate image processing
    await new Promise(resolve => setTimeout(resolve, 500));

    document.status = 'completed';
    document.extractedText = 'Image processed successfully';
    document.metadata = {
      title: file.name,
      author: 'User',
      created: new Date(),
      modified: new Date(),
      pages: 1,
      wordCount: 0,
      language: 'en',
      category: 'image',
      tags: ['image', 'visual']
    };

    return document;
  }

  private generateSampleDocxText(): string {
    return `This is a comprehensive financial document that outlines our company's performance and strategic direction for the upcoming fiscal year.

Key Highlights:
- Revenue increased by 25% compared to the previous year
- Profit margins improved by 3.5 percentage points
- Market share expanded in key segments
- Operational efficiency metrics show positive trends

Financial Performance:
Our financial performance has been strong across all key metrics. The revenue growth of 25% was driven by increased market demand and successful product launches. Profit margins improved due to cost optimization initiatives and improved operational efficiency.

Strategic Initiatives:
We have identified several strategic initiatives that will drive future growth:
1. Market expansion into new geographic regions
2. Product development and innovation
3. Digital transformation and automation
4. Strategic partnerships and acquisitions

Risk Management:
Our risk management framework has been strengthened to address emerging challenges in the market. We have implemented comprehensive monitoring systems and contingency plans to ensure business continuity.

Outlook:
Based on current market conditions and our strategic initiatives, we project continued growth in the coming year. We remain committed to delivering value to our stakeholders while maintaining strong financial discipline.`;
  }

  private generateSamplePdfText(): string {
    return `Financial Statement Summary

This document contains the official financial statement for the reporting period. All figures have been audited and verified by our external auditors.

Statement of Financial Position:
- Total Assets: $50,000,000
- Total Liabilities: $20,000,000
- Shareholders' Equity: $30,000,000

Income Statement:
- Revenue: $15,000,000
- Expenses: $12,000,000
- Net Income: $3,000,000

Cash Flow Statement:
- Operating Cash Flow: $3,500,000
- Investing Cash Flow: -$2,000,000
- Financing Cash Flow: -$500,000
- Net Cash Flow: $1,000,000`;
  }

  async analyzeDocument(document: ProcessedDocument): Promise<ProcessedDocument> {
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!document.analysis) {
      document.analysis = {
        sentiment: 'neutral',
        keyPhrases: ['document', 'content', 'information'],
        entities: [],
        summary: 'Document analyzed successfully.'
      };
    }

    return document;
  }

  async exportDocument(document: ProcessedDocument, format: 'pdf' | 'docx' | 'txt'): Promise<Blob> {
    // Simulate document export
    await new Promise(resolve => setTimeout(resolve, 500));

    const content = document.extractedText || 'No content available';
    return new Blob([content], { type: 'text/plain' });
  }

  async searchDocuments(documents: ProcessedDocument[], query: string): Promise<ProcessedDocument[]> {
    const searchTerm = query.toLowerCase();
    return documents.filter(doc => 
      doc.name.toLowerCase().includes(searchTerm) ||
      doc.extractedText?.toLowerCase().includes(searchTerm) ||
      doc.metadata?.title?.toLowerCase().includes(searchTerm) ||
      doc.metadata?.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  async getDocumentStats(documents: ProcessedDocument[]): Promise<{
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    totalSize: number;
    averageProcessingTime: number;
  }> {
    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let totalSize = 0;

    documents.forEach(doc => {
      byType[doc.type] = (byType[doc.type] || 0) + 1;
      byStatus[doc.status] = (byStatus[doc.status] || 0) + 1;
      totalSize += doc.size;
    });

    return {
      total: documents.length,
      byType,
      byStatus,
      totalSize,
      averageProcessingTime: 2.5 // Simulated average processing time in seconds
    };
  }
}

export const documentProcessor = DocumentProcessor.getInstance(); 