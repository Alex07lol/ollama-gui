import React, { useState } from 'react';
import { Plus, Settings, Server, Trash, Edit, Keyboard, Download, Upload } from './Icons';
import type { Conversation, ConnectionStatus, Workspace } from '../types';
import ollamaLogo from '../assets/logo.png';

interface SidebarProps {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  onOpenWorkspaceConfig: () => void;
  onOpenNewWorkspace: () => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onNewConversation: () => void;
  connectionStatus: ConnectionStatus;
  onOpenSettings: () => void;
  onOpenModelManager: () => void;
  onToggleCommandPalette: () => void;
  onExportConversations: () => void;
  onImportConversations: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onOpenWorkspaceConfig,
  onOpenNewWorkspace,
  conversations,
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
  onNewConversation,
  connectionStatus,
  onOpenSettings,
  onOpenModelManager,
  onToggleCommandPalette,
  onExportConversations,
  onImportConversations,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const handleStartRename = (e: React.MouseEvent, conv: Conversation) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      handleSaveRename(id);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="sidebar">
      {/* Sidebar Header */}
      <div 
        style={{ 
          padding: '16px 14px 10px 14px', 
          borderBottom: '1px solid var(--border-primary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={ollamaLogo} alt="Ollama Logo" style={{ width: '16px', height: '16px', borderRadius: '3px' }} />
            <span style={{ fontWeight: 600, fontSize: '13px', letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
              Ollama GUI
            </span>
          </div>
          <div className="flex items-center gap-1.5" style={{ fontSize: '11px' }}>
            <div 
              style={{ 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                backgroundColor: 
                  connectionStatus === 'connected' ? 'var(--status-green)' : 
                  connectionStatus === 'disconnected' ? 'var(--status-red)' : 
                  'var(--status-warning)' 
              }} 
            />
            <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
              {connectionStatus === 'connected' ? 'local' : 'offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Workspace Switcher */}
      <div 
        style={{ 
          padding: '10px 10px 12px 10px', 
          borderBottom: '1px solid var(--border-primary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}
      >
        <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '4px' }}>
          Workspace
        </span>
        <div className="flex gap-2 items-center">
          <select 
            value={activeWorkspaceId}
            onChange={(e) => onSelectWorkspace(e.target.value)}
            style={{ flex: 1, padding: '4px 8px', fontSize: '12px', height: '28px', backgroundColor: 'var(--bg-primary)' }}
          >
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>
                {ws.name}
              </option>
            ))}
          </select>
          <button 
            className="icon-btn" 
            onClick={onOpenWorkspaceConfig}
            title="Configure Active Workspace"
            style={{ padding: '6px', height: '28px', width: '28px' }}
          >
            <Settings size={12} />
          </button>
          <button 
            className="icon-btn" 
            onClick={onOpenNewWorkspace}
            title="Create New Workspace"
            style={{ padding: '6px', height: '28px', width: '28px' }}
          >
            <Plus size={12} />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ padding: '10px 10px 6px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <button 
          onClick={onNewConversation}
          className="primary flex justify-between items-center"
          style={{ width: '100%', padding: '7px 10px', fontSize: '12px' }}
        >
          <div className="flex items-center gap-2">
            <Plus size={13} />
            <span>New Chat</span>
          </div>
          <kbd style={{ fontSize: '9px', backgroundColor: 'rgba(0,0,0,0.15)', border: 'none', color: 'rgba(0,0,0,0.5)' }}>Ctrl+N</kbd>
        </button>

        <button 
          onClick={onToggleCommandPalette}
          className="flex justify-between items-center"
          style={{ width: '100%', padding: '6px 10px', fontSize: '12px', borderColor: 'var(--border-primary)' }}
        >
          <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <Keyboard size={13} />
            <span>Commands</span>
          </div>
          <kbd style={{ fontSize: '9px' }}>Ctrl+K</kbd>
        </button>
      </div>

      {/* Filter conversations input */}
      <div style={{ padding: '4px 10px 8px 10px' }}>
        <input
          type="text"
          placeholder="Filter chats..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          style={{ 
            width: '100%', 
            fontSize: '11.5px', 
            padding: '5px 8px', 
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border-primary)' 
          }}
        />
      </div>

      {/* Chat History List */}
      <div 
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '0 8px 8px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}
      >
        <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '6px 6px 2px 6px' }}>
          Chats
        </span>
        
        {filteredConversations.length === 0 ? (
          <div style={{ padding: '16px 8px', color: 'var(--text-muted)', fontSize: '11.5px', fontStyle: 'italic' }}>
            No sessions
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isActive = conv.id === activeConversationId;
            const isEditing = conv.id === editingId;

            return (
              <div
                key={conv.id}
                onClick={() => !isEditing && onSelectConversation(conv.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: isActive ? 'var(--bg-primary)' : 'transparent',
                  border: isActive ? '1px solid var(--border-primary)' : '1px solid transparent',
                  borderLeft: isActive ? '2px solid var(--status-blue)' : '2px solid transparent',
                }}
                className="chat-item"
                onMouseOver={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                }}
                onMouseOut={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {isEditing ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => handleSaveRename(conv.id)}
                    onKeyDown={(e) => handleKeyDown(e, conv.id)}
                    autoFocus
                    style={{ 
                      width: '100%', 
                      fontSize: '11.5px', 
                      padding: '2px 4px', 
                      backgroundColor: 'var(--bg-secondary)', 
                      borderColor: 'var(--border-focus)' 
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div className="flex flex-col" style={{ overflow: 'hidden', flex: 1 }}>
                    <span 
                      style={{ 
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        fontSize: '12px'
                      }}
                    >
                      {conv.title}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', fontFamily: 'var(--mono-font)' }}>
                      {conv.model}
                    </span>
                  </div>
                )}

                {/* Edit/Delete actions */}
                {!isEditing && (
                  <div 
                    className="flex gap-1 actions" 
                    style={{ 
                      opacity: isActive ? 1 : 0, 
                      transition: 'opacity 0.15s ease',
                      marginLeft: '4px'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button 
                      className="icon-btn" 
                      onClick={(e) => handleStartRename(e, conv)}
                      style={{ padding: '2px' }}
                    >
                      <Edit size={11} />
                    </button>
                    <button 
                      className="icon-btn danger" 
                      onClick={() => onDeleteConversation(conv.id)}
                      style={{ padding: '2px' }}
                    >
                      <Trash size={11} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .chat-item:hover .actions {
          opacity: 1 !important;
        }
      `}</style>

      {/* Sidebar Footer */}
      <div 
        style={{ 
          padding: '10px 14px', 
          borderTop: '1px solid var(--border-primary)',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        {/* Core Actions row */}
        <div className="flex justify-between items-center w-100">
          <button 
            className="icon-btn" 
            onClick={onOpenModelManager}
            title="Model Manager"
          >
            <Server size={14} />
            <span style={{ fontSize: '11px', marginLeft: '4px' }}>Models</span>
          </button>

          <button 
            className="icon-btn" 
            onClick={onOpenSettings}
            title="Open Settings"
          >
            <Settings size={14} />
            <span style={{ fontSize: '11px', marginLeft: '4px' }}>Settings</span>
          </button>
        </div>

        {/* Data Import/Export row */}
        <div className="flex justify-between items-center w-100" style={{ borderTop: '1px solid var(--border-primary)', paddingTop: '8px' }}>
          <button 
            className="icon-btn" 
            onClick={onExportConversations}
            title="Export Chats JSON"
            style={{ padding: '2px 4px' }}
          >
            <Download size={13} />
            <span style={{ fontSize: '10.5px', marginLeft: '4px' }}>Export</span>
          </button>

          <button 
            className="icon-btn" 
            onClick={onImportConversations}
            title="Import Chats JSON"
            style={{ padding: '2px 4px' }}
          >
            <Upload size={13} />
            <span style={{ fontSize: '10.5px', marginLeft: '4px' }}>Import</span>
          </button>
        </div>
      </div>
    </div>
  );
};
