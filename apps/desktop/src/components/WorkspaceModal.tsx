import React, { useState, useEffect } from 'react';
import { Close, Folder } from './Icons';
import type { Workspace } from '../types';

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeWorkspace: Workspace | null;
  onSaveWorkspace: (workspaceData: Partial<Workspace>) => void;
}

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({
  isOpen,
  onClose,
  activeWorkspace,
  onSaveWorkspace,
}) => {
  const [name, setName] = useState('');
  const [projectPath, setProjectPath] = useState('');
  const [ignoredFolders, setIgnoredFolders] = useState('');
  const [customRules, setCustomRules] = useState('');
  const [memory, setMemory] = useState('');

  useEffect(() => {
    if (activeWorkspace) {
      setName(activeWorkspace.name);
      setProjectPath(activeWorkspace.projectPath || '');
      setIgnoredFolders((activeWorkspace.ignoredFolders || []).join(', '));
      setCustomRules(activeWorkspace.customRules || '');
      setMemory(activeWorkspace.memory || '');
    } else {
      setName('');
      setProjectPath('');
      setIgnoredFolders('node_modules, .git, dist, build');
      setCustomRules('');
      setMemory('');
    }
  }, [activeWorkspace, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const folders = ignoredFolders
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    onSaveWorkspace({
      name: name.trim() || 'Unnamed Workspace',
      projectPath: projectPath.trim(),
      ignoredFolders: folders,
      customRules: customRules.trim(),
      memory: memory.trim(),
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ width: '500px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Folder size={14} className="text-secondary" />
            <span className="modal-title">
              {activeWorkspace ? 'Configure Workspace' : 'Create New Workspace'}
            </span>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <Close size={14} />
          </button>
        </div>

        <div className="modal-body">
          {/* Workspace Name */}
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Workspace Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ollama App Backend"
            />
          </div>

          {/* Directory Path */}
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Local Project Directory Path
            </label>
            <input
              type="text"
              value={projectPath}
              onChange={(e) => setProjectPath(e.target.value)}
              placeholder="e.g. /home/user/projects/ollama-gui"
            />
          </div>

          {/* Ignored Folders */}
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Ignored Folders (Comma-separated)
            </label>
            <input
              type="text"
              value={ignoredFolders}
              onChange={(e) => setIgnoredFolders(e.target.value)}
              placeholder="node_modules, .git, dist"
            />
          </div>

          {/* Custom Rules */}
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Custom System Rules / Directives
            </label>
            <textarea
              value={customRules}
              onChange={(e) => setCustomRules(e.target.value)}
              placeholder="e.g. Always write pure ES6 modules. Avoid inline comments. Prefer modular helper functions."
              rows={3}
              style={{ fontSize: '11.5px', fontFamily: 'var(--sans-font)' }}
            />
          </div>

          {/* Memory */}
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Workspace Memory / Notes
            </label>
            <textarea
              value={memory}
              onChange={(e) => setMemory(e.target.value)}
              placeholder="Keep general notes or context that the LLM should know about your architecture, like endpoints, libraries, or schema details."
              rows={3}
              style={{ fontSize: '11.5px', fontFamily: 'var(--sans-font)' }}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button style={{ border: 'none' }} onClick={onClose}>
            Cancel
          </button>
          <button className="primary" onClick={handleSave}>
            Save Workspace
          </button>
        </div>
      </div>
    </div>
  );
};
