import React, { useState } from 'react';
import { PostObject } from '../types';
import { Copy, Check, Edit3, RefreshCw, Eye, Sparkles, Hash, Calendar, Layers, BookOpen } from 'lucide-react';

interface PostCardProps {
  post: PostObject;
  onEdit: (post: PostObject) => void;
  onRegenerate: (post: PostObject) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onEdit, onRegenerate }) => {
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedTags, setCopiedTags] = useState(false);

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(post.caption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const handleCopyTags = () => {
    navigator.clipboard.writeText(post.hashtags.join(' '));
    setCopiedTags(true);
    setTimeout(() => setCopiedTags(false), 2000);
  };

  return (
    <div className="glass-panel post-card">
      {/* Card Header */}
      <div className="post-card-header">
        <div className="post-number-badge">
          <span style={{ color: '#6366f1' }}>#{post.post_number}</span>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={13} />
            {post.date}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="post-angle-badge" title="Strategic Topic Dimension">
            {post.content_angle || 'Core Spotlight'}
          </span>
          <span
            style={{
              fontSize: '0.72rem',
              padding: '2px 8px',
              borderRadius: '4px',
              background: 'rgba(255, 255, 255, 0.06)',
              color: '#cbd5e1'
            }}
          >
            {post.content_type}
          </span>
          {post.version && post.version > 1 && (
            <span
              style={{
                fontSize: '0.65rem',
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#fbbf24',
                fontFamily: 'monospace'
              }}
            >
              v{post.version}
            </span>
          )}
        </div>
      </div>

      {/* Post Caption Block */}
      <div style={{ position: 'relative' }}>
        <div className="post-caption-box">
          {post.caption}
        </div>
        <button
          className="btn btn-secondary btn-sm"
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            padding: '4px 8px',
            fontSize: '0.75rem',
            background: 'rgba(18, 24, 38, 0.85)',
            backdropFilter: 'blur(4px)'
          }}
          onClick={handleCopyCaption}
          title="Copy Caption"
        >
          {copiedCaption ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          <span>{copiedCaption ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Visual Direction / Image Caption Block */}
      <div className="post-visual-box">
        <div className="post-visual-label">
          <Eye size={13} />
          <span>Visual Direction & Creative Layout</span>
        </div>
        <div className="post-visual-text">
          {post.visual_direction}
        </div>
      </div>

      {/* Hashtags Block */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="post-hashtags">
          {post.hashtags.map((tag, i) => (
            <span key={i} className="hashtag-chip">
              {tag}
            </span>
          ))}
        </div>
        <button
          className="btn btn-secondary btn-sm"
          style={{ padding: '3px 8px', fontSize: '0.7rem' }}
          onClick={handleCopyTags}
          title="Copy All Hashtags"
        >
          {copiedTags ? <Check size={11} className="text-emerald-400" /> : <Hash size={11} />}
        </button>
      </div>

      {/* Reference Citation if grounded */}
      {post.reference_basis && post.reference_basis.length > 0 && (
        <div className="post-reference-citation">
          <BookOpen size={12} className="text-indigo-400" />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {post.reference_basis[0]}
          </span>
        </div>
      )}

      {/* Action Footer */}
      <div className="post-card-actions">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onEdit(post)}
        >
          <Edit3 size={13} />
          <span>Edit Post</span>
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onRegenerate(post)}
          title="Regenerate only this post with custom instructions"
        >
          <RefreshCw size={13} />
          <span>Regenerate Post</span>
        </button>
      </div>
    </div>
  );
};
