import React from 'react';
import { Sparkles, BarChart3, Settings, Zap, BookOpen } from 'lucide-react';
import { IndustryType, DurationType } from '../types';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenRegression: () => void;
  onLoadPreset: (preset: {
    industry: IndustryType;
    duration: DurationType;
    contentType: string;
    fileId: string;
    instruction?: string;
  }) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenRegression,
  onLoadPreset
}) => {
  return (
    <header className="header-bar">
      <div className="brand-logo">
        <div className="brand-icon-wrapper">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="brand-title">ScribeForge AI</div>
          <div className="brand-subtitle">Enterprise Social Content Engine</div>
        </div>
      </div>

      <div className="header-actions">
        {/* Quick Demo Presets Dropdown */}
        <div className="dropdown-wrapper" style={{ position: 'relative' }}>
          <button
            className="preset-badge"
            title="Load assessment example scenarios with sample reference files"
            onClick={(e) => {
              const menu = e.currentTarget.nextElementSibling as HTMLElement;
              if (menu) menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
            }}
          >
            <Zap size={14} className="text-amber-400" />
            <span>Load Demo Presets</span>
          </button>
          <div
            className="preset-menu glass-panel"
            style={{
              display: 'none',
              position: 'absolute',
              top: '110%',
              right: 0,
              width: '320px',
              padding: '8px',
              zIndex: 50,
              borderRadius: '12px'
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', padding: '6px 10px', textTransform: 'uppercase' }}>
              Standard Assessment Presets
            </div>
            <button
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '6px', textAlign: 'left' }}
              onClick={(e) => {
                (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
                onLoadPreset({
                  industry: 'Jewellery',
                  duration: '1 Week',
                  contentType: 'Carousel',
                  fileId: 'file_sample_jewellery',
                  instruction: 'Emphasize bridal trousseau craftsmanship, 18k rose gold, and heirloom emotions'
                });
              }}
            >
              💍 <strong>Jewellery</strong>: 1 Week (3 Posts) + Lookbook
            </button>
            <button
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '6px', textAlign: 'left' }}
              onClick={(e) => {
                (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
                onLoadPreset({
                  industry: 'Real Estate',
                  duration: '2 Weeks',
                  contentType: 'Reel / Video',
                  fileId: 'file_sample_realestate',
                  instruction: 'Highlight sky villa private elevator and 50m infinity pool ROI'
                });
              }}
            >
              🏢 <strong>Real Estate</strong>: 2 Weeks (6 Posts) + Brochure
            </button>
            <button
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '6px', textAlign: 'left' }}
              onClick={(e) => {
                (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
                onLoadPreset({
                  industry: 'Product - Perfume',
                  duration: '1 Week',
                  contentType: 'Static Post',
                  fileId: 'file_sample_perfume',
                  instruction: 'Sensory notes on Italian Bergamot and nocturnal amber sillage'
                });
              }}
            >
              ✨ <strong>Perfume</strong>: 1 Week (3 Posts) + Pyramid Spec
            </button>
            <button
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', justifyContent: 'flex-start', textAlign: 'left' }}
              onClick={(e) => {
                (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
                onLoadPreset({
                  industry: 'FMCG - Food',
                  duration: '1 Month',
                  contentType: 'Story',
                  fileId: 'file_sample_food',
                  instruction: 'Wholesome farm ingredients, 8-min quick meals, and family dinner warmth'
                });
              }}
            >
              🥗 <strong>FMCG Food</strong>: 1 Month (12 Posts) + Factsheet
            </button>
          </div>
        </div>

        {/* Section 9.1 Evaluation Benchmark */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={onOpenRegression}
          title="Run 4 Industries × 3 Plans Quality Matrix Evaluation"
        >
          <BarChart3 size={15} />
          <span>Regression Suite</span>
        </button>

        {/* Settings */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={onOpenSettings}
          title="Configure AI model provider and API keys"
        >
          <Settings size={15} />
          <span>AI Engine</span>
        </button>
      </div>
    </header>
  );
};
