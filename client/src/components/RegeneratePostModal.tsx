import React, { useState } from 'react';
import { PostObject } from '../types';
import { X, RefreshCw, Sparkles, AlertCircle } from 'lucide-react';

interface RegeneratePostModalProps {
  post: PostObject;
  generationId: string;
  onClose: () => void;
  onRegenerate: (genId: string, postNum: number, instruction?: string) => Promise<void>;
}

export const RegeneratePostModal: React.FC<RegeneratePostModalProps> = ({
  post,
  generationId,
  onClose,
  onRegenerate
}) => {
  const [instruction, setInstruction] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegenerate = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      await onRegenerate(generationId, post.post_number, instruction);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to regenerate post');
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCw size={18} className="text-indigo-400" />
              <span>Regenerate Post #{post.post_number}</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Generate an entirely new creative variation while preserving the scheduled plan structure.
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#f87171', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
              Current Angle
            </div>
            <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{post.content_angle || 'Core Spotlight'}</div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Optional Direction / Instruction for AI
            </label>
            <textarea
              className="form-textarea"
              rows={4}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g. Focus on nighttime luxury lighting, highlight 18k filigree craftsmanship, or make the opening hook more provocative..."
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={isProcessing}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleRegenerate} disabled={isProcessing}>
            <Sparkles size={16} />
            <span>{isProcessing ? 'Regenerating Post...' : 'Generate New Variation'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
