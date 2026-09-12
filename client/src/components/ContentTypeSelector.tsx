import React from 'react';
import { Layers, Video, Image, PlaySquare } from 'lucide-react';
import { ContentFormatType } from '../types';

interface ContentTypeSelectorProps {
  selectedFormat: ContentFormatType;
  onSelectFormat: (format: ContentFormatType) => void;
}

export const ContentTypeSelector: React.FC<ContentTypeSelectorProps> = ({
  selectedFormat,
  onSelectFormat
}) => {
  const formats: {
    type: ContentFormatType;
    icon: React.ReactNode;
    label: string;
  }[] = [
    {
      type: 'Carousel',
      icon: <Layers size={16} className="text-indigo-400" />,
      label: 'Multi-Slide Carousel'
    },
    {
      type: 'Reel / Video',
      icon: <Video size={16} className="text-pink-400" />,
      label: 'Short Reel / Video'
    },
    {
      type: 'Static Post',
      icon: <Image size={16} className="text-cyan-400" />,
      label: 'Single High-Res Image'
    },
    {
      type: 'Story',
      icon: <PlaySquare size={16} className="text-amber-400" />,
      label: 'Interactive Story Arc'
    }
  ];

  return (
    <div className="glass-panel" style={{ padding: '20px' }}>
      <div className="section-title">
        <h3>
          <Layers size={18} className="text-pink-400" />
          <span>3. Content Format / Type</span>
        </h3>
        <span className="step-indicator">Required</span>
      </div>

      <div className="formats-grid">
        {formats.map((fmt) => {
          const isSelected = selectedFormat === fmt.type;

          return (
            <div
              key={fmt.type}
              className={`format-pill ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectFormat(fmt.type)}
            >
              {fmt.icon}
              <span>{fmt.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
