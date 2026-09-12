export type IndustryType = 'Real Estate' | 'Jewellery' | 'Product - Perfume' | 'FMCG - Food';

export type DurationType = '1 Week' | '2 Weeks' | '1 Month';

export type ContentFormatType = 'Carousel' | 'Reel / Video' | 'Static Post' | 'Story';

export interface PostObject {
  id?: string;
  post_number: number;
  date: string;
  content_type: ContentFormatType | string;
  caption: string;
  visual_direction: string;
  hashtags: string[];
  content_angle?: string;
  reference_basis?: string[];
  version?: number;
}

export interface ValidationCheckItem {
  id: string;
  name: string;
  passed: boolean;
  score?: number;
  message: string;
  details?: any;
}

export interface ValidationSummary {
  schema_valid: boolean;
  count_valid: boolean;
  fields_valid: boolean;
  industry_specificity_score: number;
  grounding_score?: number;
  diversity_score?: number;
  checks: ValidationCheckItem[];
}

export interface FileChunk {
  id: string;
  file_id: string;
  file_name: string;
  chunk_index: number;
  text: string;
  metadata?: {
    page?: number;
    slide?: number;
    sheet?: string;
    section?: string;
  };
}

export interface ParsedReferenceFile {
  id: string;
  original_name: string;
  storage_key: string;
  mime_type: string;
  size: number;
  parse_status: 'pending' | 'success' | 'failed';
  parse_error?: string;
  summary?: string;
  full_text?: string;
  chunks: FileChunk[];
  created_at: string;
}

export interface GenerationRecord {
  generation_id: string;
  industry: IndustryType;
  duration: DurationType;
  post_count: number;
  content_type: ContentFormatType;
  reference_file_ids: string[];
  start_date?: string;
  custom_instruction?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  posts: PostObject[];
  validation: ValidationSummary;
  model_version: string;
  prompt_version: string;
  created_at: string;
  updated_at: string;
  metrics?: {
    latency_ms: number;
    tokens_used?: number;
    retries?: number;
  };
}

export interface IndustryProfile {
  name: IndustryType;
  tagline: string;
  toneDirection: string;
  strategyDirection: string;
  targetAudience: string;
  mandatoryDimensions: string[];
  vocabularyKeywords: string[];
  forbiddenGenericPhrases: string[];
  sampleVisualCues: string[];
  recommendedHashtags: string[];
  hookTemplates: string[];
  ctaPatterns: string[];
}

export interface RegressionMatrixItem {
  industry: IndustryType;
  duration: DurationType;
  expected_posts: number;
  generated_posts: number;
  schema_valid: boolean;
  count_valid: boolean;
  fields_valid: boolean;
  industry_specificity_score: number;
  all_passed: boolean;
}

export interface RegressionSummary {
  total_tests: number;
  pass_tests: number;
  pass_rate: string;
  average_industry_specificity_score: number;
  evaluated_at: string;
}
