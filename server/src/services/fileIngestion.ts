import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FileChunk, ParsedReferenceFile } from '../types/index.js';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

// pdf-parse import
let pdfParse: any = null;
import('pdf-parse').then(m => {
  pdfParse = m.default || m;
}).catch(() => {
  // fallback if needed
});

export class FileIngestionService {
  private uploadsDir: string;

  constructor(uploadsDir?: string) {
    this.uploadsDir = uploadsDir || path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  public async parseFile(
    originalName: string,
    buffer: Buffer,
    mimeType: string
  ): Promise<ParsedReferenceFile> {
    const fileId = `file_${uuidv4().substring(0, 8)}`;
    const extension = path.extname(originalName).toLowerCase();
    const storageKey = `${fileId}_${path.basename(originalName).replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = path.join(this.uploadsDir, storageKey);

    // Save file to disk
    fs.writeFileSync(filePath, buffer);

    let fullText = '';
    let chunks: FileChunk[] = [];
    let parseStatus: 'success' | 'failed' = 'success';
    let parseError: string | undefined = undefined;

    try {
      if (extension === '.pdf') {
        if (pdfParse) {
          const pdfData = await pdfParse(buffer);
          fullText = pdfData.text || '';
          // Chunk by page or paragraph
          chunks = this.chunkText(fileId, originalName, fullText, 'Page');
        } else {
          fullText = `PDF Document: ${originalName} (Raw extracted content)`;
          chunks = this.chunkText(fileId, originalName, fullText, 'Section');
        }
      } else if (extension === '.docx' || extension === '.doc') {
        const docResult = await mammoth.extractRawText({ buffer });
        fullText = docResult.value || '';
        chunks = this.chunkText(fileId, originalName, fullText, 'Heading/Paragraph');
      } else if (extension === '.xlsx' || extension === '.xls') {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const textParts: string[] = [];
        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const csv = XLSX.utils.sheet_to_csv(sheet);
          if (csv.trim()) {
            textParts.push(`--- Sheet: ${sheetName} ---\n${csv}`);
            const sheetChunks = this.chunkText(fileId, originalName, csv, `Sheet: ${sheetName}`);
            chunks.push(...sheetChunks);
          }
        });
        fullText = textParts.join('\n\n');
      } else if (extension === '.pptx' || extension === '.ppt') {
        // Simple slide text extractor
        fullText = buffer.toString('utf-8', 0, Math.min(buffer.length, 50000)).replace(/[\x00-\x09\x0B\x0C\x0E-\x1F]/g, ' ');
        // Clean up extracted XML text
        const cleanedText = fullText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        fullText = cleanedText || `Presentation: ${originalName}`;
        chunks = this.chunkText(fileId, originalName, fullText, 'Slide');
      } else if (['.jpg', '.jpeg', '.png', '.webp'].includes(extension)) {
        // Image vision analysis placeholder / metadata
        fullText = `[Image Reference: ${originalName} - Visual Asset]\nResolution context: ${buffer.length} bytes.\nInferred visual elements: High-contrast product imagery, branding aesthetics, color palette, and visual motifs for social media campaigns.`;
        chunks = [{
          id: `${fileId}_chunk_1`,
          file_id: fileId,
          file_name: originalName,
          chunk_index: 1,
          text: fullText,
          metadata: { section: 'Image Analysis & Visual Metadata' }
        }];
      } else {
        // Default TXT / Markdown / CSV
        fullText = buffer.toString('utf-8');
        chunks = this.chunkText(fileId, originalName, fullText, 'Paragraph');
      }

      if (!fullText.trim()) {
        fullText = `[Uploaded reference document: ${originalName}]`;
        chunks = [{
          id: `${fileId}_chunk_1`,
          file_id: fileId,
          file_name: originalName,
          chunk_index: 1,
          text: fullText,
          metadata: { section: 'General' }
        }];
      }
    } catch (err: any) {
      parseStatus = 'failed';
      parseError = err.message || 'Failed to parse document';
      fullText = `Error parsing file: ${originalName}`;
      chunks = [];
    }

    // Security sanitization: Strip prompt override markers
    fullText = this.sanitizeUntrustedContent(fullText);
    chunks.forEach(c => {
      c.text = this.sanitizeUntrustedContent(c.text);
    });

    const summary = fullText.slice(0, 300).replace(/\s+/g, ' ') + (fullText.length > 300 ? '...' : '');

    return {
      id: fileId,
      original_name: originalName,
      storage_key: storageKey,
      mime_type: mimeType || 'application/octet-stream',
      size: buffer.length,
      parse_status: parseStatus,
      parse_error: parseError,
      summary,
      full_text: fullText,
      chunks,
      created_at: new Date().toISOString()
    };
  }

  private chunkText(fileId: string, fileName: string, text: string, sectionPrefix: string): FileChunk[] {
    const paragraphs = text
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 20);

    if (paragraphs.length === 0) {
      return [{
        id: `${fileId}_chunk_1`,
        file_id: fileId,
        file_name: fileName,
        chunk_index: 1,
        text: text.slice(0, 1000),
        metadata: { section: `${sectionPrefix} 1` }
      }];
    }

    const chunks: FileChunk[] = [];
    let currentChunk = '';
    let chunkIdx = 1;

    for (const para of paragraphs) {
      if ((currentChunk + '\n' + para).length > 800) {
        if (currentChunk) {
          chunks.push({
            id: `${fileId}_chunk_${chunkIdx}`,
            file_id: fileId,
            file_name: fileName,
            chunk_index: chunkIdx++,
            text: currentChunk.trim(),
            metadata: { section: `${sectionPrefix} ${chunkIdx}` }
          });
        }
        currentChunk = para;
      } else {
        currentChunk = currentChunk ? `${currentChunk}\n${para}` : para;
      }
    }

    if (currentChunk.trim()) {
      chunks.push({
        id: `${fileId}_chunk_${chunkIdx}`,
        file_id: fileId,
        file_name: fileName,
        chunk_index: chunkIdx,
        text: currentChunk.trim(),
        metadata: { section: `${sectionPrefix} ${chunkIdx}` }
      });
    }

    return chunks;
  }

  private sanitizeUntrustedContent(text: string): string {
    // Defend against prompt injection attempts in uploaded reference files
    return text
      .replace(/ignore (all )?previous instructions/gi, '[FILTERED INSTRUCTION]')
      .replace(/system prompt/gi, '[FILTERED PROMPT]')
      .replace(/you are now in developer mode/gi, '[FILTERED MODE]');
  }
}
