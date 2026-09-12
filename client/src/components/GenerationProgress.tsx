import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Sparkles, ShieldCheck, FileSearch, Layers } from 'lucide-react';

interface GenerationProgressProps {
  onComplete?: () => void;
}

export const GenerationProgress: React.FC<GenerationProgressProps> = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: 'Normalizing & Indexing Reference Context', icon: <FileSearch size={16} /> },
    { title: 'Injecting Domain Strategy & Mandatory Topic Dimensions', icon: <Layers size={16} /> },
    { title: 'Synthesizing High-Res Captions & Actionable Visual Directives', icon: <Sparkles size={16} /> },
    { title: 'Running Automated Quality & Validation Checks (V-01 to V-08)', icon: <ShieldCheck size={16} /> },
    { title: 'Finalizing Structured Social Media Calendar', icon: <CheckCircle2 size={16} /> }
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 500);
    const timer2 = setTimeout(() => setCurrentStep(2), 1200);
    const timer3 = setTimeout(() => setCurrentStep(3), 1900);
    const timer4 = setTimeout(() => setCurrentStep(4), 2600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  return (
    <div className="glass-panel progress-container">
      <div className="spinner" />
      <div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '6px' }}>Orchestrating AI Content Plan</h3>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          Applying strict industry profiles, reference grounding, and schema validation...
        </p>
      </div>

      <div className="progress-steps">
        {steps.map((step, idx) => {
          const isDone = currentStep > idx;
          const isActive = currentStep === idx;

          return (
            <div
              key={idx}
              className={`progress-step-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
            >
              {isDone ? (
                <CheckCircle2 size={18} className="text-emerald-400" />
              ) : isActive ? (
                <Loader2 size={18} className="animate-spin text-indigo-400" />
              ) : (
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #475569' }} />
              )}
              <span style={{ fontWeight: isActive ? 600 : 400 }}>{step.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
