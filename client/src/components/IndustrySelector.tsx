import React from 'react';
import { IndustryProfile, IndustryType } from '../types';
import { Building2, Gem, Sparkles, UtensilsCrossed, CheckCircle2 } from 'lucide-react';

interface IndustrySelectorProps {
  selectedIndustry: IndustryType | null;
  onSelectIndustry: (industry: IndustryType) => void;
  profiles: Record<IndustryType, IndustryProfile> | null;
}

export const IndustrySelector: React.FC<IndustrySelectorProps> = ({
  selectedIndustry,
  onSelectIndustry,
  profiles
}) => {
  const industries: {
    type: IndustryType;
    icon: React.ReactNode;
    colorClass: string;
    description: string;
  }[] = [
    {
      type: 'Real Estate',
      icon: <Building2 className="text-emerald-400" size={20} />,
      colorClass: 'realestate',
      description: 'Location, Amenities, Lifestyle, Investment, Architecture'
    },
    {
      type: 'Jewellery',
      icon: <Gem className="text-amber-400" size={20} />,
      colorClass: 'jewellery',
      description: 'Craftsmanship, Luxury, Occasion, Design, Materials, Emotion'
    },
    {
      type: 'Product - Perfume',
      icon: <Sparkles className="text-fuchsia-400" size={20} />,
      colorClass: 'perfume',
      description: 'Fragrance notes, Mood, Personality, Luxury, Sensory language'
    },
    {
      type: 'FMCG - Food',
      icon: <UtensilsCrossed className="text-orange-400" size={20} />,
      colorClass: 'food',
      description: 'Taste, Ingredients, Convenience, Family, Product benefits'
    }
  ];

  return (
    <div className="glass-panel" style={{ padding: '20px' }}>
      <div className="section-title">
        <h3>
          <span>1. Select Core Industry</span>
        </h3>
        <span className="step-indicator">Required</span>
      </div>

      <div className="industry-grid">
        {industries.map((ind) => {
          const isSelected = selectedIndustry === ind.type;
          const profile = profiles ? profiles[ind.type] : null;

          return (
            <div
              key={ind.type}
              className={`industry-card ${ind.colorClass} ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectIndustry(ind.type)}
            >
              <div className="industry-header">
                <div className="industry-icon" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                  {ind.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="industry-name">{ind.type}</div>
                  <div className="industry-tagline">{ind.description}</div>
                </div>
                {isSelected && (
                  <CheckCircle2 size={18} className="text-indigo-400" style={{ marginLeft: 'auto' }} />
                )}
              </div>

              {profile && (
                <div className="industry-dimensions-preview">
                  {profile.mandatoryDimensions.slice(0, 4).map((dim, i) => (
                    <span key={i} className="dimension-badge">
                      {dim}
                    </span>
                  ))}
                  {profile.mandatoryDimensions.length > 4 && (
                    <span className="dimension-badge">+{profile.mandatoryDimensions.length - 4}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
