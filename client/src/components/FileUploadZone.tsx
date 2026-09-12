import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle, Trash2, Eye, AlertCircle, FileSpreadsheet, FileCode, Sparkles } from 'lucide-react';
import { ParsedReferenceFile } from '../types';

interface FileUploadZoneProps {
  availableFiles: ParsedReferenceFile[];
  selectedFileIds: string[];
  onToggleFileSelection: (fileId: string) => void;
  onFileUpload: (file: File) => Promise<void>;
  onDeleteFile: (fileId: string) => Promise<void>;
  onInspectFile: (file: ParsedReferenceFile) => void;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  availableFiles,
  selectedFileIds,
  onToggleFileSelection,
  onFileUpload,
  onDeleteFile,
  onInspectFile
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setUploadError(null);
    setIsUploading(true);
    try {
      await onFileUpload(file);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload and parse file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText className="text-red-400" size={16} />;
    if (ext === 'xlsx' || ext === 'xls') return <FileSpreadsheet className="text-emerald-400" size={16} />;
    if (ext === 'docx' || ext === 'doc') return <FileCode className="text-blue-400" size={16} />;
    return <FileText className="text-amber-400" size={16} />;
  };

  return (
    <div className="glass-panel" style={{ padding: '20px' }}>
      <div className="section-title">
        <h3>
          <UploadCloud size={18} className="text-indigo-400" />
          <span>4. Reference File Intelligence</span>
        </h3>
        <span className="step-indicator" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
          Grounding Context
        </span>
      </div>

      <div
        className={`dropzone-container ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
          style={{ display: 'none' }}
          onChange={handleFileInputChange}
        />
        <UploadCloud className="dropzone-icon" />
        <div className="dropzone-title">
          {isUploading ? 'Parsing & Indexing Document...' : 'Drag & drop reference file or Browse'}
        </div>
        <div className="dropzone-sub">
          Supports PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX, TXT, Images (JPG/PNG)
        </div>
      </div>

      {uploadError && (
        <div style={{ marginTop: '10px', color: '#f87171', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertCircle size={14} />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Available Reference Documents List */}
      {availableFiles.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
            Reference Knowledge Vault ({selectedFileIds.length} active)
          </div>
          <div className="uploaded-files-list">
            {availableFiles.map((file) => {
              const isSelected = selectedFileIds.includes(file.id);

              return (
                <div
                  key={file.id}
                  className="file-item"
                  style={{
                    borderColor: isSelected ? 'rgba(99, 102, 241, 0.5)' : undefined,
                    background: isSelected ? 'rgba(99, 102, 241, 0.08)' : undefined
                  }}
                >
                  <div
                    className="file-info"
                    style={{ cursor: 'pointer', flex: 1 }}
                    onClick={() => onToggleFileSelection(file.id)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleFileSelection(file.id)}
                      style={{ cursor: 'pointer', accentColor: '#6366f1' }}
                    />
                    {getFileIcon(file.original_name)}
                    <span className="file-name" title={file.original_name}>
                      {file.original_name}
                    </span>
                    <span className="file-badge-chunks">
                      {file.chunks?.length || 1} chunks
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 8px' }}
                      title="Inspect extracted chunks and summary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onInspectFile(file);
                      }}
                    >
                      <Eye size={13} />
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 8px', color: '#f87171' }}
                      title="Remove file"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFile(file.id);
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
