import React, { useState, useEffect, useRef } from 'react';
import { Search } from './Icons';
import type { OllamaModel, Conversation } from '../types';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  shortcut?: string[];
  action: () => void;
  category: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  models: OllamaModel[];
  onSelectModel: (modelName: string) => void;
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onOpenSettings: () => void;
  onOpenModelManager: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  models,
  onSelectModel,
  conversations,
  onSelectConversation,
  onNewConversation,
  onOpenSettings,
  onOpenModelManager,
}) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      // Timeout to ensure modal has mounted and is visible
      const t = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Build commands list
  const generalCommands: CommandItem[] = [
    {
      id: 'new-chat',
      title: 'New conversation',
      subtitle: 'Create a fresh session with your selected model',
      shortcut: ['Ctrl', 'N'],
      category: 'General',
      action: () => {
        onNewConversation();
        onClose();
      },
    },
    {
      id: 'settings',
      title: 'Open Settings',
      subtitle: 'Configure host URL and key bindings',
      shortcut: ['Ctrl', ','],
      category: 'General',
      action: () => {
        onOpenSettings();
        onClose();
      },
    },
    {
      id: 'model-manager',
      title: 'Open Model Manager',
      subtitle: 'Pull, list, and delete models',
      category: 'General',
      action: () => {
        onOpenModelManager();
        onClose();
      },
    },
  ];

  const modelCommands: CommandItem[] = (models || []).map((model) => ({
    id: `model-${model.name}`,
    title: `Switch model: ${model.name}`,
    subtitle: `Quantization: ${model.details?.quantization_level || 'unknown'} • Size: ${((model.size || 0) / (1024 * 1024 * 1024)).toFixed(2)} GB`,
    category: 'Models',
    action: () => {
      onSelectModel(model.name);
      onClose();
    },
  }));

  const conversationCommands: CommandItem[] = (conversations || []).map((conv) => ({
    id: `conv-${conv.id}`,
    title: `Open chat: ${conv.title}`,
    subtitle: `Model: ${conv.model} • ${(conv.messages || []).length} messages`,
    category: 'Chat History',
    action: () => {
      onSelectConversation(conv.id);
      onClose();
    },
  }));

  const allCommands = [...generalCommands, ...modelCommands, ...conversationCommands];

  // Filter commands based on search
  const filteredCommands = allCommands.filter((cmd) => {
    const searchLower = search.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(searchLower) ||
      (cmd.subtitle && cmd.subtitle.toLowerCase().includes(searchLower)) ||
      cmd.category.toLowerCase().includes(searchLower)
    );
  });

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Keep selected item in viewport view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        const containerHeight = listRef.current.clientHeight;
        const elemTop = activeEl.offsetTop;
        const elemHeight = activeEl.clientHeight;
        
        if (elemTop + elemHeight > listRef.current.scrollTop + containerHeight) {
          listRef.current.scrollTop = elemTop + elemHeight - containerHeight;
        } else if (elemTop < listRef.current.scrollTop) {
          listRef.current.scrollTop = elemTop;
        }
      }
    }
  }, [selectedIndex]);

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose} 
      style={{ alignItems: 'flex-start', paddingTop: '10vh' }}
    >
      <div 
        className="modal-container" 
        style={{ 
          width: '600px', 
          backgroundColor: 'var(--bg-secondary)', 
          border: '1px solid var(--border-secondary)', 
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)'
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header */}
        <div className="flex items-center gap-2" style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-primary)' }}>
          <Search size={16} style={{ color: 'var(--text-secondary)' }} />
          <input
            type="text"
            ref={inputRef}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search commands, models, and history..."
            style={{ 
              flex: 1, 
              border: 'none', 
              background: 'transparent', 
              fontSize: '13.5px',
              color: 'var(--text-primary)',
              padding: 0 
            }}
          />
          <kbd style={{ fontSize: '9px' }}>ESC</kbd>
        </div>

        {/* Commands list */}
        {filteredCommands.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No commands or conversations matched "{search}"
          </div>
        ) : (
          <div 
            ref={listRef}
            style={{ 
              maxHeight: '330px', 
              overflowY: 'auto', 
              padding: '6px 0',
              backgroundColor: 'var(--bg-secondary)'
            }}
          >
            {filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 14px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'var(--bg-hover)' : 'transparent',
                    borderLeft: isSelected ? '2px solid var(--status-blue)' : '2px solid transparent',
                  }}
                >
                  <div className="flex flex-col gap-0.5" style={{ flex: 1, overflow: 'hidden' }}>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                        {cmd.category}
                      </span>
                      <span style={{ color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 500 }}>
                        {cmd.title}
                      </span>
                    </div>
                    {cmd.subtitle && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {cmd.subtitle}
                      </span>
                    )}
                  </div>
                  {cmd.shortcut && (
                    <div className="flex gap-1">
                      {cmd.shortcut.map((key) => (
                        <kbd key={key} style={{ fontSize: '9px', backgroundColor: isSelected ? 'var(--bg-active)' : 'var(--bg-secondary)' }}>
                          {key}
                        </kbd>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer shortcuts */}
        <div 
          className="flex items-center gap-4" 
          style={{ 
            padding: '8px 14px', 
            borderTop: '1px solid var(--border-primary)', 
            fontSize: '11px', 
            color: 'var(--text-muted)',
            backgroundColor: 'var(--bg-primary)'
          }}
        >
          <span className="flex items-center gap-1">
            <kbd style={{ fontSize: '9px' }}>↑↓</kbd> to navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd style={{ fontSize: '9px' }}>Enter</kbd> to select
          </span>
          <span className="flex items-center gap-1">
            <kbd style={{ fontSize: '9px' }}>Esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
};
