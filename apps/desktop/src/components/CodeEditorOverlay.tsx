import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Close } from './Icons';

interface CodeEditorOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  filePath: string;
  initialContent: string;
  onSave: (path: string, content: string) => void;
}

export const CodeEditorOverlay: React.FC<CodeEditorOverlayProps> = ({
  isOpen,
  onClose,
  filePath,
  initialContent,
  onSave,
}) => {
  const [editorContent, setEditorContent] = useState(initialContent);

  useEffect(() => {
    setEditorContent(initialContent);
  }, [initialContent, filePath]);

  if (!isOpen) return null;

  const getLanguage = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'json':
        return 'json';
      case 'py':
        return 'python';
      case 'rs':
        return 'rust';
      case 'md':
        return 'markdown';
      case 'sh':
      case 'bash':
        return 'shell';
      case 'yaml':
      case 'yml':
        return 'yaml';
      case 'xml':
        return 'xml';
      case 'sql':
        return 'sql';
      default:
        return 'plaintext';
    }
  };

  const handleSave = () => {
    onSave(filePath, editorContent);
  };

  const filename = filePath.split('/').pop() || filePath;

  return (
    <div className="code-editor-overlay">
      <div className="code-editor-container">
        {/* Header */}
        <div className="code-editor-header">
          <div className="flex flex-col">
            <span className="code-editor-title">{filename}</span>
            <span className="code-editor-subtitle">{filePath}</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="primary" 
              onClick={handleSave}
              style={{ padding: '4px 12px', fontSize: '11.5px', fontWeight: 600 }}
            >
              Save Changes
            </button>
            <button className="icon-btn" onClick={onClose} title="Close Editor">
              <Close size={14} />
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="code-editor-body">
          <Editor
            height="100%"
            language={getLanguage(filePath)}
            theme="vs-dark"
            value={editorContent}
            onChange={(val) => setEditorContent(val || '')}
            options={{
              minimap: { enabled: true },
              fontSize: 12.5,
              lineNumbers: 'on',
              wordWrap: 'on',
              automaticLayout: true,
              tabSize: 2,
              scrollBeyondLastLine: false,
              fontFamily: 'var(--mono-font)'
            }}
          />
        </div>
      </div>
    </div>
  );
};
