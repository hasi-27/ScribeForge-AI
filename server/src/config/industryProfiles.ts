import { IndustryProfile, IndustryType } from '../types/index.js';

export const INDUSTRY_PROFILES: Record<IndustryType, IndustryProfile> = {
  'Real Estate': {
    name: 'Real Estate',
    tagline: 'Prime Architectural Living & High-Yield Asset Wealth',
    toneDirection: 'Trust-building, aspirational but factual, location-aware, buyer/investor oriented.',
    strategyDirection: 'Property discovery, lifestyle fit, configuration, investment logic, architecture and USP-led narratives.',
    targetAudience: 'High-net-worth individuals, modern homebuyers, NRI investors, luxury downsizers, and discerning property portfolio builders.',
    mandatoryDimensions: [
      'Location',
      'Amenities',
      'Lifestyle',
      'Investment',
      'Property USP',
      'Configuration',
      'Architecture'
    ],
    vocabularyKeywords: [
      'panoramic views', 'sq ft', 'prime connectivity', 'high ROI', 'rental yield',
      'carpet area', 'master suite', 'penthouse', 'gated community', 'biophilic design',
      'floor-to-ceiling glass', 'infrastructure corridor', 'appreciation potential',
      'sustainable architecture', 'curated amenities', 'private deck', 'concierge living'
    ],
    forbiddenGenericPhrases: [
      'Check out this cool stuff', 'Buy now before it is gone', 'Amazing deal for you',
      'Good product', 'Best thing ever'
    ],
    sampleVisualCues: [
      'Golden hour exterior drone shot showcasing tower facade and surrounding green canopy',
      'Sun-drenched minimalist living lounge featuring double-height ceiling and Italian marble flooring',
      'Architectural blueprint layout transitioning into 3D walkthrough of 3BHK grand master suite',
      'Infinity pool view overlooking city skyline at dusk with warm ambient deck lighting'
    ],
    recommendedHashtags: [
      '#LuxuryRealEstate', '#ArchitecturalLiving', '#PropertyInvestment', '#PrimeLocation',
      '#DreamHomeGoals', '#UrbanSanctuary', '#RealEstatePortfolio', '#PenthouseLiving'
    ],
    hookTemplates: [
      'What does a 3,200 sq.ft private sky villa in the city’s most coveted enclave actually feel like?',
      'Location is not just an address—it is 15 minutes to business hubs, surrounded by 80% open greens.',
      'Beyond square footage: Why architectural daylighting and smart layouts dictate true luxury ROI.'
    ],
    ctaPatterns: [
      'Schedule a private site walkthrough or request the exclusive brochure via link in bio.',
      'DM "SANCTUARY" for floor plans, payment schedules, and priority pricing tiers.',
      'Tap the link to explore the virtual 360° architectural tour.'
    ]
  },

  'Jewellery': {
    name: 'Jewellery',
    tagline: 'Heirloom Craftsmanship, Timeless Elegance & Sacred Moments',
    toneDirection: 'Premium, emotive, refined, craftsmanship-led, occasion-aware.',
    strategyDirection: 'Storytelling around making, design, materials, celebrations, gifting and emotional value.',
    targetAudience: 'Brides-to-be, connoisseurs of haute joaillerie, anniversary gifters, self-rewarding professionals, and heirloom collectors.',
    mandatoryDimensions: [
      'Craftsmanship',
      'Luxury',
      'Occasion',
      'Design',
      'Materials',
      'Emotion',
      'Gifting'
    ],
    vocabularyKeywords: [
      'hallmarked gold', 'brilliant cut diamonds', 'uncut polki', 'filigree detailing',
      'artisanal heritage', 'handcrafted setting', 'eternity silhouette', 'lustrous pearls',
      'gemstone brilliance', 'solitaire', 'bridal trousseau', 'heirloom keepsake',
      'micro-pavé', 'sacred vow', 'timeless grace'
    ],
    forbiddenGenericPhrases: [
      'Cheap prices today', 'Click link to buy fast', 'Our items are good',
      'Random sale', 'Cool stuff to wear'
    ],
    sampleVisualCues: [
      'Macro close-up capturing facets of a cushion-cut emerald catching soft studio spotlight',
      'Master artisan hand-setting pavé diamonds with precision tweezers under warm bench illumination',
      'Bride in pastel silk saree gently adjusting her handcrafted polki choker necklace in vintage mirror',
      'Velvet jewelry box opening smoothly to reveal layered 18K rose gold necklace'
    ],
    recommendedHashtags: [
      '#FineJewellery', '#HeirloomCraftsmanship', '#BridalTrousseau', '#DiamondElegance',
      '#TimelessGems', '#ArtisanalJewellery', '#LuxuryOccasions', '#HandcraftedJewels'
    ],
    hookTemplates: [
      'Over 72 hours of master hand-carving in one single solitaire setting.',
      'Some heirlooms are not just inherited—they carry the pulse of generational romance.',
      'When 18k molten gold meets conflict-free brilliant cut diamonds, poetry takes form.'
    ],
    ctaPatterns: [
      'Explore the new Bridal Pavilion collection via the link in our bio.',
      'Book a private consultation with our master gemologists in-store or virtually.',
      'Save this piece for your wedding moodboard or tag someone who owes you this sparkle.'
    ]
  },

  'Product - Perfume': {
    name: 'Product - Perfume',
    tagline: 'Olfactive Artistry, Mood Alchemy & Sensory Magnetism',
    toneDirection: 'Sensory, evocative, aspirational, personality-led, mood-driven.',
    strategyDirection: 'Describe notes, mood, persona, occasions, lifestyle fit and sensory experience.',
    targetAudience: 'Fragrance enthusiasts, niche olfactive collectors, style-conscious trendsetters, sensory explorers seeking a signature aura.',
    mandatoryDimensions: [
      'Fragrance notes',
      'Mood',
      'Personality',
      'Lifestyle',
      'Luxury',
      'Occasion',
      'Sensory language'
    ],
    vocabularyKeywords: [
      'top notes', 'heart notes', 'base notes', 'sillage', 'dry-down',
      'bergamot zest', 'smoky vetiver', 'sensual amber', 'velvety oud', 'damask rose',
      'olfactive signature', 'magnetic aura', 'whisper of cedarwood', 'golden hour trail',
      'eau de parfum', 'hypnotic longevity', 'nocturnal intrigue'
    ],
    forbiddenGenericPhrases: [
      'Smells very nice', 'Smell good for low price', 'Standard spray',
      'Buy this bottle', 'Good scent'
    ],
    sampleVisualCues: [
      'Heavy crystal flacon backlit with warm amber glow, surrounded by crushed Madagascar vanilla beans and bergamot peel',
      'Ethereal slow-motion mist catching golden dusk beams against dark textured slate background',
      'Editorial portrait of a confident figure in silk trench coat walking through Parisian mist at twilight',
      'Close-up droplets of dew forming on smoked glass perfume bottle with minimalist typography'
    ],
    recommendedHashtags: [
      '#NicheFragrance', '#ScentOfTheDay', '#OlfactiveArt', '#FragranceLovers',
      '#SensoryLuxury', '#PerfumeCollection', '#SignatureScent', '#Sillage'
    ],
    hookTemplates: [
      'A scent that lingers long after you leave the room: the art of hypnotic sillage.',
      'First note: Crisp Italian Bergamot. Final impression: Warm, nocturnal amber that melds like a second skin.',
      'Your fragrance should not announce your arrival; it should make your memory unforgettable.'
    ],
    ctaPatterns: [
      'Discover your olfactive signature—order the bespoke Discovery Set via link in bio.',
      'Tap to experience the complete fragrance pyramid and sensory notes.',
      'Tell us in the comments: which note defines your autumn mood?'
    ]
  },

  'FMCG - Food': {
    name: 'FMCG - Food',
    tagline: 'Pure Ingredients, Table Warmth & Irresistible Craveability',
    toneDirection: 'Appetizing, accessible, benefit-led, family/occasion oriented.',
    strategyDirection: 'Taste, ingredients, convenience, family moments, consumption occasions, benefits and food appeal.',
    targetAudience: 'Busy families, culinary enthusiasts, health-conscious snackers, comfort food seekers, and mindful grocery shoppers.',
    mandatoryDimensions: [
      'Taste',
      'Ingredients',
      'Convenience',
      'Family',
      'Consumption occasions',
      'Product benefits',
      'Food appeal'
    ],
    vocabularyKeywords: [
      'farm-fresh', 'crispy golden crust', 'wholesome crunch', 'melt-in-mouth',
      'zero preservatives', 'rich aroma', 'quick 5-minute fix', 'family dinner table',
      'snack time craving', 'nutrient-dense', 'authentic recipe', 'bursting with flavor',
      'pantry essential', 'slow-simmered', 'guilt-free indulgence'
    ],
    forbiddenGenericPhrases: [
      'Food product is tasty', 'Eat this right now', 'Low price meal',
      'Buy food here', 'Just regular stuff'
    ],
    sampleVisualCues: [
      'Sizzling slow-motion cheese pull or steaming skillet garnished with fresh coriander and cracked pepper',
      'Happy family gathered around sunlit breakfast table passing warm bowls with genuine smiles',
      'Flat lay of fresh whole ingredients: sun-ripened tomatoes, garlic bulbs, olive oil drizzle, sea salt crystals',
      'Crisp product packaging placed beside quick 10-minute gourmet plated lunch recipe'
    ],
    recommendedHashtags: [
      '#FoodieFavorites', '#WholesomeEats', '#FamilyMealTime', '#QuickDinnerFix',
      '#TasteTheGoodness', '#SnackSmart', '#KitchenInspiration', '#PantryStaple'
    ],
    hookTemplates: [
      'Dinner in 12 minutes without sacrificing real, farm-grown wholesome ingredients.',
      'The sound of the first crunch. The burst of slow-roasted herbs. Dinner is finally exciting again.',
      'Zero artificial colors, 100% pure taste your kids will clean their plates for.'
    ],
    ctaPatterns: [
      'Grab your pantry pack at your nearest grocery store or order on quick commerce apps.',
      'Save this recipe card for tonight’s family dinner idea!',
      'Tell us your favorite dip pairing in the comments below!'
    ]
  }
};
