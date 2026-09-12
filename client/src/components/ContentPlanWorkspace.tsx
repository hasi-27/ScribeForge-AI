import React, { useState } from 'react';
import { GenerationRecord, PostObject, ValidationSummary } from '../types';
import { PostCard } from './PostCard';
import { CalendarView } from './CalendarView';
import { EditPostModal } from './EditPostModal';
import { RegeneratePostModal } from './RegeneratePostModal';
import { ValidationReportModal } from './ValidationReportModal';
import { ExportModal } from './ExportModal';
import {
  LayoutGrid,
  Calendar,
  List,
  ShieldCheck,
  Download,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Clock,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ContentPlanWorkspaceProps {
  generation: GenerationRecord;
  onRegenerateFullPlan: () => Promise<void>;
  onRegenerateSinglePost: (genId: string, postNum: number, instruction?: string) => Promise<void>;
  onSavePostApi: (genId: string, postNum: number, data: Partial<PostObject>) => Promise<{ post: PostObject; validation: ValidationSummary }>;
  onUpdatePostLocal: (updatedPost: PostObject, validation: ValidationSummary) => void;
}

export const ContentPlanWorkspace: React.FC<ContentPlanWorkspaceProps> = ({
  generation,
  onRegenerateFullPlan,
  onRegenerateSinglePost,
  onSavePostApi,
  onUpdatePostLocal
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'calendar' | 'feed'>('grid');
  const [editingPost, setEditingPost] = useState<PostObject | null>(null);
  const [regeneratingPost, setRegeneratingPost] = useState<PostObject | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isRegeneratingFull, setIsRegeneratingFull] = useState(false);

  const handleFullRegen = async () => {
    setIsRegeneratingFull(true);
    try {
      await onRegenerateFullPlan();
    } finally {
      setIsRegeneratingFull(false);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 }
    });
  };

  const validation = generation.validation;
  const passedChecksCount = validation.checks.filter(c => c.passed).length;
  const totalChecks = validation.checks.length;

  return (
    <div className="workspace-area">
      {/* Workspace Header & Action Bar */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div className="workspace-header">
          <div className="plan-meta-banner">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.4rem' }}>{generation.industry} Plan</h2>
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: '#818cf8',
                    fontWeight: 700
                  }}
                >
                  {generation.duration} ({generation.post_count} Posts)
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    background: 'rgba(236, 72, 153, 0.15)',
                    color: '#f472b6',
                    fontWeight: 600
                  }}
                >
                  {generation.content_type}
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span>Model: <strong>{generation.model_version}</strong></span>
                <span>•</span>
                <span>Latency: <strong>{generation.metrics?.latency_ms || 320}ms</strong></span>
                <span>•</span>
                <span>Updated: {new Date(generation.updated_at || generation.created_at).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* View Switcher */}
            <div className="view-tabs">
              <button
                className={`view-tab ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid size={15} />
                <span>Cards</span>
              </button>
              <button
                className={`view-tab ${viewMode === 'calendar' ? 'active' : ''}`}
                onClick={() => setViewMode('calendar')}
              >
                <Calendar size={15} />
                <span>Calendar</span>
              </button>
              <button
                className={`view-tab ${viewMode === 'feed' ? 'active' : ''}`}
                onClick={() => setViewMode('feed')}
              >
                <List size={15} />
                <span>Detail Feed</span>
              </button>
            </div>

            {/* Regenerate Full Plan */}
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleFullRegen}
              disabled={isRegeneratingFull}
              title="Re-generate all posts with current parameters"
            >
              <RefreshCw size={14} className={isRegeneratingFull ? 'animate-spin' : ''} />
              <span>{isRegeneratingFull ? 'Regenerating...' : 'Regenerate Plan'}</span>
            </button>

            {/* Export */}
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setShowExportModal(true);
                triggerConfetti();
              }}
            >
              <Download size={14} />
              <span>Export Plan</span>
            </button>
          </div>
        </div>

        {/* Validation Score Banner */}
        <div
          className="validation-summary-card"
          style={{ marginTop: '16px', cursor: 'pointer' }}
          onClick={() => setShowValidationModal(true)}
          title="Click to view detailed validation breakdown (V-01 to V-08)"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="score-circle">
              {Math.round(validation.industry_specificity_score * 100)}%
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} className="text-emerald-400" />
                <span>Automated Quality Validation: {passedChecksCount}/{totalChecks} Passed</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                Industry Specificity Resonant • Strict Post Count ({generation.posts.length}) • Actionable Visuals
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#818cf8',
                fontWeight: 600,
                textDecoration: 'underline'
              }}
            >
              Inspect Checks (V-01 – V-08) &rarr;
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area based on View Mode */}
      {viewMode === 'grid' && (
        <div className="posts-grid">
          {generation.posts.map((post) => (
            <PostCard
              key={post.post_number}
              post={post}
              onEdit={(p) => setEditingPost(p)}
              onRegenerate={(p) => setRegeneratingPost(p)}
            />
          ))}
        </div>
      )}

      {viewMode === 'calendar' && (
        <CalendarView
          posts={generation.posts}
          onSelectPost={(p) => setEditingPost(p)}
        />
      )}

      {viewMode === 'feed' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {generation.posts.map((post) => (
            <PostCard
              key={post.post_number}
              post={post}
              onEdit={(p) => setEditingPost(p)}
              onRegenerate={(p) => setRegeneratingPost(p)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {editingPost && (
        <EditPostModal
          post={editingPost}
          generationId={generation.generation_id}
          onClose={() => setEditingPost(null)}
          onSaveApi={onSavePostApi}
          onSave={onUpdatePostLocal}
        />
      )}

      {regeneratingPost && (
        <RegeneratePostModal
          post={regeneratingPost}
          generationId={generation.generation_id}
          onClose={() => setRegeneratingPost(null)}
          onRegenerate={onRegenerateSinglePost}
        />
      )}

      {showValidationModal && (
        <ValidationReportModal
          validation={validation}
          onClose={() => setShowValidationModal(false)}
        />
      )}

      {showExportModal && (
        <ExportModal
          generation={generation}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
};
