import React from 'react';
import { Cpu, Info } from './Icons';
import type { Conversation, OllamaModel } from '../types';

interface ParametersPanelProps {
  activeConversation: Conversation | null;
  models: OllamaModel[];
  onUpdateParams: (params: Partial<Conversation>) => void;
  onOpenModelManager: () => void;
}

export const ParametersPanel: React.FC<ParametersPanelProps> = ({
  activeConversation,
  models,
  onUpdateParams,
  onOpenModelManager,
}) => {
  if (!activeConversation) {
    return (
      <div className="parameters-panel" style={{ padding: '20px', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <Info size={24} style={{ marginBottom: '8px' }} />
        <span>Select or create a conversation to configure parameters.</span>
      </div>
    );
  }

  const selectedModelData = models.find((m) => m.name === activeConversation.model);

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="parameters-panel">
      {/* Panel Header */}
      <div 
        style={{ 
          padding: '16px 14px', 
          borderBottom: '1px solid var(--border-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <Cpu size={14} style={{ color: 'var(--text-secondary)' }} />
        <span className="panel-title">Model Parameters</span>
      </div>

      <div 
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {/* Model Selection */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Model</label>
            <button 
              onClick={onOpenModelManager}
              style={{ fontSize: '10px', padding: '2px 4px', border: 'none', color: 'var(--status-blue)' }}
            >
              manage
            </button>
          </div>
          {models.length === 0 ? (
            <div style={{ fontSize: '11.5px', color: 'var(--text-warning)', padding: '6px 8px', backgroundColor: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)', borderRadius: '4px' }}>
              No models pulled. Go to Models manager to download one.
            </div>
          ) : (
            <select
              value={activeConversation.model}
              onChange={(e) => onUpdateParams({ model: e.target.value })}
              style={{ width: '100%' }}
            >
              {models.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* System Prompt */}
        <div className="flex flex-col gap-1.5">
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>System Instructions</label>
          <textarea
            value={activeConversation.systemPrompt}
            onChange={(e) => onUpdateParams({ systemPrompt: e.target.value })}
            placeholder="You are a helpful and precise assistant..."
            rows={5}
            style={{ 
              width: '100%', 
              fontSize: '11.5px', 
              resize: 'vertical',
              fontFamily: 'var(--sans-font)',
              lineHeight: '1.4'
            }}
          />
        </div>

        {/* Temperature */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center" style={{ fontSize: '11px' }}>
            <label style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Temperature</label>
            <span style={{ fontFamily: 'var(--mono-font)', color: 'var(--text-primary)' }}>{activeConversation.temperature}</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="2.0"
            step="0.05"
            value={activeConversation.temperature}
            onChange={(e) => onUpdateParams({ temperature: parseFloat(e.target.value) })}
            style={{ 
              width: '100%', 
              accentColor: 'var(--text-primary)',
              cursor: 'pointer' 
            }}
          />
          <div className="flex justify-between" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            <span>Precise (0.0)</span>
            <span>Creative (2.0)</span>
          </div>
        </div>

        {/* Context Length / num_ctx */}
        <div className="flex flex-col gap-1.5">
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Context Length (num_ctx)</label>
          <select
            value={activeConversation.numCtx}
            onChange={(e) => onUpdateParams({ numCtx: parseInt(e.target.value) })}
            style={{ width: '100%' }}
          >
            <option value={2048}>2,048 tokens</option>
            <option value={4096}>4,096 tokens</option>
            <option value={8192}>8,192 tokens</option>
            <option value={16384}>16,384 tokens</option>
            <option value={32768}>32,768 tokens</option>
            <option value={65536}>65,536 tokens</option>
          </select>
        </div>

        {/* Max Tokens / num_predict */}
        <div className="flex flex-col gap-1.5">
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Max Predicting Tokens</label>
          <input
            type="number"
            value={activeConversation.maxTokens}
            onChange={(e) => onUpdateParams({ maxTokens: parseInt(e.target.value) || -1 })}
            style={{ width: '100%' }}
            placeholder="-1 (unlimited)"
          />
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Set to -1 for model default max.</span>
        </div>

        {/* Top P & Repeat Penalty collapsible details */}
        <div className="flex flex-col gap-3" style={{ borderTop: '1px solid var(--border-primary)', paddingTop: '16px' }}>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center" style={{ fontSize: '11px' }}>
              <label style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Top P</label>
              <span style={{ fontFamily: 'var(--mono-font)' }}>{activeConversation.topP}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={activeConversation.topP}
              onChange={(e) => onUpdateParams({ topP: parseFloat(e.target.value) })}
              style={{ width: '100%', accentColor: 'var(--text-primary)' }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center" style={{ fontSize: '11px' }}>
              <label style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Repeat Penalty</label>
              <span style={{ fontFamily: 'var(--mono-font)' }}>{activeConversation.repeatPenalty}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={activeConversation.repeatPenalty}
              onChange={(e) => onUpdateParams({ repeatPenalty: parseFloat(e.target.value) })}
              style={{ width: '100%', accentColor: 'var(--text-primary)' }}
            />
          </div>
        </div>

        {/* Active Model Info */}
        {selectedModelData && (
          <div 
            style={{ 
              borderTop: '1px solid var(--border-primary)', 
              paddingTop: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Active Model Stats</span>
            <div 
              style={{ 
                backgroundColor: 'var(--bg-primary)', 
                border: '1px solid var(--border-primary)', 
                borderRadius: '4px',
                padding: '10px',
                fontSize: '11px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Disk Space:</span>
                <span className="monospace">{formatSize(selectedModelData.size)}</span>
              </div>
              {selectedModelData.details.parameter_size && (
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Parameters:</span>
                  <span className="monospace">{selectedModelData.details.parameter_size}</span>
                </div>
              )}
              {selectedModelData.details.quantization_level && (
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Quantization:</span>
                  <span className="monospace">{selectedModelData.details.quantization_level}</span>
                </div>
              )}
              {selectedModelData.details.family && (
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Family:</span>
                  <span className="monospace">{selectedModelData.details.family}</span>
                </div>
              )}
              {selectedModelData.details.format && (
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Format:</span>
                  <span className="monospace">{selectedModelData.details.format}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
