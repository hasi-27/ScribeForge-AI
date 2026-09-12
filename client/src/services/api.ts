import {
  DurationType,
  GenerationRecord,
  IndustryProfile,
  IndustryType,
  ParsedReferenceFile,
  PostObject,
  RegressionMatrixItem,
  ValidationSummary
} from '../types';

const API_BASE = '/api';

export const apiClient = {
  // Fetch Industry Profiles
  async getIndustryProfiles(): Promise<Record<IndustryType, IndustryProfile>> {
    const res = await fetch(`${API_BASE}/industry-profiles`);
    const json = await res.json();
    return json.data;
  },

  // Upload Reference File
  async uploadFile(file: File): Promise<ParsedReferenceFile> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/files`, {
      method: 'POST',
      body: formData
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Upload failed');
    return json.data;
  },

  // List Reference Files
  async getFiles(): Promise<ParsedReferenceFile[]> {
    const res = await fetch(`${API_BASE}/files`);
    const json = await res.json();
    return json.data || [];
  },

  // Delete Reference File
  async deleteFile(fileId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/files/${fileId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete file');
  },

  // Start Generation
  async generateContent(params: {
    industry: IndustryType;
    duration: DurationType;
    post_count: number;
    content_type: string;
    reference_file_ids: string[];
    start_date?: string;
    custom_instruction?: string;
  }): Promise<GenerationRecord> {
    const res = await fetch(`${API_BASE}/generations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Generation failed');
    return json.data;
  },

  // Get Generation
  async getGeneration(id: string): Promise<GenerationRecord> {
    const res = await fetch(`${API_BASE}/generations/${id}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Not found');
    return json.data;
  },

  // Regenerate Post or Plan
  async regenerate(params: {
    generationId: string;
    scope: 'single' | 'full';
    post_number?: number;
    instruction?: string;
  }): Promise<{ generation?: GenerationRecord; updated_post?: PostObject }> {
    const res = await fetch(`${API_BASE}/generations/${params.generationId}/regenerate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Regeneration failed');
    return json.data;
  },

  // Edit Generated Post (PATCH)
  async updatePost(
    generationId: string,
    postNumber: number,
    data: Partial<PostObject>
  ): Promise<{ post: PostObject; validation: ValidationSummary }> {
    const res = await fetch(`${API_BASE}/generations/${generationId}/posts/${postNumber}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Update failed');
    return { post: json.data, validation: json.validation };
  },

  // Run Regression Evaluation Suite
  async runRegression(): Promise<{
    summary: {
      total_tests: number;
      passed_tests: number;
      pass_rate: string;
      average_industry_specificity_score: number;
      evaluated_at: string;
    };
    matrix: RegressionMatrixItem[];
  }> {
    const res = await fetch(`${API_BASE}/evaluations/regression`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Regression run failed');
    return json.data;
  },

  // Get Settings
  async getSettings(): Promise<{ provider: string; hasKey: boolean }> {
    const res = await fetch(`${API_BASE}/settings`);
    const json = await res.json();
    return json.data;
  },

  // Update Settings
  async updateSettings(settings: { provider: string; apiKey?: string }): Promise<void> {
    await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
  }
};
