import React, { useState, useEffect } from 'react';
import { X, Cpu, Key, ShieldCheck, Check } from 'lucide-react';
import { apiClient } from '../services/api';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [provider, setProvider] = useState<'builtin' | 'openai' | 'gemini'>('builtin');
  const [apiKey, setApiKey] = useState('');
  const [hasSavedKey, setHasSavedKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    apiClient.getSettings().then(res => {
      if (res.provider) setProvider(res.provider as any);
      setHasSavedKey(res.hasKey);
    });
  }, []);

  const handleSave = async () => {
    await apiClient.updateSettings({ provider, apiKey: apiKey || undefined });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={20} className="text-indigo-400" />
              <span>AI Engine & Provider Settings</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Select between built-in zero-config domain intelligence or external LLMs.
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Provider Selection */}
          <div className="form-group">
            <label className="form-label">Generation Engine Provider</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
              <div
                className={`plan-card ${provider === 'builtin' ? 'selected' : ''}`}
                style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}
                onClick={() => setProvider('builtin')}
              >
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: provider === 'builtin' ? '#6366f1' : '#475569' }} />
                <div>
                  <div style={{ fontWeight: 700, color: '#f8fafc' }}>
                    Built-in Domain AI Engine (Recommended - Zero Keys Needed)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    100% offline, guaranteed strict schema compliance, deterministic post counts, and fast generation.
                  </div>
                </div>
              </div>

              <div
                className={`plan-card ${provider === 'openai' ? 'selected' : ''}`}
                style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}
                onClick={() => setProvider('openai')}
              >
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: provider === 'openai' ? '#10b981' : '#475569' }} />
                <div>
                  <div style={{ fontWeight: 700, color: '#f8fafc' }}>OpenAI (GPT-4o / GPT-4o-mini)</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Connect your own OpenAI API Key for dynamic external prompt completion.
                  </div>
                </div>
              </div>

              <div
                className={`plan-card ${provider === 'gemini' ? 'selected' : ''}`}
                style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}
                onClick={() => setProvider('gemini')}
              >
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: provider === 'gemini' ? '#d946ef' : '#475569' }} />
                <div>
                  <div style={{ fontWeight: 700, color: '#f8fafc' }}>Google Gemini (Gemini 1.5 Flash / Pro)</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Connect your Google AI Studio Gemini API Key.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* API Key Input */}
          {provider !== 'builtin' && (
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Key size={14} />
                <span>{provider === 'openai' ? 'OpenAI API Key' : 'Gemini API Key'}</span>
              </label>
              <input
                type="password"
                className="form-input"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={hasSavedKey ? '•••••••••••••••••••• (Key Configured)' : 'Enter sk-... or AIzaSy...'}
              />
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Your key is stored securely in memory for your session only.
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            {isSaved ? <Check size={16} /> : null}
            <span>{isSaved ? 'Settings Saved!' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
