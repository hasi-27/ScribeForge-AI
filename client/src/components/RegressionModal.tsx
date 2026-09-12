import React, { useState } from 'react';
import { X, Play, CheckCircle2, AlertTriangle, Loader2, BarChart3, ShieldCheck } from 'lucide-react';
import { RegressionMatrixItem, RegressionSummary } from '../types';
import { apiClient } from '../services/api';

interface RegressionModalProps {
  onClose: () => void;
}

export const RegressionModal: React.FC<RegressionModalProps> = ({ onClose }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [data, setData] = useState<{
    summary: {
      total_tests: number;
      passed_tests: number;
      pass_rate: string;
      average_industry_specificity_score: number;
      evaluated_at: string;
    };
    matrix: RegressionMatrixItem[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunSuite = async () => {
    setIsRunning(true);
    setError(null);
    try {
      const result = await apiClient.runRegression();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to run regression suite');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '840px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={22} className="text-cyan-400" />
              <span>Section 9.1 Evaluation Benchmark Suite</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Automated regression matrix testing all 4 industries across 1 Week (3 posts), 2 Weeks (6 posts), and 1 Month (12 posts).
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Action button */}
        {!data && !isRunning && (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize: '0.95rem', color: '#e2e8f0', marginBottom: '20px' }}>
              Ready to execute 12 automated generation & validation test cases (4 industries × 3 plan lengths).
            </p>
            <button className="btn btn-primary btn-lg" onClick={handleRunSuite}>
              <Play size={18} />
              <span>Run Automated 12-Matrix Regression</span>
            </button>
          </div>
        )}

        {isRunning && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Loader2 size={36} className="animate-spin text-indigo-400" style={{ margin: '0 auto 16px auto' }} />
            <h4>Running 12 Full Generation & Validation Matrix Tests...</h4>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px' }}>
              Validating schema compliance, exact post count, non-empty fields, and topic dimensions.
            </p>
          </div>
        )}

        {data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Summary Top Banner */}
            <div
              style={{
                padding: '16px 20px',
                borderRadius: '12px',
                background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.12) 0%, rgba(16, 185, 129, 0.12) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#34d399' }}>
                  Benchmark Pass Rate: {data.summary.pass_rate} ({data.summary.passed_tests}/{data.summary.total_tests} Scenarios)
                </div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '2px' }}>
                  Average Industry Specificity Score: <strong>{Math.round(data.summary.average_industry_specificity_score * 100)}%</strong>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={handleRunSuite}>
                <Play size={14} />
                <span>Re-run Suite</span>
              </button>
            </div>

            {/* Matrix Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: '#94a3b8' }}>
                    <th style={{ padding: '8px' }}>Industry</th>
                    <th style={{ padding: '8px' }}>Plan Duration</th>
                    <th style={{ padding: '8px' }}>Post Count</th>
                    <th style={{ padding: '8px' }}>Schema (V-01)</th>
                    <th style={{ padding: '8px' }}>Count (V-02)</th>
                    <th style={{ padding: '8px' }}>Specificity (V-04)</th>
                    <th style={{ padding: '8px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.matrix.map((row, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        background: idx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '10px 8px', fontWeight: 600 }}>{row.industry}</td>
                      <td style={{ padding: '10px 8px' }}>{row.duration}</td>
                      <td style={{ padding: '10px 8px' }}>
                        <span style={{ color: '#6366f1', fontWeight: 700 }}>
                          {row.generated_posts} / {row.expected_posts}
                        </span>
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        {row.schema_valid ? (
                          <span style={{ color: '#34d399' }}>100% Pass</span>
                        ) : (
                          <span style={{ color: '#f87171' }}>Failed</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        {row.count_valid ? (
                          <span style={{ color: '#34d399' }}>Exact Match</span>
                        ) : (
                          <span style={{ color: '#f87171' }}>Drift</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 8px', fontFamily: 'monospace' }}>
                        {Math.round(row.industry_specificity_score * 100)}%
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        {row.all_passed ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: 'rgba(16, 185, 129, 0.15)',
                              color: '#34d399',
                              fontSize: '0.72rem',
                              fontWeight: 700
                            }}
                          >
                            <CheckCircle2 size={12} /> PASSED
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: 'rgba(239, 68, 68, 0.15)',
                              color: '#f87171',
                              fontSize: '0.72rem',
                              fontWeight: 700
                            }}
                          >
                            <AlertTriangle size={12} /> REVIEW
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
