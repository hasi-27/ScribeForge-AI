import React, { useState } from 'react';
import { PostObject, ValidationSummary } from '../types';
import { X, Save, AlertCircle } from 'lucide-react';

interface EditPostModalProps {
  post: PostObject;
  generationId: string;
  onClose: () => void;
  onSave: (updatedPost: PostObject, validation: ValidationSummary) => void;
  onSaveApi: (genId: string, postNum: number, data: Partial<PostObject>) => Promise<{ post: PostObject; validation: ValidationSummary }>;
}

export const EditPostModal: React.FC<EditPostModalProps> = ({
  post,
  generationId,
  onClose,
  onSave,
  onSaveApi
}) => {
  const [caption, setCaption] = useState(post.caption);
  const [visualDirection, setVisualDirection] = useState(post.visual_direction);
  const [hashtagsStr, setHashtagsStr] = useState(post.hashtags.join(' '));
  const [date, setDate] = useState(post.date);
  const [contentAngle, setContentAngle] = useState(post.content_angle || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const hashtags = hashtagsStr
        .split(/[\s,]+/)
        .map(t => t.trim())
        .filter(t => t.length > 0)
        .map(t => (t.startsWith('#') ? t : `#${t}`));

      const payload: Partial<PostObject> = {
        caption,
        visual_direction: visualDirection,
        hashtags,
        date,
        content_angle: contentAngle
      };

      const result = await onSaveApi(generationId, post.post_number, payload);
      onSave(result.post, result.validation);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update post');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>Edit Post #{post.post_number}</h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Refine caption, visual cues, date, or hashtags. Changes are validated automatically.
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Scheduled Date</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Strategic Topic Angle</label>
              <input
                type="text"
                className="form-input"
                value={contentAngle}
                onChange={(e) => setContentAngle(e.target.value)}
                placeholder="e.g. Craftsmanship / Location"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Social Media Post Caption</label>
            <textarea
              className="form-textarea"
              rows={6}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Post caption text..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Image / Creative Visual Direction</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={visualDirection}
              onChange={(e) => setVisualDirection(e.target.value)}
              placeholder="Actionable scene, lighting, and composition cues..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Hashtags (separated by spaces or commas)</label>
            <input
              type="text"
              className="form-input"
              value={hashtagsStr}
              onChange={(e) => setHashtagsStr(e.target.value)}
              placeholder="#Brand #Industry #Topic"
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
            <Save size={16} />
            <span>{isSaving ? 'Saving Changes...' : 'Save & Re-Validate'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
