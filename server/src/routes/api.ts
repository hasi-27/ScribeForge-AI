import { Router } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { FileIngestionService } from '../services/fileIngestion.js';
import { AIOrchestrator } from '../services/aiOrchestrator.js';
import { QualityValidator } from '../services/validator.js';
import { InMemoryDatabase } from '../services/database.js';
import { INDUSTRY_PROFILES } from '../config/industryProfiles.js';
import { ContentFormatType, DurationType, GenerationRecord, IndustryType, PostObject } from '../types/index.js';

const router = Router();
const db = InMemoryDatabase.getInstance();
const fileService = new FileIngestionService();
const aiOrchestrator = new AIOrchestrator();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024 // 25 MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt', '.jpg', '.jpeg', '.png', '.webp'];
    const hasAllowedExt = allowedExtensions.some(ext => file.originalname.toLowerCase().endsWith(ext));
    if (hasAllowedExt) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type. Allowed formats: ${allowedExtensions.join(', ')}`));
    }
  }
});

// GET /api/industry-profiles - Returns the 4 mandatory industry specifications
router.get('/industry-profiles', (req, res) => {
  res.json({
    success: true,
    data: INDUSTRY_PROFILES
  });
});

// POST /api/files - Upload reference file
router.post('/files', upload.single('file'), async (req, res): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }

    const parsedFile = await fileService.parseFile(
      req.file.originalname,
      req.file.buffer,
      req.file.mimetype
    );

    db.addFile(parsedFile);

    res.status(201).json({
      success: true,
      data: parsedFile
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'File upload failed' });
  }
});

// GET /api/files - List uploaded reference files
router.get('/files', (req, res) => {
  res.json({
    success: true,
    data: db.getAllFiles()
  });
});

// GET /api/files/:id - Get single file metadata & chunks
router.get('/files/:id', (req, res): any => {
  const file = db.getFile(req.params.id);
  if (!file) {
    return res.status(404).json({ success: false, error: 'File not found' });
  }
  res.json({
    success: true,
    data: file
  });
});

// DELETE /api/files/:id - Remove reference file
router.delete('/files/:id', (req, res): any => {
  const deleted = db.deleteFile(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, error: 'File not found' });
  }
  res.json({
    success: true,
    message: 'File removed successfully'
  });
});

// POST /api/generations - Start generation
router.post('/generations', async (req, res): Promise<any> => {
  try {
    const {
      industry,
      duration,
      post_count,
      content_type,
      reference_file_ids = [],
      start_date,
      custom_instruction
    } = req.body;

    // Validate inputs
    const validIndustries: IndustryType[] = ['Real Estate', 'Jewellery', 'Product - Perfume', 'FMCG - Food'];
    if (!industry || !validIndustries.includes(industry)) {
      return res.status(400).json({
        success: false,
        error: `Invalid industry. Must be one of: ${validIndustries.join(', ')}`
      });
    }

    const validDurations: Record<DurationType, number> = {
      '1 Week': 3,
      '2 Weeks': 6,
      '1 Month': 12
    };

    if (!duration || !validDurations[duration as DurationType]) {
      return res.status(400).json({
        success: false,
        error: 'Invalid duration. Must be "1 Week", "2 Weeks", or "1 Month".'
      });
    }

    // Deterministic post count enforcement
    const expectedPostCount = validDurations[duration as DurationType];
    const finalPostCount = expectedPostCount;

    const generationId = `gen_${uuidv4().substring(0, 8)}`;
    const startTime = Date.now();

    // Retrieve reference files if specified
    const refFiles = (reference_file_ids as string[])
      .map(id => db.getFile(id))
      .filter((f): f is NonNullable<typeof f> => !!f);

    // Call AI Orchestrator
    const result = await aiOrchestrator.generatePlan({
      industry: industry as IndustryType,
      duration: duration as DurationType,
      post_count: finalPostCount,
      content_type: (content_type || 'Carousel') as ContentFormatType,
      reference_files: refFiles,
      start_date: start_date || new Date().toISOString().split('T')[0],
      custom_instruction,
      apiKey: db.settings.apiKey,
      provider: db.settings.provider
    });

    // Run Quality & Validation Suite (V-01 to V-08)
    const validation = QualityValidator.validatePlan(
      industry as IndustryType,
      duration as DurationType,
      finalPostCount,
      result.posts,
      refFiles.length > 0
    );

    const generationRecord: GenerationRecord = {
      generation_id: generationId,
      industry: industry as IndustryType,
      duration: duration as DurationType,
      post_count: finalPostCount,
      content_type: (content_type || 'Carousel') as ContentFormatType,
      reference_file_ids: reference_file_ids,
      start_date: start_date || new Date().toISOString().split('T')[0],
      custom_instruction,
      status: 'completed',
      posts: result.posts,
      validation,
      model_version: result.modelVersion,
      prompt_version: result.promptVersion,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metrics: {
        latency_ms: Date.now() - startTime,
        retries: 0
      }
    };

    db.saveGeneration(generationRecord);

    res.status(201).json({
      success: true,
      data: generationRecord
    });
  } catch (err: any) {
    console.error('Generation error:', err);
    res.status(500).json({ success: false, error: err.message || 'Generation failed' });
  }
});

// GET /api/generations - List all generations
router.get('/generations', (req, res) => {
  res.json({
    success: true,
    data: db.getAllGenerations()
  });
});

// GET /api/generations/:id - Get generation status & result
router.get('/generations/:id', (req, res): any => {
  const gen = db.getGeneration(req.params.id);
  if (!gen) {
    return res.status(404).json({ success: false, error: 'Generation record not found' });
  }
  res.json({
    success: true,
    data: gen
  });
});

// POST /api/generations/:id/regenerate - Regenerate single post or entire plan
router.post('/generations/:id/regenerate', async (req, res): Promise<any> => {
  try {
    const { scope = 'full', post_number, instruction } = req.body;
    const gen = db.getGeneration(req.params.id);
    if (!gen) {
      return res.status(404).json({ success: false, error: 'Generation not found' });
    }

    const refFiles = gen.reference_file_ids
      .map(id => db.getFile(id))
      .filter((f): f is NonNullable<typeof f> => !!f);

    if (scope === 'single' && post_number) {
      const currentPost = gen.posts.find(p => p.post_number === post_number);
      if (!currentPost) {
        return res.status(404).json({ success: false, error: `Post #${post_number} not found in this generation` });
      }

      const regeneratedPost = await aiOrchestrator.regenerateSinglePost(
        currentPost,
        gen.industry,
        instruction,
        refFiles
      );

      const postIndex = gen.posts.findIndex(p => p.post_number === post_number);
      gen.posts[postIndex] = regeneratedPost;
      gen.updated_at = new Date().toISOString();

      // Re-run validation
      gen.validation = QualityValidator.validatePlan(
        gen.industry,
        gen.duration,
        gen.post_count,
        gen.posts,
        refFiles.length > 0
      );

      db.logAudit('generation', gen.generation_id, 'regenerated', { scope: 'single', post_number });

      return res.json({
        success: true,
        data: {
          generation: gen,
          updated_post: regeneratedPost
        }
      });
    } else {
      // Full plan regeneration
      const result = await aiOrchestrator.generatePlan({
        industry: gen.industry,
        duration: gen.duration,
        post_count: gen.post_count,
        content_type: gen.content_type,
        reference_files: refFiles,
        start_date: gen.start_date,
        custom_instruction: instruction || gen.custom_instruction,
        apiKey: db.settings.apiKey,
        provider: db.settings.provider
      });

      gen.posts = result.posts;
      gen.validation = QualityValidator.validatePlan(
        gen.industry,
        gen.duration,
        gen.post_count,
        result.posts,
        refFiles.length > 0
      );
      gen.updated_at = new Date().toISOString();

      db.logAudit('generation', gen.generation_id, 'regenerated', { scope: 'full' });

      return res.json({
        success: true,
        data: gen
      });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Regeneration failed' });
  }
});

// PATCH /api/generations/:id/posts/:postNumber - Edit generated post (caption, visual direction, hashtags, date)
router.patch('/generations/:id/posts/:postNumber', (req, res): any => {
  const { id, postNumber } = req.params;
  const num = parseInt(postNumber, 10);
  const updatedPost = db.updatePost(id, num, req.body);

  if (!updatedPost) {
    return res.status(404).json({ success: false, error: 'Post or Generation not found' });
  }

  const gen = db.getGeneration(id);
  if (gen) {
    const refFiles = gen.reference_file_ids
      .map(fId => db.getFile(fId))
      .filter((f): f is NonNullable<typeof f> => !!f);

    gen.validation = QualityValidator.validatePlan(
      gen.industry,
      gen.duration,
      gen.post_count,
      gen.posts,
      refFiles.length > 0
    );
  }

  res.json({
    success: true,
    data: updatedPost,
    validation: gen?.validation
  });
});

// PATCH /api/posts/:id - Section 8 direct post edit endpoint
router.patch('/posts/:id', (req, res): any => {
  const { id } = req.params;
  // Parse format: either 'gen_123_post_1' or search across all generations
  const match = id.match(/^(gen_[a-zA-Z0-9]+)_post_(\d+)$/);
  if (match) {
    const genId = match[1];
    const postNum = parseInt(match[2], 10);
    const updatedPost = db.updatePost(genId, postNum, req.body);
    if (!updatedPost) return res.status(404).json({ success: false, error: 'Post not found' });
    const gen = db.getGeneration(genId);
    return res.json({ success: true, data: updatedPost, validation: gen?.validation });
  }

  // Search through all generations for a post with this ID or post_number
  for (const gen of db.getAllGenerations()) {
    const post = gen.posts.find(p => p.id === id || `post_${p.post_number}` === id);
    if (post) {
      const updatedPost = db.updatePost(gen.generation_id, post.post_number, req.body);
      return res.json({ success: true, data: updatedPost, validation: gen.validation });
    }
  }

  res.status(404).json({ success: false, error: `Post with ID ${id} not found` });
});

// GET /api/evaluations/regression - Run regression evaluation matrix across all 4 industries & 3 plans
router.get('/evaluations/regression', async (req, res): Promise<any> => {
  try {
    const industries: IndustryType[] = ['Real Estate', 'Jewellery', 'Product - Perfume', 'FMCG - Food'];
    const durations: DurationType[] = ['1 Week', '2 Weeks', '1 Month'];
    const matrixResults: any[] = [];

    for (const ind of industries) {
      for (const dur of durations) {
        const count = dur === '1 Week' ? 3 : dur === '2 Weeks' ? 6 : 12;
        const result = await aiOrchestrator.generatePlan({
          industry: ind,
          duration: dur,
          post_count: count,
          content_type: 'Carousel'
        });

        const validation = QualityValidator.validatePlan(ind, dur, count, result.posts, false);

        matrixResults.push({
          industry: ind,
          duration: dur,
          expected_posts: count,
          generated_posts: result.posts.length,
          schema_valid: validation.schema_valid,
          count_valid: validation.count_valid,
          fields_valid: validation.fields_valid,
          industry_specificity_score: validation.industry_specificity_score,
          all_passed: validation.checks.every(c => c.passed)
        });
      }
    }

    const totalTests = matrixResults.length;
    const passedTests = matrixResults.filter(r => r.all_passed).length;
    const averageSpecificity = Number(
      (matrixResults.reduce((acc, curr) => acc + curr.industry_specificity_score, 0) / totalTests).toFixed(2)
    );

    res.json({
      success: true,
      data: {
        summary: {
          total_tests: totalTests,
          passed_tests: passedTests,
          pass_rate: `${Math.round((passedTests / totalTests) * 100)}%`,
          average_industry_specificity_score: averageSpecificity,
          evaluated_at: new Date().toISOString()
        },
        matrix: matrixResults
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Regression evaluation failed' });
  }
});

// GET /api/settings - Get current model / key settings
router.get('/settings', (req, res) => {
  res.json({
    success: true,
    data: {
      provider: db.settings.provider,
      hasKey: !!db.settings.apiKey
    }
  });
});

// POST /api/settings - Update settings
router.post('/settings', (req, res) => {
  const { provider, apiKey } = req.body;
  if (provider) db.settings.provider = provider;
  if (apiKey !== undefined) db.settings.apiKey = apiKey;

  res.json({
    success: true,
    message: 'Settings updated successfully'
  });
});

// GET /api/audit - Get audit trail
router.get('/audit', (req, res) => {
  res.json({
    success: true,
    data: db.auditEvents
  });
});

export default router;
