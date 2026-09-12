import React from 'react';
import { ParsedReferenceFile } from '../types';
import { X, FileText, Database, Layers, CheckCircle } from 'lucide-react';

interface FileChunkDrawerProps {
  file: ParsedReferenceFile | null;
  onClose: () => void;
}

export const FileChunkDrawer: React.FC<FileChunkDrawerProps> = ({ file, onClose }) => {
  if (!file) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={20} className="text-emerald-400" />
              <span>Reference File Intelligence & Chunks</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              {file.original_name} • {(file.size / 1024).toFixed(1)} KB • {file.mime_type}
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Summary Card */}
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '10px',
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            marginBottom: '16px'
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', marginBottom: '4px' }}>
            Extracted Knowledge Summary
          </div>
          <div style={{ fontSize: '0.88rem', color: '#e2e8f0', lineHeight: 1.5 }}>
            {file.summary || 'No summary generated.'}
          </div>
        </div>

        {/* Extracted Chunks List */}
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>
            Structural Chunks ({file.chunks?.length || 0} Grounding Units)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '380px', overflowY: 'auto' }}>
            {file.chunks?.map((chunk, idx) => (
              <div
                key={chunk.id || idx}
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  fontSize: '0.82rem',
                  lineHeight: 1.5
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700, color: '#818cf8', fontFamily: 'monospace' }}>
                    Chunk #{chunk.chunk_index}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    {chunk.metadata?.section || 'Default Section'}
                  </span>
                </div>
                <div style={{ color: '#cbd5e1', whiteSpace: 'pre-line' }}>{chunk.text}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
