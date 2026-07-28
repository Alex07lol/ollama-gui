import React, { useState } from 'react';
import { Close, Terminal, Server } from './Icons';
import type { ConnectionStatus } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ollamaHost: string;
  onSaveHost: (host: string) => void;
  connectionStatus: ConnectionStatus;
  onTestConnection: () => Promise<void>;
  enterToSend: boolean;
  setEnterToSend: (val: boolean) => void;
  // Cloud parameters
  isAndroid: boolean;
  cloudBaseUrl: string;
  onSaveCloudBaseUrl: (val: string) => void;
  cloudApiKey: string;
  onSaveCloudApiKey: (val: string) => void;
  cloudModel: string;
  onSaveCloudModel: (val: string) => void;
  apiMode: 'local' | 'cloud';
  onSaveApiMode: (val: 'local' | 'cloud') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  ollamaHost,
  onSaveHost,
  connectionStatus,
  onTestConnection,
  enterToSend,
  setEnterToSend,
  isAndroid,
  cloudBaseUrl,
  onSaveCloudBaseUrl,
  cloudApiKey,
  onSaveCloudApiKey,
  cloudModel,
  onSaveCloudModel,
  apiMode,
  onSaveApiMode,
}) => {
  const [hostInput, setHostInput] = useState(ollamaHost);
  const [baseUrlInput, setBaseUrlInput] = useState(cloudBaseUrl);
  const [apiKeyInput, setApiKeyInput] = useState(cloudApiKey);
  const [modelInput, setModelInput] = useState(cloudModel);
  const [apiModeInput, setApiModeInput] = useState<'local' | 'cloud'>(apiMode);
  const [testing, setTesting] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (isAndroid) {
      onSaveCloudBaseUrl(baseUrlInput.trim());
      onSaveCloudApiKey(apiKeyInput.trim());
      onSaveCloudModel(modelInput.trim());
      onSaveApiMode('cloud');
    } else {
      onSaveApiMode(apiModeInput);
      if (apiModeInput === 'cloud') {
        onSaveCloudBaseUrl(baseUrlInput.trim());
        onSaveCloudApiKey(apiKeyInput.trim());
        onSaveCloudModel(modelInput.trim());
      } else {
        onSaveHost(hostInput.trim());
      }
    }
    onClose();
  };

  const handleTest = async () => {
    setTesting(true);
    if (isAndroid) {
      onSaveCloudBaseUrl(baseUrlInput.trim());
      onSaveCloudApiKey(apiKeyInput.trim());
      onSaveCloudModel(modelInput.trim());
      onSaveApiMode('cloud');
    } else {
      onSaveApiMode(apiModeInput);
      if (apiModeInput === 'cloud') {
        onSaveCloudBaseUrl(baseUrlInput.trim());
        onSaveCloudApiKey(apiKeyInput.trim());
        onSaveCloudModel(modelInput.trim());
      } else {
        onSaveHost(hostInput.trim());
      }
    }
    await onTestConnection();
    setTesting(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Server size={14} className="text-secondary" />
            <span className="modal-title">Settings</span>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <Close size={14} />
          </button>
        </div>

        <div className="modal-body">
          {/* Connection Mode Selection (only on desktop/other versions; Android is locked to cloud) */}
          {!isAndroid && (
            <div className="flex flex-col gap-1.5" style={{ marginBottom: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                API Connection Mode
              </label>
              <select
                value={apiModeInput}
                onChange={(e) => setApiModeInput(e.target.value as 'local' | 'cloud')}
                style={{ width: '100%' }}
              >
                <option value="local">Local Ollama Instance</option>
                <option value="cloud">Cloud API Provider (OpenRouter / Groq / OpenAI)</option>
              </select>
            </div>
          )}

          {isAndroid || apiModeInput === 'cloud' ? (
            /* Cloud API Settings */
            <div className="flex flex-col gap-3">
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Cloud API Configuration
              </label>
              
              <div className="flex flex-col gap-1">
                <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>API Base URL</span>
                <input
                  type="text"
                  value={baseUrlInput}
                  onChange={(e) => setBaseUrlInput(e.target.value)}
                  placeholder="https://openrouter.ai/api/v1"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>API Key</span>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="sk-..."
                  style={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border-primary)',
                    padding: '4px 8px',
                    color: 'var(--text-primary)',
                    borderRadius: '6px',
                    outline: 'none',
                    fontSize: '12px'
                  }}
                />
              </div>

              <div className="flex flex-col gap-1">
                <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Default Model Identifier</span>
                <input
                  type="text"
                  value={modelInput}
                  onChange={(e) => setModelInput(e.target.value)}
                  placeholder="google/gemini-2.5-flash"
                />
              </div>

              <button onClick={handleTest} disabled={testing} style={{ marginTop: '4px' }}>
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
              
              <div className="flex items-center gap-2" style={{ fontSize: '12px', marginTop: '2px' }}>
                <div 
                  style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: 
                      connectionStatus === 'connected' ? 'var(--text-success)' : 
                      connectionStatus === 'disconnected' ? 'var(--text-error)' : 
                      'var(--text-warning)' 
                  }} 
                />
                <span style={{ color: 'var(--text-secondary)' }}>
                  {connectionStatus === 'connected' ? 'Successfully Connected' : 
                   connectionStatus === 'disconnected' ? 'Connection Failed (Check URL/Key)' : 
                   'Checking connection...'}
                </span>
              </div>
            </div>
          ) : (
            /* Host URL Section for Local Ollama */
            <div className="flex flex-col gap-2">
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Ollama Host URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={hostInput}
                  onChange={(e) => setHostInput(e.target.value)}
                  placeholder="http://localhost:11434"
                  style={{ flex: 1 }}
                />
                <button onClick={handleTest} disabled={testing}>
                  {testing ? 'Testing...' : 'Test'}
                </button>
              </div>
              
              <div className="flex items-center gap-2" style={{ fontSize: '12px', marginTop: '2px' }}>
                <div 
                  style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: 
                      connectionStatus === 'connected' ? 'var(--text-success)' : 
                      connectionStatus === 'disconnected' ? 'var(--text-error)' : 
                      'var(--text-warning)' 
                  }} 
                />
                <span style={{ color: 'var(--text-secondary)' }}>
                  {connectionStatus === 'connected' ? 'Connected to Ollama' : 
                   connectionStatus === 'disconnected' ? 'Disconnected (Check Host or CORS)' : 
                   'Checking connection...'}
                </span>
              </div>
            </div>
          )}

          {/* Keyboard Shortcuts Settings */}
          <div className="flex flex-col gap-2" style={{ borderTop: '1px solid var(--border-primary)', paddingTop: '16px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Input & Keyboard Behavior
            </label>
            
            <div className="flex items-center justify-between" style={{ padding: '4px 0' }}>
              <span style={{ color: 'var(--text-primary)' }}>Press Enter to Send Message</span>
              <input
                type="checkbox"
                checked={enterToSend}
                onChange={(e) => setEnterToSend(e.target.checked)}
                style={{ 
                  width: '14px', 
                  height: '14px', 
                  accentColor: 'var(--text-primary)', 
                  cursor: 'pointer',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-secondary)'
                }}
              />
            </div>
            <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              {enterToSend 
                ? 'Pressing Enter will send the prompt. Press Shift+Enter to insert a new line.'
                : 'Pressing Ctrl+Enter will send the prompt. Press Enter to insert a new line.'
              }
            </p>
          </div>

          {/* CORS Guide (Only for Desktop) */}
          {!isAndroid && (
            <div className="flex flex-col gap-2" style={{ borderTop: '1px solid var(--border-primary)', paddingTop: '16px' }}>
              <div className="flex items-center gap-2">
                <Terminal size={13} style={{ color: 'var(--text-secondary)' }} />
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  CORS Setup Guide (Required for Web GUI)
                </label>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                If you receive connection errors while Ollama is running, it is likely blocked by CORS. You must set <code style={{ fontSize: '11px' }}>OLLAMA_ORIGINS="*"</code> when running Ollama.
              </p>
              
              <div style={{ backgroundColor: '#070708', border: '1px solid var(--border-primary)', borderRadius: '4px', padding: '10px', fontSize: '11px', color: '#e4e4e7', fontFamily: 'var(--mono-font)' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '4px', fontSize: '10px' }}># Linux & macOS:</div>
                OLLAMA_ORIGINS="*" ollama serve
                
                <div style={{ color: 'var(--text-muted)', marginTop: '8px', marginBottom: '4px', fontSize: '10px' }}># Windows (PowerShell):</div>
                $env:OLLAMA_ORIGINS="*"<br />
                ollama serve
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button style={{ border: 'none' }} onClick={onClose}>
            Cancel
          </button>
          <button className="primary" onClick={handleSave}>
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
};
