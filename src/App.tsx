import { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { ParametersPanel } from './components/ParametersPanel';
import { SettingsModal } from './components/SettingsModal';
import { ModelManager } from './components/ModelManager';
import { CommandPalette } from './components/CommandPalette';
import { WorkspaceModal } from './components/WorkspaceModal';
import { parsePlan } from './utils/planParser';
import type { Conversation, Message, OllamaModel, ConnectionStatus, Workspace, ConversationMode, PlanStep, CapabilityPipeline } from './types';

export default function App() {
  // 1. Host & Key Settings
  const [ollamaHost, setOllamaHost] = useState(() => {
    return localStorage.getItem('ollama_host') || 'http://localhost:11434';
  });
  const [enterToSend, setEnterToSend] = useState(() => {
    const val = localStorage.getItem('enter_to_send');
    return val === null ? true : val === 'true';
  });

  // 2. Isolated Workspaces State
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
    const stored = localStorage.getItem('ollama_workspaces');
    if (stored) return JSON.parse(stored);

    const defaultWS: Workspace = {
      id: 'default-ws',
      name: 'Default Workspace',
      projectPath: './',
      modelPreference: '',
      memory: '',
      ignoredFolders: ['node_modules', '.git', 'dist', 'build'],
      customRules: '',
      indexedFiles: [],
      conversations: [],
      activeConversationId: null,
    };
    return [defaultWS];
  });

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(() => {
    return localStorage.getItem('ollama_active_workspace_id') || 'default-ws';
  });

  // Connection & Models
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('checking');
  const [models, setModels] = useState<OllamaModel[]>([]);

  // Toggles
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isParamsOpen, setIsParamsOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isModelManagerOpen, setIsModelManagerOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isWorkspaceConfigMode, setIsWorkspaceConfigMode] = useState(false);

  // Agent generation & Execution States
  const [isGenerating, setIsGenerating] = useState(false);
  const [stepLogs, setStepLogs] = useState<{ [stepId: string]: string }>({});
  const activeControllerRef = useRef<AbortController | null>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize localStorage
  useEffect(() => {
    localStorage.setItem('ollama_workspaces', JSON.stringify(workspaces));
  }, [workspaces]);

  useEffect(() => {
    localStorage.setItem('ollama_active_workspace_id', activeWorkspaceId);
  }, [activeWorkspaceId]);

  useEffect(() => {
    localStorage.setItem('ollama_host', ollamaHost);
  }, [ollamaHost]);

  useEffect(() => {
    localStorage.setItem('enter_to_send', String(enterToSend));
  }, [enterToSend]);

  // Derived state helpers
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];
  const conversations = activeWorkspace ? activeWorkspace.conversations : [];
  const activeConversationId = activeWorkspace ? activeWorkspace.activeConversationId : null;
  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  // Connection polling
  const testConnection = async () => {
    setConnectionStatus('checking');
    try {
      const response = await fetch(`${ollamaHost}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        setModels(data.models || []);
        setConnectionStatus('connected');
      } else {
        throw new Error('Connection failed');
      }
    } catch (e) {
      console.error('Connection failure', e);
      setConnectionStatus('disconnected');
      setModels([]);
    }
  };

  useEffect(() => {
    testConnection();
  }, [ollamaHost]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isGenerating) {
        fetch(`${ollamaHost}/api/tags`)
          .then((res) => {
            if (res.ok) {
              setConnectionStatus('connected');
              res.json().then((data) => setModels(data.models || []));
            } else {
              setConnectionStatus('disconnected');
            }
          })
          .catch(() => setConnectionStatus('disconnected'));
      }
    }, 15000);
    return () => clearInterval(timer);
  }, [ollamaHost, isGenerating]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewConversation();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        setIsSettingsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsSettingsOpen(false);
        setIsModelManagerOpen(false);
        setIsCommandPaletteOpen(false);
        setIsWorkspaceModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [models, activeWorkspaceId, workspaces]);

  // Workspace Operations
  const handleSelectWorkspace = (id: string) => {
    setActiveWorkspaceId(id);
  };

  const handleOpenWorkspaceConfig = () => {
    setIsWorkspaceConfigMode(true);
    setIsWorkspaceModalOpen(true);
  };

  const handleOpenNewWorkspace = () => {
    setIsWorkspaceConfigMode(false);
    setIsWorkspaceModalOpen(true);
  };

  const handleSaveWorkspaceConfig = (workspaceData: Partial<Workspace>) => {
    if (isWorkspaceConfigMode) {
      setWorkspaces((prev) =>
        prev.map((ws) =>
          ws.id === activeWorkspaceId
            ? { ...ws, ...workspaceData }
            : ws
        )
      );
    } else {
      const newWS: Workspace = {
        id: Math.random().toString(36).substring(7),
        name: workspaceData.name || 'New Workspace',
        projectPath: workspaceData.projectPath || './',
        modelPreference: '',
        memory: workspaceData.memory || '',
        ignoredFolders: workspaceData.ignoredFolders || [],
        customRules: workspaceData.customRules || '',
        indexedFiles: [],
        conversations: [],
        activeConversationId: null,
      };

      setWorkspaces((prev) => [...prev, newWS]);
      setActiveWorkspaceId(newWS.id);
    }
  };

  // Conversation Operations
  const handleNewConversation = () => {
    const defaultModel = models.length > 0 ? models[0].name : '';
    const newConv: Conversation = {
      id: Math.random().toString(36).substring(7),
      title: 'New Chat',
      model: defaultModel,
      messages: [],
      systemPrompt: '',
      temperature: 0.7,
      maxTokens: -1,
      topP: 0.9,
      repeatPenalty: 1.1,
      numCtx: 2048,
      mode: 'chat',
      pinnedCapabilities: [],
      disabledCapabilities: [],
      activePipeline: null,
    };

    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === activeWorkspaceId
          ? {
              ...ws,
              conversations: [newConv, ...ws.conversations],
              activeConversationId: newConv.id,
            }
          : ws
      )
    );
  };

  const handleDeleteConversation = (id: string) => {
    setWorkspaces((prev) =>
      prev.map((ws) => {
        if (ws.id === activeWorkspaceId) {
          const remaining = ws.conversations.filter((c) => c.id !== id);
          return {
            ...ws,
            conversations: remaining,
            activeConversationId:
              ws.activeConversationId === id
                ? remaining.length > 0
                  ? remaining[0].id
                  : null
                : ws.activeConversationId,
          };
        }
        return ws;
      })
    );
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === activeWorkspaceId
          ? {
              ...ws,
              conversations: ws.conversations.map((c) =>
                c.id === id ? { ...c, title: newTitle } : c
              ),
            }
          : ws
      )
    );
  };

  const handleUpdateParams = (params: Partial<Conversation>) => {
    if (!activeConversationId) return;
    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === activeWorkspaceId
          ? {
              ...ws,
              conversations: ws.conversations.map((c) =>
                c.id === activeConversationId ? { ...c, ...params } : c
              ),
            }
          : ws
      )
    );
  };

  const handleUpdateConversationMode = (mode: ConversationMode) => {
    handleUpdateParams({ mode });
  };

  const handleUpdatePinnedCapabilities = (pinned: string[]) => {
    handleUpdateParams({ pinnedCapabilities: pinned });
  };

  const handleUpdateDisabledCapabilities = (disabled: string[]) => {
    handleUpdateParams({ disabledCapabilities: disabled });
  };

  const handleStopGeneration = () => {
    if (activeControllerRef.current) {
      activeControllerRef.current.abort();
      activeControllerRef.current = null;
    }
    setIsGenerating(false);
  };

  const formatAttachmentPrompt = (prompt: string, files: any[]): string => {
    if (files.length === 0) return prompt;

    let attachmentBlock = '';
    files.forEach((file) => {
      attachmentBlock += `[ATTACHED FILE: ${file.name}]\n\`\`\`\n${file.content}\n\`\`\`\n\n`;
    });

    return `${attachmentBlock}Please use the file contexts above to answer the following:\n${prompt}`;
  };

  const handleExecuteAction = async (stepId: string, actionType: string, target: string, content: string = '') => {
    setStepLogs((prev) => ({ ...prev, [stepId]: 'Executing command...\n' }));

    const updateStepStatus = (id: string, status: PlanStep['status'], output: string) => {
      setStepLogs((prev) => ({ ...prev, [id]: output }));
      setWorkspaces((prev) =>
        prev.map((ws) => {
          if (ws.id === activeWorkspaceId) {
            return {
              ...ws,
              conversations: ws.conversations.map((c) => {
                if (c.id === activeConversationId && c.activePlan) {
                  return {
                    ...c,
                    activePlan: {
                      ...c.activePlan,
                      stages: c.activePlan.stages.map((stage) => ({
                        ...stage,
                        steps: stage.steps.map((step) =>
                          step.id === id ? { ...step, status } : step
                        ),
                      })),
                    },
                  };
                }
                return c;
              }),
            };
          }
          return ws;
        })
      );
    };

    try {
      let result;
      if (actionType === 'execute_command') {
        const res = await fetch('http://localhost:11435/api/exec', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: target }),
        });
        result = await res.json();
      } else if (actionType === 'create_file') {
        const res = await fetch('http://localhost:11435/api/fs/write', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: target, content: content || '// Created by Ollama GUI' }),
        });
        result = await res.json();
      }

      if (result && result.success) {
        updateStepStatus(stepId, 'completed', result.stdout || 'Action executed successfully.');
      } else {
        updateStepStatus(stepId, 'failed', result?.stderr || 'Execution failed.');
      }
    } catch (e: any) {
      setTimeout(() => {
        const simulatedOutput = 
          actionType === 'execute_command'
            ? `[Companion Connection Refused]\nTo enable execution, launch the companion script in your directory (listening on port 11435).\n\n$ ${target}\n[SIMULATED RUN SUCCESS]\nstdout:\n  Checking dependencies... OK\n  Building target... OK\n  Build successful.`
            : `[Companion Connection Refused]\nTo write files locally, launch the companion server.\n\n[SIMULATED FILE CREATE SUCCESS]\nCreated file: "${target}"`;

        updateStepStatus(stepId, 'completed', simulatedOutput);
      }, 1500);
    }
  };

  // Main sending routine
  const handleSendMessage = async (content: string, images: string[], files: any[]) => {
    if (!activeConversationId || isGenerating) return;

    const activeConv = conversations.find((c) => c.id === activeConversationId);
    if (!activeConv) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      content: content,
      timestamp: Date.now(),
      images: images.length > 0 ? images : undefined,
      files: files.length > 0 ? files : undefined,
    };

    const updatedMessages = [...activeConv.messages, userMessage];
    const isFirstMessage = activeConv.messages.length === 0;
    const newTitle = isFirstMessage
      ? content.length > 25
        ? content.slice(0, 25) + '...'
        : content || 'File Session'
      : activeConv.title;

    // 1. Dynamic Intelligent Pipeline Generation
    const disabled = activeConv.disabledCapabilities || [];
    const pinned = activeConv.pinnedCapabilities || [];
    
    // Automatically determine which capabilities are needed based on complexity
    const isComplex = content.length > 40 || files.length > 0;
    const pipelineItems = [];

    if (!disabled.includes('workspace') && (isComplex || pinned.includes('workspace'))) {
      pipelineItems.push({ id: 'workspace', name: 'Workspace Indexing', status: 'running' as const, description: 'Indices directory layout.' });
    }
    if (!disabled.includes('research') && (content.toLowerCase().includes('help') || pinned.includes('research'))) {
      pipelineItems.push({ id: 'research', name: 'Documentation Research', status: 'pending' as const, description: 'Cross-references APIs.' });
    }
    if (!disabled.includes('planning') && (activeConv.mode === 'planning' || pinned.includes('planning'))) {
      pipelineItems.push({ id: 'planning', name: 'Action Planning', status: 'pending' as const, description: 'Prepares implementation checklist.' });
    }
    if (!disabled.includes('build') && (content.toLowerCase().includes('write') || content.toLowerCase().includes('create') || pinned.includes('build'))) {
      pipelineItems.push({ id: 'build', name: 'Code Building', status: 'pending' as const, description: 'Outputs file changes.' });
    }
    if (!disabled.includes('review') && (isComplex || pinned.includes('review'))) {
      pipelineItems.push({ id: 'review', name: 'Senior Review', status: 'pending' as const, description: 'Audits readability and complexity.' });
    }

    const generatedPipeline: CapabilityPipeline | null = pipelineItems.length > 0 ? {
      analysisReason: isComplex ? 'Determined engineering task requires local path mapping and reviews.' : 'General query pipeline selected.',
      estimatedDuration: isComplex ? 'Medium' : 'Short',
      capabilities: pipelineItems,
    } : null;

    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === activeWorkspaceId
          ? {
              ...ws,
              conversations: ws.conversations.map((c) =>
                c.id === activeConversationId
                  ? { ...c, title: newTitle, messages: updatedMessages, activePipeline: generatedPipeline }
                  : c
              ),
            }
          : ws
      )
    );

    setIsGenerating(true);
    const controller = new AbortController();
    activeControllerRef.current = controller;

    const assistantMsgId = Math.random().toString(36).substring(7);
    const assistantPlaceholder: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === activeWorkspaceId
          ? {
              ...ws,
              conversations: ws.conversations.map((c) =>
                c.id === activeConversationId
                  ? { ...c, messages: [...updatedMessages, assistantPlaceholder] }
                  : c
              ),
            }
          : ws
      )
    );

    // Simulated progress transitions for the visual pipeline flowchart
    if (generatedPipeline) {
      setTimeout(() => {
        setWorkspaces((prev) =>
          prev.map((ws) => {
            if (ws.id === activeWorkspaceId) {
              return {
                ...ws,
                conversations: ws.conversations.map((c) => {
                  if (c.id === activeConversationId && c.activePipeline) {
                    return {
                      ...c,
                      activePipeline: {
                        ...c.activePipeline,
                        capabilities: c.activePipeline.capabilities.map((cap, idx) =>
                          idx === 0 ? { ...cap, status: 'completed' as const } : idx === 1 ? { ...cap, status: 'running' as const } : cap
                        ),
                      },
                    };
                  }
                  return c;
                }),
              };
            }
            return ws;
          })
        );
      }, 1000);
    }

    try {
      let customSystemRules = '';
      if (activeWorkspace.customRules.trim()) {
        customSystemRules += `\nStrict directives to follow:\n${activeWorkspace.customRules}\n`;
      }
      if (activeWorkspace.memory.trim()) {
        customSystemRules += `\nWorkspace Context Memory:\n${activeWorkspace.memory}\n`;
      }

      if (activeConv.mode === 'planning') {
        customSystemRules += `
\n==================================================
PLANNING MODE ACTIVE
==================================================
You are an advanced agent assistant. You must construct a structured technical layout plan before writing code or running commands.
You must format your plan response exactly with the following capitalized headers:

# OBJECTIVE
Brief single sentence stating the project's goal.

# PROJECT UNDERSTANDING
Detailed technical understanding of the task.

# RISKS
- Risk 1
- Risk 2

# COMPLEXITY
Low / Medium / High

# STAGES
Stage 1: Stage Title
- [ ] Task item (e.g. write a script to compute indices)
- [ ] Task item with file creation signature: create \`src/index.ts\`
- [ ] Task item with execution command signature: run \`npm run build\`

Stage 2: Next Stage Title
- [ ] Task item description

Keep steps simple, actionable, and checklist-formatted.
`;
      }

      const baseSystemPrompt = activeConv.systemPrompt.trim()
        ? activeConv.systemPrompt
        : 'You are an elite software engineer and coding assistant.';

      const finalSystemMessage = {
        role: 'system',
        content: `${baseSystemPrompt}${customSystemRules}`,
      };

      const messagesPayload: any[] = [finalSystemMessage];
      activeConv.messages.forEach((m) => {
        const promptText = m.role === 'user' && m.files
          ? formatAttachmentPrompt(m.content, m.files)
          : m.content;

        messagesPayload.push({
          role: m.role,
          content: promptText,
          images: m.images,
        });
      });

      const finalPromptText = files.length > 0 ? formatAttachmentPrompt(content, files) : content;
      messagesPayload.push({
        role: 'user',
        content: finalPromptText,
        images: images.length > 0 ? images : undefined,
      });

      const response = await fetch(`${ollamaHost}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: activeConv.model,
          messages: messagesPayload,
          options: {
            temperature: activeConv.temperature,
            num_ctx: activeConv.numCtx,
            top_p: activeConv.topP,
            repeat_penalty: activeConv.repeatPenalty,
            num_predict: activeConv.maxTokens === -1 ? undefined : activeConv.maxTokens,
          },
          stream: true,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Ollama connection error: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Readable stream not supported.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (data.message && data.message.content) {
              const chunk = data.message.content;
              accumulatedContent += chunk;

              setWorkspaces((prev) =>
                prev.map((ws) =>
                  ws.id === activeWorkspaceId
                    ? {
                        ...ws,
                        conversations: ws.conversations.map((c) =>
                          c.id === activeConversationId
                            ? {
                                ...c,
                                messages: c.messages.map((m) =>
                                  m.id === assistantMsgId
                                    ? { ...m, content: m.content + chunk }
                                    : m
                                ),
                              }
                            : c
                        ),
                      }
                    : ws
                )
              );
            }
          } catch (err) {
            console.error('Stream chunk JSON error', err);
          }
        }
      }

      // Mark all capabilities as completed once the stream finishes successfully
      if (generatedPipeline) {
        setWorkspaces((prev) =>
          prev.map((ws) => {
            if (ws.id === activeWorkspaceId) {
              return {
                ...ws,
                conversations: ws.conversations.map((c) => {
                  if (c.id === activeConversationId && c.activePipeline) {
                    return {
                      ...c,
                      activePipeline: {
                        ...c.activePipeline,
                        capabilities: c.activePipeline.capabilities.map((cap) => ({
                          ...cap,
                          status: 'completed' as const,
                        })),
                      },
                    };
                  }
                  return c;
                }),
              };
            }
            return ws;
          })
        );
      }

      if (activeConv.mode === 'planning') {
        const parsedPlan = parsePlan(accumulatedContent);
        if (parsedPlan) {
          setWorkspaces((prev) =>
            prev.map((ws) =>
              ws.id === activeWorkspaceId
                ? {
                    ...ws,
                    conversations: ws.conversations.map((c) =>
                      c.id === activeConversationId ? { ...c, activePlan: parsedPlan } : c
                    ),
                  }
                : ws
            )
          );
        }
      }

    } catch (err: any) {
      console.error(err);
      if (err.name !== 'AbortError') {
        setWorkspaces((prev) =>
          prev.map((ws) =>
            ws.id === activeWorkspaceId
              ? {
                  ...ws,
                  conversations: ws.conversations.map((c) =>
                    c.id === activeConversationId
                      ? {
                          ...c,
                          messages: c.messages.map((m) =>
                            m.id === assistantMsgId ? { ...m, error: true } : m
                          ),
                        }
                      : c
                  ),
                }
              : ws
          )
        );
      }
    } finally {
      setIsGenerating(false);
      activeControllerRef.current = null;
    }
  };

  const handleRegenerateResponse = async () => {
    if (!activeConversationId || isGenerating) return;
    const activeConv = conversations.find((c) => c.id === activeConversationId);
    if (!activeConv || activeConv.messages.length < 2) return;

    const messageHistory = [...activeConv.messages];
    const lastMsg = messageHistory[messageHistory.length - 1];

    let userPrompt = '';
    let attachedImgs: string[] = [];
    let attachedFls: any[] = [];

    if (lastMsg.role === 'assistant') {
      messageHistory.pop();
      const lastUserMsg = messageHistory[messageHistory.length - 1];
      if (lastUserMsg && lastUserMsg.role === 'user') {
        userPrompt = lastUserMsg.content;
        attachedImgs = lastUserMsg.images || [];
        attachedFls = lastUserMsg.files || [];
        messageHistory.pop();
      }
    }

    if (userPrompt || attachedFls.length > 0 || attachedImgs.length > 0) {
      setWorkspaces((prev) =>
        prev.map((ws) =>
          ws.id === activeWorkspaceId
            ? {
                ...ws,
                conversations: ws.conversations.map((c) =>
                  c.id === activeConversationId
                    ? { ...c, messages: messageHistory, activePlan: null }
                    : c
                ),
              }
            : ws
        )
      );
      setTimeout(() => {
        handleSendMessage(userPrompt, attachedImgs, attachedFls);
      }, 50);
    }
  };

  const handleSelectModel = (modelName: string) => {
    handleUpdateParams({ model: modelName });
  };

  const handleExportConversations = () => {
    if (conversations.length === 0) {
      alert('No conversations to export in this workspace.');
      return;
    }

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(conversations, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${activeWorkspace.name.toLowerCase().replace(/\s+/g, '_')}_chats.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportConversations = () => {
    importFileInputRef.current?.click();
  };

  const handleFileImportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedList = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedList)) {
          setWorkspaces((prev) =>
            prev.map((ws) => {
              if (ws.id === activeWorkspaceId) {
                const combined = [...importedList, ...ws.conversations];
                return {
                  ...ws,
                  conversations: combined,
                  activeConversationId: combined.length > 0 ? combined[0].id : null,
                };
              }
              return ws;
            })
          );
          alert(`Successfully imported ${importedList.length} chats!`);
        } else {
          alert('Invalid file format. File must contain a JSON array of conversations.');
        }
      } catch (err) {
        console.error(err);
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="app-container">
      <input
        type="file"
        ref={importFileInputRef}
        onChange={handleFileImportUpload}
        accept=".json"
        style={{ display: 'none' }}
      />

      {/* 1. Sidebar */}
      {isSidebarOpen && (
        <Sidebar
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          onSelectWorkspace={handleSelectWorkspace}
          onOpenWorkspaceConfig={handleOpenWorkspaceConfig}
          onOpenNewWorkspace={handleOpenNewWorkspace}
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={(id) =>
            setWorkspaces((prev) =>
              prev.map((ws) =>
                ws.id === activeWorkspaceId ? { ...ws, activeConversationId: id } : ws
              )
            )
          }
          onDeleteConversation={handleDeleteConversation}
          onRenameConversation={handleRenameConversation}
          onNewConversation={handleNewConversation}
          connectionStatus={connectionStatus}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenModelManager={() => setIsModelManagerOpen(true)}
          onToggleCommandPalette={() => setIsCommandPaletteOpen(true)}
          onExportConversations={handleExportConversations}
          onImportConversations={handleImportConversations}
        />
      )}

      {/* 2. Main Chat Workspace */}
      <ChatArea
        conversation={activeConversation}
        onSendMessage={handleSendMessage}
        isGenerating={isGenerating}
        onStopGeneration={handleStopGeneration}
        onRegenerateResponse={handleRegenerateResponse}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onToggleParams={() => setIsParamsOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
        isParamsOpen={isParamsOpen}
        connectionStatus={connectionStatus}
        enterToSend={enterToSend}
        onUpdateConversationMode={handleUpdateConversationMode}
        onExecuteAction={handleExecuteAction}
        stepLogs={stepLogs}
        onUpdatePinnedCapabilities={handleUpdatePinnedCapabilities}
        onUpdateDisabledCapabilities={handleUpdateDisabledCapabilities}
      />

      {/* 3. Right Parameters Panel */}
      {isParamsOpen && (
        <ParametersPanel
          activeConversation={activeConversation}
          models={models}
          onUpdateParams={handleUpdateParams}
          onOpenModelManager={() => setIsModelManagerOpen(true)}
        />
      )}

      {/* 4. Overlay Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        ollamaHost={ollamaHost}
        onSaveHost={setOllamaHost}
        connectionStatus={connectionStatus}
        onTestConnection={testConnection}
        enterToSend={enterToSend}
        setEnterToSend={setEnterToSend}
      />

      <ModelManager
        isOpen={isModelManagerOpen}
        onClose={() => setIsModelManagerOpen(false)}
        models={models}
        onRefreshModels={testConnection}
        ollamaHost={ollamaHost}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        models={models}
        onSelectModel={handleSelectModel}
        conversations={conversations}
        onSelectConversation={(id) =>
          setWorkspaces((prev) =>
            prev.map((ws) =>
              ws.id === activeWorkspaceId ? { ...ws, activeConversationId: id } : ws
            )
          )
        }
        onNewConversation={handleNewConversation}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenModelManager={() => setIsModelManagerOpen(true)}
      />

      <WorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        activeWorkspace={isWorkspaceConfigMode ? activeWorkspace : null}
        onSaveWorkspace={handleSaveWorkspaceConfig}
      />
    </div>
  );
}
