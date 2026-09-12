import { QualityValidator } from './src/services/validator.js';
import { AIOrchestrator } from './src/services/aiOrchestrator.js';
import { FileIngestionService } from './src/services/fileIngestion.js';
import { INDUSTRY_PROFILES } from './src/config/industryProfiles.js';

async function runTests() {
  console.log('🧪 Starting Automated Platform Engine Verification Suite...\n');
  const orchestrator = new AIOrchestrator();
  const fileService = new FileIngestionService();

  let passCount = 0;
  let totalTests = 0;

  function assert(condition, testName, details = '') {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passCount++;
    } else {
      console.error(`  ❌ [FAIL] ${testName} - ${details}`);
    }
  }

  // TEST 1: Check all 4 mandatory industries are defined
  console.log('\n--- 1. Testing Industry Profiles ---');
  const industries = ['Real Estate', 'Jewellery', 'Product - Perfume', 'FMCG - Food'];
  industries.forEach(ind => {
    const p = INDUSTRY_PROFILES[ind];
    assert(!!p, `Industry Profile Exists: ${ind}`);
    assert(p.mandatoryDimensions.length >= 7, `${ind} has >= 7 mandatory dimensions (${p.mandatoryDimensions.length})`);
    assert(p.vocabularyKeywords.length >= 10, `${ind} has rich vocabulary keywords (${p.vocabularyKeywords.length})`);
  });

  // TEST 2: Duration / Post Cardinality
  console.log('\n--- 2. Testing Duration & Cardinality Mapping ---');
  const plans = [
    { duration: '1 Week', count: 3 },
    { duration: '2 Weeks', count: 6 },
    { duration: '1 Month', count: 12 }
  ];

  for (const plan of plans) {
    const result = await orchestrator.generatePlan({
      industry: 'Jewellery',
      duration: plan.duration,
      post_count: plan.count,
      content_type: 'Carousel'
    });

    assert(result.posts.length === plan.count, `${plan.duration} produces exactly ${plan.count} posts`);

    const validation = QualityValidator.validatePlan(
      'Jewellery',
      plan.duration,
      plan.count,
      result.posts,
      false
    );

    assert(validation.schema_valid, `${plan.duration} posts pass schema validation (V-01)`);
    assert(validation.count_valid, `${plan.duration} posts pass count validation (V-02)`);
    assert(validation.fields_valid, `${plan.duration} posts have all required content blocks (V-03)`);
    assert(validation.industry_specificity_score >= 0.8, `${plan.duration} industry specificity score >= 0.80 (got ${validation.industry_specificity_score}) (V-04)`);
  }

  // TEST 3: All 4 Industries Validation
  console.log('\n--- 3. Testing All 4 Industries ---');
  for (const ind of industries) {
    const res = await orchestrator.generatePlan({
      industry: ind,
      duration: '1 Week',
      post_count: 3,
      content_type: 'Reel / Video'
    });

    assert(res.posts.length === 3, `${ind} 1 Week post count is 3`);
    assert(res.posts[0].caption.length > 50, `${ind} post 1 has descriptive caption`);
    assert(res.posts[0].visual_direction.length > 30, `${ind} post 1 has actionable visual direction`);
    assert(res.posts[0].hashtags.length >= 3, `${ind} post 1 has valid hashtags`);
    assert(res.posts[0].content_type === 'Reel / Video', `${ind} post content_type matches requested format`);
  }

  // TEST 4: Single Post Regeneration
  console.log('\n--- 4. Testing Single Post Regeneration ---');
  const initialPlan = await orchestrator.generatePlan({
    industry: 'Real Estate',
    duration: '1 Week',
    post_count: 3,
    content_type: 'Static Post'
  });

  const originalPost2 = { ...initialPlan.posts[1] };
  const regenPost2 = await orchestrator.regenerateSinglePost(
    originalPost2,
    'Real Estate',
    'Focus heavily on German soundproofing and cantilevered private terrace views'
  );

  assert(regenPost2.post_number === originalPost2.post_number, 'Regenerated post preserves post number');
  assert(regenPost2.version === 2, 'Regenerated post increments version to 2');
  assert(regenPost2.caption.includes('German soundproofing') || regenPost2.caption.length > 50, 'Regenerated post incorporates custom instruction or rich copy');

  // TEST 5: File Ingestion Service Parsing
  console.log('\n--- 5. Testing File Ingestion & Parsing ---');
  const sampleTxt = Buffer.from(`Product: Maison Imperial Oud
Top Notes: Bergamot, Pink Saffron
Heart Notes: Royal Bulgarian Rose, Smoky Birch
Base Notes: Cambodian Oud, Golden Ambergris, Madagascar Bourbon Vanilla
Concentration: 30% Extrait de Parfum
Longevity: 18+ Hours`);

  const parsedTxt = await fileService.parseFile('Maison_Imperial_Oud_Spec.txt', sampleTxt, 'text/plain');
  assert(parsedTxt.parse_status === 'success', 'TXT file parsing succeeded');
  assert(parsedTxt.chunks.length >= 1, `TXT file created ${parsedTxt.chunks.length} chunks`);
  assert(parsedTxt.summary.length > 20, 'TXT file summary generated');

  // Grounded generation with reference file
  const groundedPlan = await orchestrator.generatePlan({
    industry: 'Product - Perfume',
    duration: '1 Week',
    post_count: 3,
    content_type: 'Carousel',
    reference_files: [parsedTxt]
  });

  assert(groundedPlan.posts[0].reference_basis && groundedPlan.posts[0].reference_basis.length > 0, 'Post cites reference facts in reference_basis');

  const groundedValidation = QualityValidator.validatePlan(
    'Product - Perfume',
    '1 Week',
    3,
    groundedPlan.posts,
    true
  );

  assert(groundedValidation.grounding_score > 0, `Grounding score validated: ${groundedValidation.grounding_score} (V-05)`);

  console.log(`\n======================================================`);
  console.log(`🏁 Test Results: ${passCount} / ${totalTests} Passed (${Math.round((passCount / totalTests) * 100)}%)`);
  console.log(`======================================================\n`);
}

runTests().catch(console.error);
