import React, { useState } from 'react';
import { Close, Trash, Server, AlertTriangle, Plus } from './Icons';
import type { OllamaModel } from '../types';

interface ModelManagerProps {
  isOpen: boolean;
  onClose: () => void;
  models: OllamaModel[];
  onRefreshModels: () => Promise<void>;
  ollamaHost: string;
}

export const ModelManager: React.FC<ModelManagerProps> = ({
  isOpen,
  onClose,
  models,
  onRefreshModels,
  ollamaHost,
}) => {
  const [modelToPull, setModelToPull] = useState('');
  const [isPulling, setIsPulling] = useState(false);
  const [pullStatus, setPullStatus] = useState('');
  const [pullProgress, setPullProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePull = async () => {
    const targetModel = modelToPull.trim();
    if (!targetModel) return;

    setIsPulling(true);
    setPullProgress(0);
    setPullStatus('Initiating pull request...');
    setErrorMsg('');

    try {
      const response = await fetch(`${ollamaHost}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: targetModel, stream: true }),
      });

      if (!response.ok) {
        throw new Error(`Failed to initiate pull: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Readable stream not supported in response.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last partial line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            
            if (data.error) {
              throw new Error(data.error);
            }
            
            if (data.status) {
              setPullStatus(data.status);
            }
            
            if (data.completed && data.total) {
              const pct = Math.round((data.completed / data.total) * 100);
              setPullProgress(pct);
              
              const completedGB = (data.completed / (1024 * 1024 * 1024)).toFixed(2);
              const totalGB = (data.total / (1024 * 1024 * 1024)).toFixed(2);
              setPullStatus(`Downloading: ${completedGB} GB / ${totalGB} GB (${pct}%)`);
            }
          } catch (e: any) {
            console.error('Error parsing pull stream chunk', e);
            if (e.message) {
              setErrorMsg(e.message);
            }
          }
        }
      }

      setPullStatus('Model pulled successfully!');
      setPullProgress(100);
      setModelToPull('');
      await onRefreshModels();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred during pull.');
      setPullStatus('');
    } finally {
      setIsPulling(false);
    }
  };

  const handleDelete = async (modelName: string) => {
    if (!confirm(`Are you sure you want to delete model "${modelName}"?`)) return;

    try {
      const response = await fetch(`${ollamaHost}/api/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelName }),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete model: ${response.statusText}`);
      }

      await onRefreshModels();
    } catch (err: any) {
      console.error(err);
      alert(`Error deleting model: ${err.message}`);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ width: '560px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Server size={14} className="text-secondary" />
            <span className="modal-title">Model Manager</span>
          </div>
          <button className="icon-btn" onClick={onClose} disabled={isPulling}>
            <Close size={14} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '70vh' }}>
          {/* Pull Model Form */}
          <div className="flex flex-col gap-2" style={{ borderBottom: '1px solid var(--border-primary)', paddingBottom: '16px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pull Model from Ollama Library
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={modelToPull}
                onChange={(e) => setModelToPull(e.target.value)}
                placeholder="e.g. llama3:8b, mistral, deepseek-coder"
                disabled={isPulling}
                style={{ flex: 1 }}
              />
              <button 
                onClick={handlePull} 
                disabled={isPulling || !modelToPull.trim()}
                className="primary"
                style={{ height: '34px' }}
              >
                <Plus size={14} />
                Pull Model
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="flex items-center gap-2" style={{ color: 'var(--text-error)', fontSize: '12px', marginTop: '4px' }}>
                <AlertTriangle size={14} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Pull Progress indicator */}
            {isPulling && (
              <div className="flex flex-col gap-1.5" style={{ marginTop: '8px', padding: '10px', backgroundColor: 'var(--bg-primary)', borderRadius: '4px', border: '1px solid var(--border-secondary)' }}>
                <div className="flex justify-between" style={{ fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--mono-font)' }}>{pullStatus}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{pullProgress}%</span>
                </div>
                <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--surface)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${pullProgress}%`, 
                      height: '100%', 
                      backgroundColor: 'var(--status-blue)', 
                      transition: 'width 0.2s ease' 
                    }} 
                  />
                </div>
              </div>
            )}
          </div>

          {/* Local Models List */}
          <div className="flex flex-col gap-2">
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pulled Models ({models.length})
            </label>

            {models.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                No local models found. Use the search bar above to pull your first model.
              </div>
            ) : (
              <div className="flex flex-col gap-1" style={{ overflowY: 'auto', maxHeight: '250px' }}>
                {models.map((model) => (
                  <div 
                    key={model.name}
                    className="flex justify-between items-center"
                    style={{ 
                      padding: '8px 10px', 
                      backgroundColor: 'var(--bg-primary)', 
                      border: '1px solid var(--border-primary)', 
                      borderRadius: '4px'
                    }}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'var(--mono-font)' }}>
                        {model.name}
                      </span>
                      <div className="flex gap-3" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        <span>Size: {formatSize(model.size)}</span>
                        {model.details.parameter_size && <span>Params: {model.details.parameter_size}</span>}
                        {model.details.quantization_level && <span>Quant: {model.details.quantization_level}</span>}
                      </div>
                    </div>
                    <button 
                      className="icon-btn danger" 
                      onClick={() => handleDelete(model.name)}
                      disabled={isPulling}
                      style={{ padding: '6px' }}
                    >
                      <Trash size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button style={{ border: 'none' }} onClick={onClose} disabled={isPulling}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
