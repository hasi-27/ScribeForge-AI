import React, { useState } from 'react';
import { GenerationRecord } from '../types';
import { X, Download, Copy, Check, FileText, FileCode, FileSpreadsheet } from 'lucide-react';

interface ExportModalProps {
  generation: GenerationRecord;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ generation, onClose }) => {
  const [copied, setCopied] = useState(false);

  // Generate CSV
  const generateCSV = () => {
    const headers = ['Post Number', 'Date', 'Format', 'Strategic Angle', 'Caption', 'Visual Direction', 'Hashtags'];
    const rows = generation.posts.map(p => [
      p.post_number,
      `"${p.date}"`,
      `"${p.content_type}"`,
      `"${(p.content_angle || '').replace(/"/g, '""')}"`,
      `"${p.caption.replace(/"/g, '""')}"`,
      `"${p.visual_direction.replace(/"/g, '""')}"`,
      `"${p.hashtags.join(' ')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile(csvContent, `${generation.industry}_${generation.duration}_plan.csv`, 'text/csv');
  };

  // Generate JSON
  const generateJSON = () => {
    const jsonContent = JSON.stringify(generation, null, 2);
    downloadFile(jsonContent, `${generation.industry}_${generation.duration}_plan.json`, 'application/json');
  };

  // Generate Markdown
  const generateMarkdown = () => {
    let md = `# Social Media Content Plan: ${generation.industry}\n\n`;
    md += `**Plan Duration**: ${generation.duration} (${generation.post_count} posts)\n`;
    md += `**Content Format**: ${generation.content_type}\n`;
    md += `**Generated Date**: ${new Date(generation.created_at).toLocaleDateString()}\n\n`;
    md += `---\n\n`;

    generation.posts.forEach(p => {
      md += `## Post #${p.post_number} (${p.date}) - [${p.content_angle || 'Spotlight'}]\n\n`;
      md += `### Caption\n${p.caption}\n\n`;
      md += `### Visual Direction\n${p.visual_direction}\n\n`;
      md += `### Hashtags\n${p.hashtags.join(' ')}\n\n`;
      if (p.reference_basis && p.reference_basis.length > 0) {
        md += `> **Grounding Citation**: ${p.reference_basis.join('; ')}\n\n`;
      }
      md += `---\n\n`;
    });

    downloadFile(md, `${generation.industry}_${generation.duration}_plan.md`, 'text/markdown');
  };

  const copyFormattedText = () => {
    let text = `SOCIAL MEDIA CONTENT PLAN: ${generation.industry.toUpperCase()} (${generation.duration} / ${generation.post_count} Posts)\n\n`;
    generation.posts.forEach(p => {
      text += `========================================\n`;
      text += `POST #${p.post_number} | ${p.date} | ${p.content_type} | ${p.content_angle || 'Spotlight'}\n`;
      text += `========================================\n\n`;
      text += `CAPTION:\n${p.caption}\n\n`;
      text += `VISUAL DIRECTION:\n${p.visual_direction}\n\n`;
      text += `HASHTAGS:\n${p.hashtags.join(' ')}\n\n\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace(/\s+/g, '_');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>Export Social Media Plan</h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Download or copy your complete {generation.industry} content plan in multiple formats.
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <button
            className="btn btn-secondary"
            style={{ padding: '20px', flexDirection: 'column', gap: '10px', height: 'auto' }}
            onClick={generateCSV}
          >
            <FileSpreadsheet size={28} className="text-emerald-400" />
            <div style={{ fontWeight: 700 }}>Spreadsheet (CSV)</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>For Excel, Google Sheets & Notion</div>
          </button>

          <button
            className="btn btn-secondary"
            style={{ padding: '20px', flexDirection: 'column', gap: '10px', height: 'auto' }}
            onClick={generateMarkdown}
          >
            <FileText size={28} className="text-cyan-400" />
            <div style={{ fontWeight: 700 }}>Markdown (.md)</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>For documentation & project wikis</div>
          </button>

          <button
            className="btn btn-secondary"
            style={{ padding: '20px', flexDirection: 'column', gap: '10px', height: 'auto' }}
            onClick={generateJSON}
          >
            <FileCode size={28} className="text-indigo-400" />
            <div style={{ fontWeight: 700 }}>Structured JSON</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>For API integration & automation tools</div>
          </button>

          <button
            className="btn btn-secondary"
            style={{ padding: '20px', flexDirection: 'column', gap: '10px', height: 'auto' }}
            onClick={copyFormattedText}
          >
            {copied ? <Check size={28} className="text-emerald-400" /> : <Copy size={28} className="text-pink-400" />}
            <div style={{ fontWeight: 700 }}>{copied ? 'Copied to Clipboard!' : 'Copy Formatted Text'}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Ready to paste directly into social apps</div>
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
