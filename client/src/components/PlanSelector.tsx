import React from 'react';
import { DurationType } from '../types';
import { Calendar, ShieldCheck } from 'lucide-react';

interface PlanSelectorProps {
  selectedDuration: DurationType;
  onSelectDuration: (duration: DurationType) => void;
}

export const PlanSelector: React.FC<PlanSelectorProps> = ({
  selectedDuration,
  onSelectDuration
}) => {
  const plans: {
    duration: DurationType;
    posts: number;
    cadence: string;
    description: string;
  }[] = [
    {
      duration: '1 Week',
      posts: 3,
      cadence: '3 posts / week',
      description: 'Focused weekly spotlight campaign'
    },
    {
      duration: '2 Weeks',
      posts: 6,
      cadence: '3 posts / week',
      description: 'Bi-weekly narrative arc'
    },
    {
      duration: '1 Month',
      posts: 12,
      cadence: '3 posts / week',
      description: 'Full monthly editorial schedule'
    }
  ];

  return (
    <div className="glass-panel" style={{ padding: '20px' }}>
      <div className="section-title">
        <h3>
          <Calendar size={18} className="text-cyan-400" />
          <span>2. Select Duration & Plan</span>
        </h3>
        <span className="step-indicator" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ShieldCheck size={12} className="text-cyan-400" />
          Deterministic Mapping
        </span>
      </div>

      <div className="plans-row">
        {plans.map((plan) => {
          const isSelected = selectedDuration === plan.duration;

          return (
            <div
              key={plan.duration}
              className={`plan-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectDuration(plan.duration)}
            >
              <div className="plan-duration">{plan.duration}</div>
              <div className="plan-posts-count">{plan.posts}</div>
              <div className="plan-posts-label">Posts Locked</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '4px' }}>
                {plan.cadence}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
