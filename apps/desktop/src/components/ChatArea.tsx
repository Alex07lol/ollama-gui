import React, { useRef, useEffect, useState } from 'react';
import { Stop, Refresh, Copy, Check, Cpu, Clip, Image as ImageIcon, File as FileIcon, Close } from './Icons';
import type { Conversation, ConnectionStatus } from '../types';
import { Markdown } from './Markdown';
import ollamaLogo from '../assets/logo.png';

interface ChatAreaProps {
  conversation: Conversation | null;
  onSendMessage: (content: string, images: string[], files: any[]) => void;
  isGenerating: boolean;
  onStopGeneration: () => void;
  onRegenerateResponse: () => void;
  onToggleSidebar: () => void;
  onToggleParams: () => void;
  isSidebarOpen: boolean;
  isParamsOpen: boolean;
  connectionStatus: ConnectionStatus;
  enterToSend: boolean;
  onUpdateConversationMode: (mode: 'chat' | 'planning') => void;
  onExecuteAction: (stepId: string, actionType: string, target: string, content?: string) => Promise<void>;
  stepLogs: { [stepId: string]: string };
  onNewConversation?: () => void;
  updateAvailable?: string | null;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  conversation,
  onSendMessage,
  isGenerating,
  onStopGeneration,
  onRegenerateResponse,
  onToggleSidebar,
  onToggleParams,
  isSidebarOpen,
  isParamsOpen,
  connectionStatus,
  enterToSend,
  onUpdateConversationMode,
  onExecuteAction,
  stepLogs,
  onNewConversation,
  updateAvailable,
}) => {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'plan'>('chat');
  const [installing, setInstalling] = useState(false);
  
  // Attachments State
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; content: string; size: number }[]>([]);
  const [attachedImages, setAttachedImages] = useState<string[]>([]); // raw base64 arrays
  const [executingStepId, setExecutingStepId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);

  const handleOneClickInstall = async () => {
    setInstalling(true);
    try {
      if ((window as any).__TAURI__) {
        const { invoke } = await import('@tauri-apps/api/core');
        const result = await invoke<string>('install_ollama');
        alert(result);
      } else {
        window.open('https://ollama.com/download', '_blank');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to install Ollama: ' + err);
    } finally {
      setInstalling(false);
    }
  };

  // Switch to plan tab automatically when a plan completes
  useEffect(() => {
    if (conversation?.mode === 'planning' && conversation?.activePlan) {
      setActiveTab('plan');
    } else {
      setActiveTab('chat');
    }
  }, [conversation?.activePlan, conversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages?.length, isGenerating]);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(200, textareaRef.current.scrollHeight)}px`;
    }
  }, [input]);

  useEffect(() => {
    textareaRef.current?.focus();
    setAttachedFiles([]);
    setAttachedImages([]);
  }, [conversation?.id]);

  if (!conversation) {
    return (
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', position: 'relative' }}>
        {connectionStatus === 'disconnected' && !isAndroid && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-primary)', padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
            <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Ollama is not running or not detected.</span>
            <button 
              onClick={handleOneClickInstall}
              disabled={installing}
              className="primary"
              style={{ padding: '3px 8px', fontSize: '10.5px', backgroundColor: 'var(--status-yellow)', borderColor: 'var(--status-yellow)', color: '#000', fontWeight: 600, borderRadius: '4px' }}
            >
              {installing ? 'Installing...' : 'One-Click Install'}
            </button>
          </div>
        )}
        <div style={{ textAlign: 'center', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <img src={ollamaLogo} alt="Ollama Logo" style={{ width: '48px', height: '48px', margin: '0 auto 8px auto', borderRadius: '8px' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Welcome to Ollama GUI</span>
          <p style={{ fontSize: '11.5px', lineHeight: '1.4', marginBottom: '8px' }}>
            Select a conversation from the sidebar or click below to begin interacting with your local LLMs.
          </p>
          {onNewConversation && (
            <button 
              className="primary" 
              onClick={onNewConversation} 
              style={{ padding: '6px 12px', fontSize: '11.5px', alignSelf: 'center', marginTop: '4px' }}
            >
              Start New Chat
            </button>
          )}
        </div>
      </div>
    );
  }

  const handleSend = () => {
    const text = input.trim();
    if (!text && attachedFiles.length === 0 && attachedImages.length === 0) return;
    if (isGenerating) return;

    onSendMessage(text, attachedImages, attachedFiles);
    setInput('');
    setAttachedFiles([]);
    setAttachedImages([]);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (enterToSend) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    } else {
      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        handleSend();
      }
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setAttachedFiles((prev) => [
          ...prev,
          { name: file.name, content: text, size: file.size },
        ]);
      };
      reader.readAsText(file);
    });

    // Reset input
    e.target.value = '';
  };

  const handleImageAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target?.result as string;
        const rawBase64 = base64Data.split(',')[1];
        setAttachedImages((prev) => [...prev, rawBase64]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removeFileAttachment = (idx: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeImageAttachment = (idx: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const executeStepAction = async (stepId: string, type: string, target: string) => {
    setExecutingStepId(stepId);
    await onExecuteAction(stepId, type, target);
    setExecutingStepId(null);
  };

  return (
    <div className="main-content">
      {updateAvailable && (
        <div 
          style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            borderBottom: '1px solid var(--border-primary)', 
            padding: '8px 14px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            fontSize: '11px',
            color: 'var(--text-secondary)'
          }}
        >
          <span>
            A new version of Ollama GUI is available: <strong>{updateAvailable}</strong>
          </span>
          <a 
            href="https://github.com/Alex07lol/ollama-gui/releases/latest" 
            target="_blank" 
            rel="noreferrer" 
            className="primary button" 
            style={{ padding: '3px 8px', fontSize: '10.5px', textDecoration: 'none', borderRadius: '3px', color: '#fff' }}
          >
            Download
          </a>
        </div>
      )}
      {/* Topbar */}
      <div 
        style={{ 
          height: '45px', 
          minHeight: '45px', 
          borderBottom: '1px solid var(--border-primary)', 
          padding: '0 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-secondary)'
        }}
      >
        <div className="flex items-center gap-3">
          <button 
            className="icon-btn" 
            onClick={onToggleSidebar}
            title={isSidebarOpen ? 'Hide sidebar (Ctrl+B)' : 'Show sidebar (Ctrl+B)'}
          >
            <span style={{ fontSize: '12px', fontWeight: 600 }}>[ ]</span>
          </button>
          
          <div className="flex items-center gap-2">
            <span style={{ fontWeight: 600, fontSize: '12.5px' }}>{conversation.title}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--mono-font)', backgroundColor: 'var(--bg-primary)', padding: '2px 6px', border: '1px solid var(--border-primary)', borderRadius: '3px' }}>
              {conversation.model}
            </span>
          </div>
          {connectionStatus === 'disconnected' && !isAndroid && (
            <button 
              onClick={handleOneClickInstall}
              disabled={installing}
              className="primary"
              style={{
                padding: '2px 8px',
                fontSize: '10.5px',
                backgroundColor: 'var(--status-yellow)',
                borderColor: 'var(--status-yellow)',
                color: '#000',
                fontWeight: 600,
                borderRadius: '4px',
                marginLeft: '8px'
              }}
            >
              {installing ? 'Installing...' : 'One-Click Install'}
            </button>
          )}
        </div>

        {/* Tab Selection Row (If planning mode is active) */}
        <div className="flex items-center gap-3">
          {conversation.mode === 'planning' && conversation.activePlan && (
            <div className="flex gap-1" style={{ backgroundColor: 'var(--bg-primary)', padding: '2px', borderRadius: '4px', border: '1px solid var(--border-primary)' }}>
              <button 
                onClick={() => setActiveTab('chat')}
                style={{ 
                  padding: '3px 8px', 
                  fontSize: '11px', 
                  borderRadius: '3px',
                  border: 'none',
                  backgroundColor: activeTab === 'chat' ? 'var(--surface)' : 'transparent',
                  color: activeTab === 'chat' ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}
              >
                Transcript
              </button>
              <button 
                onClick={() => setActiveTab('plan')}
                style={{ 
                  padding: '3px 8px', 
                  fontSize: '11px', 
                  borderRadius: '3px',
                  border: 'none',
                  backgroundColor: activeTab === 'plan' ? 'var(--surface)' : 'transparent',
                  color: activeTab === 'plan' ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}
              >
                Plan & Execution Board
              </button>
            </div>
          )}

          {isGenerating && (
            <div className="flex items-center gap-1.5" style={{ fontSize: '11px', color: 'var(--status-blue)' }}>
              <span className="streaming-dot" />
              <span>generating...</span>
            </div>
          )}
          
          <button 
            className="icon-btn" 
            onClick={onToggleParams}
            title={isParamsOpen ? 'Hide parameters' : 'Show parameters'}
            style={{ padding: '6px' }}
          >
            <Cpu size={14} style={{ color: isParamsOpen ? 'var(--status-blue)' : 'var(--text-secondary)' }} />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      {activeTab === 'plan' && conversation.activePlan ? (
        /* ==================== AGENT PLANNING & EXECUTION BOARD ==================== */
        <div 
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '24px 20px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '24px', 
            backgroundColor: 'var(--bg-primary)' 
          }}
        >
          {/* Header metadata */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid var(--border-primary)', paddingBottom: '16px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Execution Target
            </span>
            <div className="flex justify-between items-center">
              <h2 style={{ fontSize: '16px', fontWeight: 600 }}>{conversation.title}</h2>
              <div className="flex gap-2">
                <span className="monospace" style={{ fontSize: '11px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)', padding: '2px 6px', border: '1px solid var(--border-primary)', borderRadius: '3px' }}>
                  Complexity: {conversation.activePlan.complexity}
                </span>
              </div>
            </div>

            {conversation.activePlan.objective && (
              <div style={{ marginTop: '8px', padding: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Objective</span>
                <p style={{ color: 'var(--text-primary)', fontSize: '12.5px', lineHeight: '1.5' }}>{conversation.activePlan.objective}</p>
              </div>
            )}
          </div>

          {/* Project Understanding & Risks */}
          <div className="flex gap-4">
            {conversation.activePlan.understanding && (
              <div style={{ flex: 1, padding: '14px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Project Understanding</span>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{conversation.activePlan.understanding}</p>
              </div>
            )}

            {conversation.activePlan.risks && conversation.activePlan.risks.length > 0 && (
              <div style={{ flex: 1, padding: '14px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Risks & Complications</span>
                <div className="flex flex-col gap-2">
                  {conversation.activePlan.risks.map((risk, i) => (
                    <div key={i} className="flex gap-2 items-start" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--status-yellow)' }}>▲</span>
                      <span>{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stages and Checklist Checklist */}
          <div className="flex flex-col gap-5">
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Implementation Stages
            </span>

            {conversation.activePlan.stages.map((stage, idx) => (
              <div 
                key={idx} 
                style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-primary)', 
                  borderRadius: '8px', 
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'none', letterSpacing: 'normal' }}>
                  {stage.title}
                </h3>

                <div className="flex flex-col gap-3">
                  {stage.steps.map((step) => {
                    const hasAction = step.actionType && step.actionTarget;
                    const log = stepLogs[step.id];

                    return (
                      <div 
                        key={step.id} 
                        style={{ 
                          padding: '10px', 
                          backgroundColor: 'var(--bg-primary)', 
                          border: '1px solid var(--border-primary)', 
                          borderRadius: '6px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex gap-2.5 items-start">
                            {/* Checkmark Status indicator */}
                            <div style={{ marginTop: '2px' }}>
                              {step.status === 'completed' ? (
                                <span style={{ color: 'var(--status-green)', fontWeight: 'bold' }}>✓</span>
                              ) : step.status === 'running' ? (
                                <span className="streaming-dot" />
                              ) : step.status === 'failed' ? (
                                <span style={{ color: 'var(--status-red)', fontWeight: 'bold' }}>✗</span>
                              ) : (
                                <input 
                                  type="checkbox" 
                                  style={{ width: '13px', height: '13px', cursor: 'pointer' }}
                                  onChange={(e) => {
                                    // Let users manually toggle completion in plan
                                    step.status = e.target.checked ? 'completed' : 'pending';
                                  }}
                                />
                              )}
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{step.description}</span>
                          </div>
                        </div>

                        {/* If actionable step */}
                        {hasAction && (
                          <div 
                            style={{ 
                              marginTop: '4px',
                              padding: '8px', 
                              backgroundColor: 'var(--bg-secondary)', 
                              border: '1px solid var(--border-primary)', 
                              borderRadius: '4px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px'
                            }}
                          >
                            <div className="flex justify-between items-center">
                              <code style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                {step.actionType === 'execute_command' ? '$ ' : 'file: '}
                                {step.actionTarget}
                              </code>

                              <button 
                                onClick={() => executeStepAction(step.id, step.actionType!, step.actionTarget!)}
                                disabled={executingStepId !== null}
                                className="primary"
                                style={{ padding: '2px 8px', fontSize: '10.5px' }}
                              >
                                {step.status === 'running' ? 'Running...' : 'Approve & Run'}
                              </button>
                            </div>

                            {/* Execution Terminal Output */}
                            {log && (
                              <pre 
                                style={{ 
                                  margin: '4px 0 0 0', 
                                  padding: '8px', 
                                  backgroundColor: '#050506', 
                                  border: '1px solid var(--border-primary)', 
                                  borderRadius: '3px',
                                  fontSize: '11px',
                                  color: step.status === 'failed' ? 'var(--status-red)' : 'var(--text-secondary)',
                                  overflowX: 'auto',
                                  maxHeight: '120px',
                                  whiteSpace: 'pre-wrap'
                                }}
                              >
                                {log}
                              </pre>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ==================== TRANSCRIPT CHAT VIEW ==================== */
        <div 
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}
        >
          {conversation.messages.length === 0 ? (
            /* Clean Empty Welcome Config */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <div style={{ maxWidth: '400px', width: '100%', border: '1px solid var(--border-primary)', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', padding: '20px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '12px' }}>
                  Conversation Configuration
                </span>
                
                <div className="flex flex-col gap-2" style={{ fontSize: '12px' }}>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Model:</span>
                    <span className="monospace" style={{ color: 'var(--text-primary)' }}>{conversation.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Temperature:</span>
                    <span className="monospace" style={{ color: 'var(--text-primary)' }}>{conversation.temperature}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Mode:</span>
                    <span className="monospace" style={{ color: 'var(--status-blue)', textTransform: 'capitalize' }}>{conversation.mode} mode</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>System prompt:</span>
                    <span style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '200px' }}>
                      {conversation.systemPrompt || 'None'}
                    </span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-primary)', marginTop: '16px', paddingTop: '16px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                    Keyboard Shortcuts
                  </span>
                  <div className="flex flex-col gap-2" style={{ fontSize: '11.5px' }}>
                    <div className="flex justify-between items-center">
                      <span>Send prompt</span>
                      <kbd>{enterToSend ? 'Enter' : 'Ctrl+Enter'}</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>New conversation</span>
                      <kbd>Ctrl+N</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Command palette</span>
                      <kbd>Ctrl+K</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Toggle sidebar</span>
                      <kbd>Ctrl+B</kbd>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Messages List */
            conversation.messages.map((message) => {
              const isUser = message.role === 'user';
              return (
                <div 
                  key={message.id}
                  className="message-row"
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '4px',
                    alignSelf: 'stretch'
                  }}
                >
                  {/* Message Header */}
                  <div className="flex justify-between items-center" style={{ fontSize: '11px' }}>
                    <span 
                      style={{ 
                        fontWeight: 600, 
                        color: isUser ? 'var(--status-blue)' : 'var(--text-primary)',
                        fontFamily: isUser ? 'var(--sans-font)' : 'var(--mono-font)'
                      }}
                    >
                      {isUser ? 'User' : conversation.model}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>

                  {/* Message Content Body */}
                  <div 
                    style={{ 
                      padding: '8px 12px',
                      borderRadius: '4px',
                      backgroundColor: isUser ? 'var(--bg-secondary)' : 'transparent',
                      border: isUser ? '1px solid var(--border-primary)' : 'none',
                      color: 'var(--text-primary)',
                      fontSize: '12.5px',
                      lineHeight: '1.6'
                    }}
                  >
                    {/* Render attachments preview if user message */}
                    {isUser && (
                      <div className="flex flex-col gap-2">
                        {message.files && message.files.length > 0 && (
                          <div className="flex flex-wrap gap-1.5" style={{ marginBottom: '6px' }}>
                            {message.files.map((f, i) => (
                              <div key={i} className="flex items-center gap-1.5" style={{ padding: '3px 6px', backgroundColor: 'var(--surface)', border: '1px solid var(--border-primary)', borderRadius: '3px', fontSize: '10.5px' }}>
                                <FileIcon size={11} style={{ color: 'var(--text-secondary)' }} />
                                <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--mono-font)' }}>{f.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {message.images && message.images.length > 0 && (
                          <div className="flex flex-wrap gap-1.5" style={{ marginBottom: '6px' }}>
                            {message.images.map((img, i) => (
                              <img key={i} src={`data:image/jpeg;base64,${img}`} style={{ height: '40px', borderRadius: '4px', border: '1px solid var(--border-primary)' }} alt="Attached base64 thumbnail" />
                            ))}
                          </div>
                        )}
                        <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
                      </div>
                    )}

                    {!isUser && (
                      <Markdown content={message.content} />
                    )}

                    {message.error && (
                      <div style={{ color: 'var(--status-red)', marginTop: '8px', fontSize: '11.5px', fontStyle: 'italic' }}>
                        Connection Error: Make sure Ollama is serving locally and CORS is enabled.
                      </div>
                    )}
                  </div>

                  {/* Hover actions */}
                  {!isUser && message.content && (
                    <div 
                      className="flex gap-2 message-actions" 
                      style={{ 
                        opacity: 0, 
                        transition: 'opacity 0.15s ease',
                        marginTop: '2px',
                        paddingLeft: '12px'
                      }}
                    >
                      <button 
                        onClick={() => handleCopyMessage(message.id, message.content)}
                        style={{ border: 'none', padding: '2px 4px', fontSize: '10.5px', color: 'var(--text-muted)' }}
                        onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                        onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                      >
                        {copiedId === message.id ? <Check size={11} style={{ marginRight: '3px', color: 'var(--status-green)' }} /> : <Copy size={11} style={{ marginRight: '3px' }} />}
                        {copiedId === message.id ? 'Copied' : 'Copy'}
                      </button>
                      
                      {!isGenerating && (
                        <button 
                          onClick={onRegenerateResponse}
                          style={{ border: 'none', padding: '2px 4px', fontSize: '10.5px', color: 'var(--text-muted)' }}
                          onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                          onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                        >
                          <Refresh size={11} style={{ marginRight: '3px' }} />
                          Regenerate
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Box Form Area */}
      <div 
        style={{ 
          padding: '12px 20px 20px 20px', 
          borderTop: '1px solid var(--border-primary)',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        {/* Attachment Trays */}
        {(attachedFiles.length > 0 || attachedImages.length > 0) && (
          <div className="flex flex-wrap gap-2" style={{ paddingBottom: '6px' }}>
            {attachedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center gap-1.5" style={{ padding: '4px 8px', backgroundColor: 'var(--surface)', border: '1px solid var(--border-primary)', borderRadius: '4px', fontSize: '11px' }}>
                <FileIcon size={12} style={{ color: 'var(--text-secondary)' }} />
                <span style={{ fontFamily: 'var(--mono-font)' }}>{file.name}</span>
                <button 
                  onClick={() => removeFileAttachment(idx)}
                  style={{ border: 'none', background: 'transparent', padding: '1px', display: 'flex', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <Close size={10} />
                </button>
              </div>
            ))}

            {attachedImages.map((img, idx) => (
              <div key={idx} style={{ position: 'relative', display: 'inline-block' }}>
                <img src={`data:image/jpeg;base64,${img}`} style={{ height: '40px', borderRadius: '4px', border: '1px solid var(--border-primary)' }} alt="Image preview" />
                <button 
                  onClick={() => removeImageAttachment(idx)}
                  style={{ 
                    position: 'absolute', 
                    top: '-6px', 
                    right: '-6px', 
                    backgroundColor: 'var(--surface)', 
                    border: '1px solid var(--border-primary)',
                    borderRadius: '50%',
                    padding: '2px', 
                    display: 'flex', 
                    cursor: 'pointer' 
                  }}
                >
                  <Close size={8} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 items-end">
          {/* File Attach Hidden Inputs */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileAttach} 
            style={{ display: 'none' }} 
            multiple
          />
          <input 
            type="file" 
            ref={imageInputRef} 
            onChange={handleImageAttach} 
            accept="image/*" 
            style={{ display: 'none' }} 
            multiple
          />

          {/* Attachment Actions */}
          <div className="flex gap-1" style={{ marginRight: '4px' }}>
            <button 
              className="icon-btn" 
              onClick={() => fileInputRef.current?.click()} 
              title="Attach Code/Text File"
              style={{ height: '36px', width: '36px', padding: 0 }}
            >
              <Clip size={15} />
            </button>
            <button 
              className="icon-btn" 
              onClick={() => imageInputRef.current?.click()} 
              title="Attach Image (Vision Models)"
              style={{ height: '36px', width: '36px', padding: 0 }}
            >
              <ImageIcon size={15} />
            </button>
          </div>

          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              connectionStatus !== 'connected' ? 'Ollama disconnected...' : 
              isGenerating ? 'Generating response...' : 
              conversation.mode === 'planning' ? 'Prompt agent plan (e.g. Create a simple vite app)...' :
              `Message ${conversation.model}...`
            }
            disabled={connectionStatus !== 'connected' || isGenerating}
            style={{
              flex: 1,
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-primary)',
              resize: 'none',
              padding: '10px 12px',
              fontSize: '12.5px',
              lineHeight: '1.4',
              maxHeight: '200px',
              overflowY: 'auto'
            }}
          />

          {isGenerating ? (
            <button 
              className="danger" 
              onClick={onStopGeneration}
              style={{ height: '36px', width: '36px', padding: 0 }}
              title="Stop generating"
            >
              <Stop size={14} />
            </button>
          ) : (
            <button 
              className="primary" 
              onClick={handleSend}
              disabled={(!input.trim() && attachedFiles.length === 0 && attachedImages.length === 0) || connectionStatus !== 'connected'}
              style={{ height: '36px', padding: '0 16px', fontSize: '12px' }}
            >
              Send
            </button>
          )}
        </div>

        {/* Input Footer: Mode selectors and typing status */}
        <div className="flex justify-between items-center" style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '0 2px' }}>
          <div className="flex gap-3 items-center">
            {/* Conversation Mode Selector Toggle */}
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mode:</span>
              <div className="flex" style={{ border: '1px solid var(--border-primary)', borderRadius: '4px', padding: '1px' }}>
                <button 
                  onClick={() => onUpdateConversationMode('chat')}
                  style={{ 
                    padding: '2px 6px', 
                    fontSize: '9.5px', 
                    border: 'none', 
                    borderRadius: '2px', 
                    backgroundColor: conversation.mode === 'chat' ? 'var(--surface)' : 'transparent',
                    color: conversation.mode === 'chat' ? 'var(--text-primary)' : 'var(--text-muted)'
                  }}
                >
                  Chat
                </button>
                <button 
                  onClick={() => onUpdateConversationMode('planning')}
                  style={{ 
                    padding: '2px 6px', 
                    fontSize: '9.5px', 
                    border: 'none', 
                    borderRadius: '2px',
                    backgroundColor: conversation.mode === 'planning' ? 'var(--surface)' : 'transparent',
                    color: conversation.mode === 'planning' ? 'var(--text-primary)' : 'var(--text-muted)'
                  }}
                >
                  Planning
                </button>
              </div>
            </div>
            <span>
              {enterToSend ? 'Enter to send, Shift+Enter for newline' : 'Ctrl+Enter to send, Enter for newline'}
            </span>
          </div>
          <span className="monospace" style={{ fontSize: '10px' }}>
            {input.length} chars
          </span>
        </div>
      </div>

      <style>{`
        .message-row:hover .message-actions {
          opacity: 1 !important;
        }
        .streaming-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--status-blue);
          display: inline-block;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};
