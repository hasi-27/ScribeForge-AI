import React, { useState, useEffect } from 'react';
import {
  ContentFormatType,
  DurationType,
  GenerationRecord,
  IndustryProfile,
  IndustryType,
  ParsedReferenceFile,
  PostObject,
  ValidationSummary
} from './types';
import { apiClient } from './services/api';
import { Header } from './components/Header';
import { IndustrySelector } from './components/IndustrySelector';
import { PlanSelector } from './components/PlanSelector';
import { ContentTypeSelector } from './components/ContentTypeSelector';
import { FileUploadZone } from './components/FileUploadZone';
import { GenerationProgress } from './components/GenerationProgress';
import { ContentPlanWorkspace } from './components/ContentPlanWorkspace';
import { SettingsModal } from './components/SettingsModal';
import { RegressionModal } from './components/RegressionModal';
import { FileChunkDrawer } from './components/FileChunkDrawer';
import {
  Sparkles,
  Play,
  Calendar,
  Layers,
  AlertCircle,
  HelpCircle,
  FileCheck2,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function App() {
  // Application State
  const [profiles, setProfiles] = useState<Record<IndustryType, IndustryProfile> | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryType | null>('Jewellery');
  const [selectedDuration, setSelectedDuration] = useState<DurationType>('1 Week');
  const [selectedFormat, setSelectedFormat] = useState<ContentFormatType>('Carousel');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [customInstruction, setCustomInstruction] = useState<string>('');

  // Files State
  const [availableFiles, setAvailableFiles] = useState<ParsedReferenceFile[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>(['file_sample_jewellery']);
  const [inspectingFile, setInspectingFile] = useState<ParsedReferenceFile | null>(null);

  // Generation & Active Record State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationRecord, setGenerationRecord] = useState<GenerationRecord | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  // Modals State
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showRegressionModal, setShowRegressionModal] = useState<boolean>(false);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [profilesData, filesData] = await Promise.all([
        apiClient.getIndustryProfiles(),
        apiClient.getFiles()
      ]);
      setProfiles(profilesData);
      setAvailableFiles(filesData);

      // Auto-trigger a default demonstration generation for instant UX delight
      triggerInitialDemo();
    } catch (err) {
      console.warn('Could not load initial profiles or files:', err);
    }
  };

  const triggerInitialDemo = async () => {
    try {
      const gen = await apiClient.generateContent({
        industry: 'Jewellery',
        duration: '1 Week',
        post_count: 3,
        content_type: 'Carousel',
        reference_file_ids: ['file_sample_jewellery'],
        start_date: new Date().toISOString().split('T')[0],
        custom_instruction: 'Focus on 18k rose gold bridal trousseau and handcrafted heirloom motifs'
      });
      setGenerationRecord(gen);
    } catch (err) {
      console.warn('Initial generation skipped:', err);
    }
  };

  // Map duration deterministically to post count
  const getPostCount = (dur: DurationType): number => {
    switch (dur) {
      case '1 Week': return 3;
      case '2 Weeks': return 6;
      case '1 Month': return 12;
    }
  };

  // Handle File Upload
  const handleFileUpload = async (file: File) => {
    const uploaded = await apiClient.uploadFile(file);
    setAvailableFiles(prev => [uploaded, ...prev]);
    setSelectedFileIds(prev => [uploaded.id, ...prev]);
  };

  // Handle File Deletion
  const handleDeleteFile = async (fileId: string) => {
    await apiClient.deleteFile(fileId);
    setAvailableFiles(prev => prev.filter(f => f.id !== fileId));
    setSelectedFileIds(prev => prev.filter(id => id !== fileId));
  };

  // Toggle File Selection
  const handleToggleFileSelection = (fileId: string) => {
    setSelectedFileIds(prev =>
      prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId]
    );
  };

  // Main Generation Action (R-07)
  const handleGenerate = async () => {
    if (!selectedIndustry) {
      setGenError('Please select a mandatory industry first (Real Estate, Jewellery, Perfume, or FMCG Food).');
      return;
    }

    setGenError(null);
    setIsGenerating(true);

    try {
      const postCount = getPostCount(selectedDuration);
      const record = await apiClient.generateContent({
        industry: selectedIndustry,
        duration: selectedDuration,
        post_count: postCount,
        content_type: selectedFormat,
        reference_file_ids: selectedFileIds,
        start_date: startDate,
        custom_instruction: customInstruction
      });

      setGenerationRecord(record);

      // Trigger celebratory confetti
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 }
      });
    } catch (err: any) {
      setGenError(err.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  // Load Demo Presets
  const handleLoadPreset = (preset: {
    industry: IndustryType;
    duration: DurationType;
    contentType: string;
    fileId: string;
    instruction?: string;
  }) => {
    setSelectedIndustry(preset.industry);
    setSelectedDuration(preset.duration);
    setSelectedFormat(preset.contentType as ContentFormatType);
    setSelectedFileIds([preset.fileId]);
    if (preset.instruction) {
      setCustomInstruction(preset.instruction);
    }
  };

  // Full Plan Regeneration
  const handleRegenerateFullPlan = async () => {
    if (!generationRecord) return;
    const res = await apiClient.regenerate({
      generationId: generationRecord.generation_id,
      scope: 'full'
    });
    if (res.generation) {
      setGenerationRecord(res.generation);
    }
  };

  // Single Post Regeneration
  const handleRegenerateSinglePost = async (genId: string, postNum: number, instruction?: string) => {
    const res = await apiClient.regenerate({
      generationId: genId,
      scope: 'single',
      post_number: postNum,
      instruction
    });

    if (res.generation) {
      setGenerationRecord(res.generation);
    }
  };

  // Update Post (PATCH)
  const handleSavePostApi = async (genId: string, postNum: number, data: Partial<PostObject>) => {
    return await apiClient.updatePost(genId, postNum, data);
  };

  const handleUpdatePostLocal = (updatedPost: PostObject, validation: ValidationSummary) => {
    if (!generationRecord) return;
    const posts = [...generationRecord.posts];
    const idx = posts.findIndex(p => p.post_number === updatedPost.post_number);
    if (idx !== -1) {
      posts[idx] = updatedPost;
      setGenerationRecord({
        ...generationRecord,
        posts,
        validation
      });
    }
  };

  return (
    <div className="app-container">
      {/* Top Header Navigation */}
      <Header
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenRegression={() => setShowRegressionModal(true)}
        onLoadPreset={handleLoadPreset}
      />

      {/* Main Grid: Left Planning Sidebar & Right Workspace */}
      <div className="main-grid">
        {/* Planning Sidebar */}
        <aside className="planning-sidebar">
          {/* 1. Industry Selector (R-03, R-04, R-09) */}
          <IndustrySelector
            selectedIndustry={selectedIndustry}
            onSelectIndustry={(ind) => setSelectedIndustry(ind)}
            profiles={profiles}
          />

          {/* 2. Duration & Plan (R-05) */}
          <PlanSelector
            selectedDuration={selectedDuration}
            onSelectDuration={(dur) => setSelectedDuration(dur)}
          />

          {/* 3. Content Type / Format (R-02) */}
          <ContentTypeSelector
            selectedFormat={selectedFormat}
            onSelectFormat={(fmt) => setSelectedFormat(fmt)}
          />

          {/* 4. Reference File Intelligence (R-06, Section 6) */}
          <FileUploadZone
            availableFiles={availableFiles}
            selectedFileIds={selectedFileIds}
            onToggleFileSelection={handleToggleFileSelection}
            onFileUpload={handleFileUpload}
            onDeleteFile={handleDeleteFile}
            onInspectFile={(f) => setInspectingFile(f)}
          />

          {/* 5. Date & Custom Strategy Direction */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div className="section-title">
              <h3>
                <Calendar size={18} className="text-amber-400" />
                <span>5. Launch Schedule & Direction</span>
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Campaign Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Optional Brand USP / Custom Direction</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={customInstruction}
                  onChange={(e) => setCustomInstruction(e.target.value)}
                  placeholder="e.g. Focus on sustainable diamond sourcing and bridal registry incentives..."
                />
              </div>
            </div>
          </div>

          {/* Error Message if Any */}
          {genError && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={18} />
              <span>{genError}</span>
            </div>
          )}

          {/* Primary CTA: Generate Content (R-07) */}
          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%', gap: '10px' }}
            onClick={handleGenerate}
            disabled={isGenerating || !selectedIndustry}
          >
            <Sparkles size={20} />
            <span>
              {isGenerating
                ? 'Synthesizing Content Plan...'
                : `Generate ${selectedDuration} Plan (${getPostCount(selectedDuration)} Posts)`}
            </span>
          </button>
        </aside>

        {/* Right Area: Results & Interactive Workspace */}
        <main>
          {isGenerating ? (
            <GenerationProgress />
          ) : generationRecord ? (
            <ContentPlanWorkspace
              generation={generationRecord}
              onRegenerateFullPlan={handleRegenerateFullPlan}
              onRegenerateSinglePost={handleRegenerateSinglePost}
              onSavePostApi={handleSavePostApi}
              onUpdatePostLocal={handleUpdatePostLocal}
            />
          ) : (
            <div
              className="glass-panel"
              style={{
                padding: '60px 40px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(99, 102, 241, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Sparkles size={32} className="text-indigo-400" />
              </div>
              <h3 style={{ fontSize: '1.4rem' }}>Ready to Generate Your Social Content Plan</h3>
              <p style={{ color: '#94a3b8', maxWidth: '480px', fontSize: '0.9rem' }}>
                Select an industry on the left, lock your duration (1 Week / 3 Posts, 2 Weeks / 6 Posts, 1 Month / 12 Posts), upload reference docs, and click <strong>Generate Content</strong>.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Modals & Drawers */}
      {showSettingsModal && (
        <SettingsModal onClose={() => setShowSettingsModal(false)} />
      )}

      {showRegressionModal && (
        <RegressionModal onClose={() => setShowRegressionModal(false)} />
      )}

      {inspectingFile && (
        <FileChunkDrawer
          file={inspectingFile}
          onClose={() => setInspectingFile(null)}
        />
      )}
    </div>
  );
}

export default App;
