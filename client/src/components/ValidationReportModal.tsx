import React from 'react';
import { ValidationSummary } from '../types';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

interface ValidationReportModalProps {
  validation: ValidationSummary;
  onClose: () => void;
}

export const ValidationReportModal: React.FC<ValidationReportModalProps> = ({
  validation,
  onClose
}) => {
  const passedCount = validation.checks.filter(c => c.passed).length;
  const totalChecks = validation.checks.length;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '760px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={22} className="text-emerald-400" />
              <span>Automated Quality & Validation Suite</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Independent automated evaluation metrics based on Section 9 (V-01 to V-08)
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Overall Status Banner */}
        <div
          style={{
            padding: '16px 20px',
            borderRadius: '12px',
            background: passedCount === totalChecks ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
            border: `1px solid ${passedCount === totalChecks ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: passedCount === totalChecks ? '#34d399' : '#fbbf24' }}>
              {passedCount === totalChecks ? 'All Quality Checks Passed (100%)' : `${passedCount}/${totalChecks} Checks Passed`}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '2px' }}>
              Industry Specificity Score: <strong>{Math.round(validation.industry_specificity_score * 100)}%</strong>
            </div>
          </div>
          <div
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              fontWeight: 800,
              fontSize: '1rem',
              fontFamily: 'Outfit',
              background: 'rgba(0,0,0,0.3)',
              color: '#ffffff'
            }}
          >
            {passedCount}/{totalChecks} PASSED
          </div>
        </div>

        {/* Individual Checks Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {validation.checks.map((check) => (
            <div
              key={check.id}
              style={{
                padding: '14px 16px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}
            >
              <div style={{ marginTop: '2px' }}>
                {check.passed ? (
                  <CheckCircle2 size={18} className="text-emerald-400" />
                ) : (
                  <AlertTriangle size={18} className="text-amber-400" />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>
                    <span style={{ color: '#818cf8', marginRight: '6px' }}>[{check.id}]</span>
                    {check.name}
                  </div>
                  {check.score !== undefined && (
                    <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#94a3b8' }}>
                      Score: {Math.round(check.score * 100)}%
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px', lineHeight: 1.5 }}>
                  {check.message}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
