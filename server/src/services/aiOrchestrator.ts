import { ContentFormatType, DurationType, IndustryType, ParsedReferenceFile, PostObject } from '../types/index.js';
import { INDUSTRY_PROFILES } from '../config/industryProfiles.js';
import { QualityValidator } from './validator.js';

export interface GenerationInput {
  industry: IndustryType;
  duration: DurationType;
  post_count: number;
  content_type: ContentFormatType;
  reference_files?: ParsedReferenceFile[];
  start_date?: string;
  custom_instruction?: string;
  apiKey?: string;
  provider?: 'builtin' | 'openai' | 'gemini';
}

export class AIOrchestrator {
  public async generatePlan(input: GenerationInput): Promise<{
    posts: PostObject[];
    modelVersion: string;
    promptVersion: string;
  }> {
    const profile = INDUSTRY_PROFILES[input.industry];
    if (!profile) {
      throw new Error(`Unsupported industry: ${input.industry}`);
    }

    // Try external LLM if key is provided, otherwise use high-fidelity Built-in Domain Engine
    if (input.provider === 'openai' && input.apiKey) {
      try {
        const posts = await this.generateWithOpenAI(input);
        return {
          posts,
          modelVersion: 'openai/gpt-4o-mini',
          promptVersion: 'v2.4-strict-schema'
        };
      } catch (err: any) {
        console.warn('OpenAI generation failed, falling back to Built-in Engine:', err.message);
      }
    }

    if (input.provider === 'gemini' && input.apiKey) {
      try {
        const posts = await this.generateWithGemini(input);
        return {
          posts,
          modelVersion: 'gemini-1.5-flash',
          promptVersion: 'v2.4-strict-schema'
        };
      } catch (err: any) {
        console.warn('Gemini generation failed, falling back to Built-in Engine:', err.message);
      }
    }

    // Built-in High-Fidelity Domain AI Engine
    const posts = this.generateWithBuiltinEngine(input);
    return {
      posts,
      modelVersion: 'antigravity-domain-engine-v2',
      promptVersion: 'v2.4-industry-optimized'
    };
  }

  public async regenerateSinglePost(
    currentPost: PostObject,
    industry: IndustryType,
    customInstruction?: string,
    referenceFiles?: ParsedReferenceFile[]
  ): Promise<PostObject> {
    const profile = INDUSTRY_PROFILES[industry];
    const postNumber = currentPost.post_number;
    const date = currentPost.date;
    const contentType = currentPost.content_type;

    // Pick dimension
    const dimIndex = (postNumber - 1) % profile.mandatoryDimensions.length;
    const dimension = profile.mandatoryDimensions[dimIndex];

    const refContext = this.extractReferenceFacts(referenceFiles || []);

    const regenerated = this.createSingleDomainPost(
      industry,
      postNumber,
      date,
      contentType as ContentFormatType,
      dimension,
      refContext,
      customInstruction
    );

    regenerated.version = (currentPost.version || 1) + 1;
    return regenerated;
  }

  private generateWithBuiltinEngine(input: GenerationInput): PostObject[] {
    const profile = INDUSTRY_PROFILES[input.industry];
    const startDate = input.start_date ? new Date(input.start_date) : new Date();
    const refContext = this.extractReferenceFacts(input.reference_files || []);

    const posts: PostObject[] = [];
    const count = input.post_count;

    // Distribute mandatory dimensions evenly across the requested post count
    const dimensions = [...profile.mandatoryDimensions];

    for (let i = 0; i < count; i++) {
      const postNum = i + 1;
      // Calculate date according to schedule
      const postDate = new Date(startDate);
      if (input.duration === '1 Week') {
        // 3 posts over 7 days -> day 0, 3, 6
        postDate.setDate(startDate.getDate() + (i * 2 + (i === 2 ? 2 : 1)));
      } else if (input.duration === '2 Weeks') {
        // 6 posts over 14 days
        postDate.setDate(startDate.getDate() + Math.floor((i * 14) / count));
      } else {
        // 1 Month (12 posts) over 30 days
        postDate.setDate(startDate.getDate() + Math.floor((i * 30) / count));
      }

      const dateStr = postDate.toISOString().split('T')[0];
      const dimension = dimensions[i % dimensions.length];

      const post = this.createSingleDomainPost(
        input.industry,
        postNum,
        dateStr,
        input.content_type,
        dimension,
        refContext,
        input.custom_instruction
      );

      posts.push(post);
    }

    return posts;
  }

  private createSingleDomainPost(
    industry: IndustryType,
    postNumber: number,
    dateStr: string,
    contentType: ContentFormatType,
    dimension: string,
    refContext: { facts: string[]; brandOrProduct: string; keyHighlight: string },
    customInstruction?: string
  ): PostObject {
    const profile = INDUSTRY_PROFILES[industry];
    const brand = refContext.brandOrProduct || this.getDefaultBrand(industry);

    let caption = '';
    let visualDirection = '';
    let hashtags: string[] = [];
    let referenceBasis: string[] = [];

    if (refContext.facts.length > 0) {
      const factIndex = (postNumber - 1) % refContext.facts.length;
      referenceBasis.push(refContext.facts[factIndex]);
    }

    // Generate industry & dimension-specific copy
    switch (industry) {
      case 'Real Estate':
        {
          const reAngles: Record<string, { hook: string; body: string; visual: string }> = {
            'Location': {
              hook: `Connectivity that transforms your daily rhythm. Situated in the heart of ${refContext.keyHighlight || 'the prime urban corridor'}.`,
              body: `Imagine stepping out of your private elevator to effortless transit, top international schools within 10 minutes, and city financial districts just a short drive away. Yet inside ${brand}, tranquil landscaped boulevards keep the bustling city hum completely at bay.\n\n✨ Direct arterial connectivity\n🌿 70% open green footprint\n☕ Walkable artisanal café strip\n\nExperience elevated urban living where location is the ultimate luxury.`,
              visual: `Wide panoramic aerial drone shot at golden hour capturing the property perimeter, lush green buffer, and sleek arterial expressway glowing with sunset reflections.`
            },
            'Amenities': {
              hook: `Beyond standard living: A resort-grade sanctuary curated for your wellness.`,
              body: `Your home should be your personal retreat. At ${brand}, unwind in our temperature-controlled infinity sky pool overlooking the horizon, recharge in the private hydrotherapy lounge, or host intimate tastings in the temperature-zoned wine pavilion.\n\n🏊‍♂️ 50m Infinity Sky Pool\n🧘‍♀️ Open-air Biophilic Yoga Deck\n🎾 Championship Squash & Tennis Courts\n\nEvery square foot is engineered to elevate your lifestyle.`,
              visual: `Low-angle architectural shot of the infinity deck at dusk; water surface reflecting warm recessed ambient lighting with silhouettes relaxing by lounge cabanas.`
            },
            'Lifestyle': {
              hook: `Waking up to uninterrupted sunrise horizons and serene mornings.`,
              body: `Start your day with double-height panoramic glass framing lush greenery, pouring natural daylight across Italian marble floors. Whether it's your morning espresso on the expansive cantilevered deck or evening family gatherings, ${brand} crafts everyday moments into treasured memories.\n\nDiscover the art of slow, refined luxury.`,
              visual: `Sunlit master living room with floor-to-ceiling glass, minimalist designer furniture, a gentle breeze rustling sheer curtains, and a steaming cup of coffee on the travertine table.`
            },
            'Investment': {
              hook: `Strategic real estate capital appreciation in a high-growth infrastructure corridor.`,
              body: `Smart real estate is rooted in undeniable fundamentals: institutional-grade construction quality, guaranteed rental yields, and high capital upside backed by upcoming metro expansion. ${brand} presents a rare asset portfolio opportunity with historically proven 14%+ annual micro-market growth.\n\n📈 High rental yield corridor\n🏛️ Grade-A developer pedigree\n🔒 RERA-certified transparent milestones\n\nSecure your generational asset today.`,
              visual: `Clean split-screen graphic: On the left, an elegant 3D architectural render of the landmark tower; on the right, high-contrast typography showing investment fundamentals and ROI metrics.`
            },
            'Property USP': {
              hook: `Zero shared walls. 100% acoustic privacy. The pinnacle of sky villa architecture.`,
              body: `Why compromise on privacy? Each residence at ${brand} is designed as an independent sky villa with private elevator foyers, three-sided open ventilation, and custom acoustically insulated double-glazed facades.\n\nExperience absolute solitude in the center of the metropolis.`,
              visual: `Detailed 3D architectural cutaway model showing the exclusive private lobby, dual-aspect glass facade, and generous 11-foot ceiling clearances.`
            },
            'Configuration': {
              hook: `Intelligently mapped spaces: Discover our expansive 3 & 4 BHK Sky Mansions.`,
              body: `Every square foot serves a purpose. Featuring dedicated home offices, dual master suites, walk-in dressing galleries, and staff quarters with independent access, the residences at ${brand} combine functionality with stately proportions.\n\nCarpet areas starting from 2,800 to 4,500 sq.ft.`,
              visual: `Isometric 3D floor plan architectural rendering highlighting seamless room transitions, expansive master suite, and panoramic corner balconies.`
            },
            'Architecture': {
              hook: `Sculpted by world-renowned architects to redefine the city skyline.`,
              body: `A harmonious fusion of brutalist concrete geometry, lush vertical hanging gardens, and thermal-efficient glass. ${brand} stands as a timeless architectural beacon—sustainable, LEED Gold certified, and built to endure for generations.\n\nA statement in contemporary engineering.`,
              visual: `Dramatic upward architectural photograph highlighting the striking facade geometry, vertical gardens, and golden architectural accent lighting against a deep navy evening sky.`
            }
          };

          const selected = reAngles[dimension] || reAngles['Location'];
          caption = `${selected.hook}\n\n${selected.body}\n\n${profile.ctaPatterns[postNumber % profile.ctaPatterns.length]}`;
          visualDirection = `${selected.visual} [Composition: Balanced 16:9 or 4:5 vertical; Lighting: Warm ambient sunset/golden hour; Palette: Rich sandstone, emerald greens, warm bronze metallic accents; Text Overlay: Elegant serif headline '${dimension.toUpperCase()} SPOTLIGHT'].`;
          hashtags = [
            '#LuxuryRealEstate', '#ArchitecturalLiving', '#PropertyInvestment',
            `#${dimension.replace(/\s+/g, '')}`, '#SkyVilla', '#DreamHome', '#PrimeLocation'
          ];
        }
        break;

      case 'Jewellery':
        {
          const jewAngles: Record<string, { hook: string; body: string; visual: string }> = {
            'Craftsmanship': {
              hook: `Over 90 hours of painstaking artisanal precision in every single facet.`,
              body: `True luxury is never rushed. From hand-selecting rare, conflict-free gemstones to meticulous micro-pavé setting under 40x magnification, our master karigars breathe life into molten 18K gold. At ${brand}, every jewel is a living testament to heritage craftsmanship.\n\nWitness the mastery behind the sparkle.`,
              visual: `Intimate macro close-up of a master artisan's hands holding precision tweezers, setting a brilliant-cut diamond into an intricate 18K filigree ring under warm magnifying workbench lighting.`
            },
            'Luxury': {
              hook: `Unapologetic radiance: When timeless elegance commands the entire room.`,
              body: `Indulge in the hypnotic fire of certified solitaires, crowned with royal emerald accents and lustrous South Sea pearls. The signature ${brand} collection is designed for those who wear their brilliance with sovereign grace.\n\nElevate every entrance you make.`,
              visual: `Editorial studio portrait of a poised model in an emerald-green velvet gown, adorned with a cascading diamond and emerald necklace catching directional spotlight flare.`
            },
            'Occasion': {
              hook: `From the sacred vows to the celebratory dance: Jewels that immortalize your biggest day.`,
              body: `Your wedding day deserves nothing less than iconic bridal majesty. Our handcrafted bridal trousseau ensembles unite traditional royal motifs with contemporary ergonomic lightness, ensuring you shine effortlessly through every ritual and celebration.\n\nDesigned for lifetime memories.`,
              visual: `Candid romantic bridal moment: A bride in a blush-pink silk lehenga adjusting her handcrafted polki choker in an ornate antique mirror, surrounded by soft floral bokeh.`
            },
            'Design': {
              hook: `Where fluid organic curves meet architectural geometry: The modern solitaire reinvented.`,
              body: `Drawing inspiration from celestial constellations and natural botanical curves, our new design language balances bold modern silhouettes with classic delicacy. Each piece at ${brand} seamlessly transitions from boardroom sophistication to evening gala charm.\n\nModern geometry. Eternal sparkle.`,
              visual: `Flat-lay aesthetic composition on raw textured Italian travertine stone: The statement necklace placed alongside original gouache design sketches and loose unmounted diamonds.`
            },
            'Materials': {
              hook: `Purity without compromise: 100% BIS Hallmarked gold and ethically sourced conflict-free diamonds.`,
              body: `We believe true beauty begins with integrity. Every single gemstone in our vault is certified by international gemological institutes, hand-graded for supreme cut, color, clarity, and provenance. With ${brand}, you invest in heirloom-grade authenticity.\n\nWear purity with pride.`,
              visual: `Clean laboratory gemological showcase: A solitaire diamond resting on a velvet tray beside a laser-engraved certification card and reflective gold ingots with soft ambient daylighting.`
            },
            'Emotion': {
              hook: `More than gold and gems: A sacred heirloom passed from mother to daughter.`,
              body: `Jewels carry the echoes of laughter, promises whispered, and triumphs achieved. When you slip on a ${brand} heirloom piece, you don't just wear gold—you wear a timeless reminder of love that spans generations.\n\nWhat story will your heirloom tell?`,
              visual: `Tender black-and-white portrait with warm amber toning: An elder woman gently clasping a delicate heirloom diamond bracelet onto a young woman's wrist with genuine emotional smiles.`
            },
            'Gifting': {
              hook: `The unforgettable red box: Gift the moment she will cherish forever.`,
              body: `Celebrate milestones that matter. Whether it's an anniversary, a career triumph, or a spontaneous promise of forever, a signature gift from ${brand} speaks louder than words.\n\nUnwrap eternal devotion.`,
              visual: `Slow-motion reveal visual: Luxurious navy velvet jewelry box opening under warm pinpoint lighting, revealing a brilliant solitaire pendant nestled in satin lining.`
            }
          };

          const selected = jewAngles[dimension] || jewAngles['Craftsmanship'];
          caption = `${selected.hook}\n\n${selected.body}\n\n${profile.ctaPatterns[postNumber % profile.ctaPatterns.length]}`;
          visualDirection = `${selected.visual} [Composition: High-contrast macro & editorial; Lighting: Pinpoint sparkle lighting + warm rim light; Palette: Midnight black, royal emerald, warm gold, champagne velvet; Text Overlay: Refined serif quote].`;
          hashtags = [
            '#FineJewellery', '#HeirloomCraftsmanship', '#BridalTrousseau', '#DiamondElegance',
            `#${dimension.replace(/\s+/g, '')}`, '#ArtisanalJewels', '#LuxuryOccasion'
          ];
        }
        break;

      case 'Product - Perfume':
        {
          const perfAngles: Record<string, { hook: string; body: string; visual: string }> = {
            'Fragrance notes': {
              hook: `The olfactive pyramid revealed: Top notes of sparkling Bergamot melt into velvety Damask Rose and smoky Bourbon Vetiver.`,
              body: `A fragrance should tell an evolving story. With your first spritz of ${brand}, experience an invigorating rush of sun-drenched Mediterranean citrus, followed by an intoxicating heart of nocturnal florals, before settling into a warm, lingering base of ambergris and roasted cedarwood.\n\nDiscover notes that unfold over 14 hours.`,
              visual: `Deconstructed fragrance pyramid flat-lay: The glass perfume bottle flanked by fresh bergamot slices, dewy damask rose petals, whole vanilla pods, and charred cedarwood chips on dark slate.`
            },
            'Mood': {
              hook: `Electric confidence in a single drop: The scent of nocturnal mystery.`,
              body: `Some scents transform how you hold your head up. Crafted for evenings when the city comes alive, ${brand} blends dark spices with hypnotic woody sillage that commands attention without saying a single word.\n\nOwn your nocturnal aura.`,
              visual: `Moody editorial photo of a figure in a black tailored tuxedo jacket walking through a neon-lit rain-slicked boulevard at night, with an ambient vapor mist trail catching violet and gold light.`
            },
            'Personality': {
              hook: `Bold, enigmatic, unapologetically distinct: For those who refuse to blend in.`,
              body: `Your signature scent is your invisible monogram. It walks into the room before you do and stays long after you've departed. ${brand} is blended for the trailblazers, the dreamers, and the connoisseurs of sensory rebellion.\n\nMake your presence unforgettable.`,
              visual: `High-fashion portrait in dramatic chiaroscuro lighting: Intense gaze with the silhouette holding the heavy crystal flacon near their collarbone with delicate shadows.`
            },
            'Lifestyle': {
              hook: `From sunrise meetings in Milan to midnight celebrations in Tokyo: Your signature travel companion.`,
              body: `Effortlessly versatile yet deeply sophisticated. Whether layered for a crisp autumn afternoon or worn light for a summer soirée, ${brand} adapts seamlessly to your body chemistry, creating a bespoke scent profile unique to you.\n\nEveryday luxury, bottled.`,
              visual: `Aesthetic lifestyle flat-lay on a marble nightstand: The perfume flacon resting beside leather passport cover, luxury sunglasses, and a fountain pen with warm morning sunlight streaming across.`
            },
            'Luxury': {
              hook: `Haute Parfumerie in heavy crystal glass: Hand-poured in Grasse, France.`,
              body: `We source only the rarest botanical absolutes and sustainable resin extracts. Formulated at an intense 25% Eau de Parfum concentration, ${brand} delivers extraordinary longevity and velvety sillage that never overwhelms.\n\nExperience pure olfactive luxury.`,
              visual: `Macro close-up of the perfume bottle cap with magnetic snap closure and embossed crest, highlighting the clarity of heavy French crystal glass with liquid amber refracting light.`
            },
            'Occasion': {
              hook: `The fragrance of unforgettable milestones: When you want the memory locked in time.`,
              body: `Smell is the strongest trigger of human memory. Mark your special anniversaries, gala evenings, and sacred celebrations with a scent that will forever transport you back to that exact magical moment.\n\nBottle your greatest memories.`,
              visual: `Champagne cocktail lounge setting: Soft candlelight bokeh, clinking crystal flutes, and the elegant perfume bottle taking center stage on a reflective black lacquer tray.`
            },
            'Sensory language': {
              hook: `A velvety whisper of golden amber melting into warm skin.`,
              body: `Close your eyes and breathe in the rich, intoxicating dry-down. Sensual tonka bean, creamy sandalwood, and a delicate touch of white musk combine into an irresistible tactile warmth that feels like a soft cashmere embrace.\n\nTouch the invisible.`,
              visual: `Sensory slow-motion video frame: Fine golden mist vaporizing in mid-air against deep charcoal background with ultra-soft lighting capturing tiny crystalline droplets.`
            }
          };

          const selected = perfAngles[dimension] || perfAngles['Fragrance notes'];
          caption = `${selected.hook}\n\n${selected.body}\n\n${profile.ctaPatterns[postNumber % profile.ctaPatterns.length]}`;
          visualDirection = `${selected.visual} [Composition: High-contrast sensory & editorial; Lighting: Warm amber backlight + rim glow; Palette: Deep smoky charcoal, radiant amber, rose gold, violet dusk; Text Overlay: Minimalist modern sans-serif typography].`;
          hashtags = [
            '#NichePerfume', '#ScentOfTheDay', '#OlfactiveArt', '#SignatureScent',
            `#${dimension.replace(/\s+/g, '')}`, '#SensoryLuxury', '#PerfumeLovers'
          ];
        }
        break;

      case 'FMCG - Food':
        {
          const foodAngles: Record<string, { hook: string; body: string; visual: string }> = {
            'Taste': {
              hook: `That first irresistible crunch that melts into rich, savory goodness.`,
              body: `Life is too short for bland meals. Prepared with authentic slow-roasted spices and cold-pressed goodness, ${brand} delivers a symphony of bold flavors that will have the entire table asking for seconds.\n\nTaste the real difference in every single bite.`,
              visual: `Ultra-macro slow-motion shot: Crispy golden morsel being dipped into a creamy, herb-garnished dip with savory spices visibly seasoning the crust under appetizing warm directional lighting.`
            },
            'Ingredients': {
              hook: `100% Farm-fresh goodness: Zero artificial preservatives, zero compromise.`,
              body: `Turn the pack around and read the label with confidence. At ${brand}, we believe in whole ingredients you can actually pronounce: sun-ripened tomatoes, stone-ground grains, cold-pressed oils, and farm-harvested herbs.\n\nPure food, the way nature intended.`,
              visual: `Artisan farmer's table flat-lay: Rustic wooden chopping board with fresh whole tomatoes, unrefined Himalayan pink salt crystals, garlic cloves, fresh basil leaves, and the vibrant pack.`
            },
            'Convenience': {
              hook: `Gourmet-level dinner ready on your table in under 8 minutes.`,
              body: `Hectic workday? You don't have to choose between quick food and wholesome nutrition. Simply heat, serve, and savor a comforting, restaurant-grade meal in less time than it takes to order takeout.\n\nYour weeknight dinner savior is here.`,
              visual: `Fast-paced reel split-frame: Stopwatch ticking 00:00 to 07:45 showing the effortless 3-step preparation in a modern kitchen, ending in a beautifully plated gourmet meal with steam rising.`
            },
            'Family': {
              hook: `The dinner table tradition everyone actually looks forward to.`,
              body: `Nothing brings the family together like the comforting aroma of a home-cooked feast. Made with gentle, nourishing spices that both toddlers and grandparents adore, ${brand} turns everyday dinners into heartwarming family memories.\n\nGather around goodness.`,
              visual: `Warm candid photography: A smiling multi-generational family seated around a sunlit rustic wooden dining table passing a steaming dish, laughter evident on their faces.`
            },
            'Consumption occasions': {
              hook: `The ultimate 4 PM snack craving fix that actually keeps you energized.`,
              body: `Beat the afternoon slump without the sugar crash! High in natural plant fiber and protein, ${brand} is the guilt-free snack designed for your desk breaks, movie marathons, and post-workout fuel.\n\nSnack smarter today.`,
              visual: `Cozy living room coffee table setting: A ceramic bowl filled with golden crunchy snack bites, a steaming mug of tea, and a laptop open beside an inspiring notebook.`
            },
            'Product benefits': {
              hook: `Nourishing your body with clean protein, gut-friendly fiber, and real energy.`,
              body: `Fuel your active days with wholesome fuel. Engineered with wholesome super-grains and essential micronutrients, ${brand} gives you sustained stamina without sluggishness or bloating.\n\nFeel your best every day.`,
              visual: `Dynamic clean infographic aesthetic: Vibrant food bowl in the center with clean graphical badge callouts pointing to '12g Plant Protein', 'Zero Trans Fats', and 'Rich in Fiber'.`
            },
            'Food appeal': {
              hook: `The sizzle, the aroma, the golden perfection: Senses on overload!`,
              body: `Watch that golden crust crisp up in the pan, releasing intoxicating aromas of fresh garlic and toasted herbs. One bite is all it takes to make ${brand} your new household favorite.\n\nReady for food cravings?`,
              visual: `Sensory slow-motion sizzle: Cast-iron skillet on a gas flame with golden food bubbling gently, herbs scattering in mid-air, and aromatic steam rising under rich golden kitchen lighting.`
            }
          };

          const selected = foodAngles[dimension] || foodAngles['Taste'];
          caption = `${selected.hook}\n\n${selected.body}\n\n${profile.ctaPatterns[postNumber % profile.ctaPatterns.length]}`;
          visualDirection = `${selected.visual} [Composition: Mouthwatering macro & dynamic table shots; Lighting: Warm high-key appetizing food lighting; Palette: Warm saffron, ripe tomato red, fresh basil green, golden crust; Text Overlay: Bold friendly rounded typography].`;
          hashtags = [
            '#FoodieFavorites', '#WholesomeEats', '#FamilyDinner', '#QuickMealFix',
            `#${dimension.replace(/\s+/g, '')}`, '#TasteTheGoodness', '#KitchenInspiration'
          ];
        }
        break;
    }

    // Apply custom instruction nuances if provided
    if (customInstruction && customInstruction.trim()) {
      caption = `${caption}\n\n[Note: Tailored for: ${customInstruction.trim()}]`;
    }

    return {
      post_number: postNumber,
      date: dateStr,
      content_type: contentType,
      caption,
      visual_direction: visualDirection,
      hashtags,
      content_angle: dimension,
      reference_basis: referenceBasis,
      version: 1
    };
  }

  private extractReferenceFacts(files: ParsedReferenceFile[]): { facts: string[]; brandOrProduct: string; keyHighlight: string } {
    const facts: string[] = [];
    let brandOrProduct = '';
    let keyHighlight = '';

    files.forEach(file => {
      if (file.chunks && file.chunks.length > 0) {
        file.chunks.slice(0, 5).forEach(chunk => {
          const snippet = chunk.text.trim().slice(0, 180);
          if (snippet.length > 30) {
            facts.push(`[${file.original_name} - ${chunk.metadata?.section || 'Excerpt'}]: ${snippet}`);
          }
        });
      }

      // Try extracting product / brand name hints
      const nameMatch = file.original_name.match(/^([a-zA-Z0-9_\s-]+)\./);
      if (nameMatch && !brandOrProduct) {
        const candidate = nameMatch[1].replace(/[-_]/g, ' ').trim();
        if (candidate.length > 3 && candidate.length < 30) {
          brandOrProduct = candidate;
        }
      }
    });

    if (facts.length > 0) {
      keyHighlight = facts[0].slice(0, 60);
    }

    return { facts, brandOrProduct, keyHighlight };
  }

  private getDefaultBrand(industry: IndustryType): string {
    switch (industry) {
      case 'Real Estate': return 'The Aurelia Sky Residences';
      case 'Jewellery': return 'Aethelgard Haute Joaillerie';
      case 'Product - Perfume': return 'Maison Nocturne Eau de Parfum';
      case 'FMCG - Food': return 'NatureHarvest Organics';
    }
  }

  private async generateWithOpenAI(input: GenerationInput): Promise<PostObject[]> {
    // OpenAI structured outputs integration
    const profile = INDUSTRY_PROFILES[input.industry];
    const systemPrompt = `You are a world-class social media copywriter specialized in ${input.industry}.
Follow these mandatory dimensions: ${profile.mandatoryDimensions.join(', ')}.
Tone: ${profile.toneDirection}
Strategy: ${profile.strategyDirection}
Output exactly ${input.post_count} posts conforming to the required JSON schema.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${input.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate ${input.post_count} social media posts for ${input.industry} in ${input.duration} duration. Format: ${input.content_type}.` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const json: any = await response.json();
    const content = JSON.parse(json.choices[0].message.content);
    return content.posts || [];
  }

  private async generateWithGemini(input: GenerationInput): Promise<PostObject[]> {
    const profile = INDUSTRY_PROFILES[input.industry];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${input.apiKey}`;

    const prompt = `Generate a ${input.duration} social media plan (${input.post_count} posts) for ${input.industry}.
Mandatory topic dimensions to cover: ${profile.mandatoryDimensions.join(', ')}.
Tone: ${profile.toneDirection}.
Format: JSON object with key 'posts' containing array of objects with fields: post_number, date, content_type, caption, visual_direction, hashtags (array of strings), content_angle.`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const json: any = await response.json();
    const parsed = JSON.parse(json.candidates[0].content.parts[0].text);
    return parsed.posts || [];
  }
}
