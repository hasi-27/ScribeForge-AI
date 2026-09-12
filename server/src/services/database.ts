import { GenerationRecord, ParsedReferenceFile, PostObject, ValidationSummary } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

export interface AuditEvent {
  id: string;
  user_id?: string;
  entity_type: 'generation' | 'file' | 'post' | 'system';
  entity_id: string;
  event_type: 'created' | 'updated' | 'deleted' | 'regenerated' | 'validated';
  timestamp: string;
  metadata?: any;
}

export class InMemoryDatabase {
  private static instance: InMemoryDatabase;

  public files: Map<string, ParsedReferenceFile> = new Map();
  public generations: Map<string, GenerationRecord> = new Map();
  public auditEvents: AuditEvent[] = [];
  public settings: {
    provider: 'builtin' | 'openai' | 'gemini';
    apiKey?: string;
  } = {
    provider: 'builtin',
    apiKey: ''
  };

  private constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.settings = { provider: 'openai', apiKey: process.env.OPENAI_API_KEY };
    } else if (process.env.GEMINI_API_KEY) {
      this.settings = { provider: 'gemini', apiKey: process.env.GEMINI_API_KEY };
    }
    this.seedDefaultPresetFiles();
  }

  public static getInstance(): InMemoryDatabase {
    if (!InMemoryDatabase.instance) {
      InMemoryDatabase.instance = new InMemoryDatabase();
    }
    return InMemoryDatabase.instance;
  }

  public addFile(file: ParsedReferenceFile): void {
    this.files.set(file.id, file);
    this.logAudit('file', file.id, 'created', { name: file.original_name, size: file.size });
  }

  public getFile(id: string): ParsedReferenceFile | undefined {
    return this.files.get(id);
  }

  public getAllFiles(): ParsedReferenceFile[] {
    return Array.from(this.files.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public deleteFile(id: string): boolean {
    const exists = this.files.has(id);
    if (exists) {
      this.files.delete(id);
      this.logAudit('file', id, 'deleted');
    }
    return exists;
  }

  public saveGeneration(gen: GenerationRecord): void {
    this.generations.set(gen.generation_id, gen);
    this.logAudit('generation', gen.generation_id, 'created', {
      industry: gen.industry,
      duration: gen.duration,
      post_count: gen.post_count
    });
  }

  public getGeneration(id: string): GenerationRecord | undefined {
    return this.generations.get(id);
  }

  public getAllGenerations(): GenerationRecord[] {
    return Array.from(this.generations.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public updatePost(
    generationId: string,
    postNumber: number,
    updatedFields: Partial<PostObject>
  ): PostObject | null {
    const gen = this.generations.get(generationId);
    if (!gen) return null;

    const postIndex = gen.posts.findIndex(p => p.post_number === postNumber);
    if (postIndex === -1) return null;

    const existingPost = gen.posts[postIndex];
    const updatedPost: PostObject = {
      ...existingPost,
      ...updatedFields,
      version: (existingPost.version || 1) + 1
    };

    gen.posts[postIndex] = updatedPost;
    gen.updated_at = new Date().toISOString();
    this.logAudit('post', `${generationId}_post_${postNumber}`, 'updated', updatedFields);
    return updatedPost;
  }

  public logAudit(
    entity_type: AuditEvent['entity_type'],
    entity_id: string,
    event_type: AuditEvent['event_type'],
    metadata?: any
  ): void {
    this.auditEvents.push({
      id: `audit_${uuidv4().substring(0, 8)}`,
      entity_type,
      entity_id,
      event_type,
      timestamp: new Date().toISOString(),
      metadata
    });
  }

  private seedDefaultPresetFiles(): void {
    // Seed pre-loaded sample references for instant demoing of each industry
    const sampleJewellery = {
      id: 'file_sample_jewellery',
      original_name: 'Aethelgard_Bridal_Collection_Spec.pdf',
      storage_key: 'file_sample_jewellery_spec.pdf',
      mime_type: 'application/pdf',
      size: 48200,
      parse_status: 'success' as const,
      summary: 'Heirloom 18k Rose Gold Bridal Collection with conflict-free VVS1 diamonds, hand-carved polki motifs, and sacred trousseau designs.',
      full_text: `Aethelgard Haute Joaillerie - 2026 Autumn Bridal Lookbook Specification.
Materials: 18 Karat Hallmarked Rose & Yellow Gold, certified conflict-free VVS1 brilliant-cut diamonds, Zambian royal emeralds.
Key Craftsmanship Details: 90 hours of artisanal hand-carving per necklace, micro-pavé setting, detachable chandelier drops for multi-occasion versatility.
Target Audience: Discerning brides, bespoke trousseau collectors, luxury anniversary milestone celebrations.
Price tier: Ultra-luxury, bespoke heirloom guarantees included.`,
      chunks: [
        {
          id: 'chunk_j1',
          file_id: 'file_sample_jewellery',
          file_name: 'Aethelgard_Bridal_Collection_Spec.pdf',
          chunk_index: 1,
          text: 'Materials: 18 Karat Hallmarked Rose & Yellow Gold, certified conflict-free VVS1 brilliant-cut diamonds, Zambian royal emeralds.',
          metadata: { section: 'Lookbook Section 1 - Material Specifications' }
        },
        {
          id: 'chunk_j2',
          file_id: 'file_sample_jewellery',
          file_name: 'Aethelgard_Bridal_Collection_Spec.pdf',
          chunk_index: 2,
          text: 'Key Craftsmanship Details: 90 hours of artisanal hand-carving per necklace, micro-pavé setting, detachable chandelier drops for multi-occasion versatility.',
          metadata: { section: 'Lookbook Section 2 - Craftsmanship & Versatility' }
        }
      ],
      created_at: new Date().toISOString()
    };

    const sampleRealEstate = {
      id: 'file_sample_realestate',
      original_name: 'The_Aurelia_Sky_Residences_Brochure.docx',
      storage_key: 'file_sample_realestate_brochure.docx',
      mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 34100,
      parse_status: 'success' as const,
      summary: 'Ultra-luxury 3 & 4 BHK sky villas in prime urban corridor with 80% open biophilic greens, private elevators, and 50m infinity sky pool.',
      full_text: `The Aurelia Sky Residences - Master Project Sheet.
Location: Prime Central Expressway Corridor, 10 minutes to International Airport & Financial District.
Configuration: 3 & 4 BHK Sky Mansions with carpet area from 3,200 to 4,800 sq.ft.
Key USPs: Zero shared walls, private double-height foyer, floor-to-ceiling soundproof German glass facades.
Curated Amenities: 50m infinity heated sky pool, biophilic yoga observatory, temperature-controlled wine pavilion, 24/7 white-glove concierge.
Investment Metrics: Expected 15% YoY micro-market capital appreciation, 5.8% rental yield.`,
      chunks: [
        {
          id: 'chunk_re1',
          file_id: 'file_sample_realestate',
          file_name: 'The_Aurelia_Sky_Residences_Brochure.docx',
          chunk_index: 1,
          text: 'Location: Prime Central Expressway Corridor, 10 minutes to International Airport & Financial District. 3 & 4 BHK Sky Mansions from 3,200 sq.ft.',
          metadata: { section: 'Brochure Section 1 - Location & Configuration' }
        },
        {
          id: 'chunk_re2',
          file_id: 'file_sample_realestate',
          file_name: 'The_Aurelia_Sky_Residences_Brochure.docx',
          chunk_index: 2,
          text: 'Amenities: 50m infinity heated sky pool, biophilic yoga observatory, temperature-controlled wine pavilion, 24/7 white-glove concierge. 15% projected ROI.',
          metadata: { section: 'Brochure Section 2 - Amenities & Investment' }
        }
      ],
      created_at: new Date().toISOString()
    };

    const samplePerfume = {
      id: 'file_sample_perfume',
      original_name: 'Maison_Nocturne_Fragrance_Pyramid.xlsx',
      storage_key: 'file_sample_perfume_pyramid.xlsx',
      mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 29500,
      parse_status: 'success' as const,
      summary: 'Sensory fragrance pyramid featuring Italian Bergamot top notes, Damask Rose heart, and smoky Bourbon Vetiver & Amber dry-down.',
      full_text: `Maison Nocturne - Olfactive Formulation Data.
Top Notes: Calabrian Bergamot, Pink Peppercorn, Cardamom pod extract.
Heart Notes: Midnight Damask Rose, French Orris Butter, Black Violet.
Base Notes: Bourbon Vetiver, Warm Ambergris, Roasted Cedarwood, Madagascar Vanilla.
Concentration: 25% Eau de Parfum Intense. Sillage: Heavy, lingering 14+ hours. Mood: Enigmatic, nocturnal, hypnotic.`,
      chunks: [
        {
          id: 'chunk_p1',
          file_id: 'file_sample_perfume',
          file_name: 'Maison_Nocturne_Fragrance_Pyramid.xlsx',
          chunk_index: 1,
          text: 'Top Notes: Calabrian Bergamot, Pink Peppercorn. Heart: Midnight Damask Rose, French Orris Butter. Base: Bourbon Vetiver, Warm Ambergris, Madagascar Vanilla.',
          metadata: { section: 'Formulation Sheet - Notes Breakdown' }
        }
      ],
      created_at: new Date().toISOString()
    };

    const sampleFood = {
      id: 'file_sample_food',
      original_name: 'NatureHarvest_Organic_Pantry_Spec.txt',
      storage_key: 'file_sample_food_spec.txt',
      mime_type: 'text/plain',
      size: 19800,
      parse_status: 'success' as const,
      summary: 'Clean-label organic quick meal kits with farm-fresh whole ingredients, zero trans fats, and ready in 8 minutes.',
      full_text: `NatureHarvest Organics - Product Line Factsheet.
Ingredients: 100% Farm-grown sun-ripened tomatoes, organic quinoa, cold-pressed extra virgin olive oil, fresh crushed garlic, whole rosemary sprigs.
Nutritional Highlights: 14g Clean Plant Protein per serving, zero artificial colors, zero trans fats, rich in dietary gut fiber.
Preparation: 8-minute one-pan gourmet meal fix for busy families and active professionals.
Packaging: 100% Recyclable biodegradable pouch.`,
      chunks: [
        {
          id: 'chunk_f1',
          file_id: 'file_sample_food',
          file_name: 'NatureHarvest_Organic_Pantry_Spec.txt',
          chunk_index: 1,
          text: 'Ingredients: 100% Farm-grown sun-ripened tomatoes, organic quinoa, cold-pressed olive oil. 14g Clean Plant Protein, zero artificial colors, ready in 8 minutes.',
          metadata: { section: 'Factsheet - Nutritional and Culinary Specifications' }
        }
      ],
      created_at: new Date().toISOString()
    };

    this.files.set(sampleJewellery.id, sampleJewellery);
    this.files.set(sampleRealEstate.id, sampleRealEstate);
    this.files.set(samplePerfume.id, samplePerfume);
    this.files.set(sampleFood.id, sampleFood);
  }
}
