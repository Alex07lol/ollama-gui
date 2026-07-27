import React, { useState } from 'react';
import { Copy, Check } from './Icons';

interface CodeBlockProps {
  language: string;
  content: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      margin: '12px 0',
      borderRadius: '4px',
      border: '1px solid var(--border-secondary)',
      backgroundColor: '#08080a',
      overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 12px',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-primary)',
        fontSize: '11px',
        color: 'var(--text-secondary)'
      }}>
        <span style={{ fontFamily: 'var(--mono-font)', textTransform: 'lowercase' }}>
          {language || 'plaintext'}
        </span>
        <button 
          onClick={handleCopy}
          style={{
            padding: '2px 6px',
            border: 'none',
            fontSize: '11px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: 'transparent'
          }}
        >
          {copied ? <Check size={10} style={{ color: 'var(--text-success)' }} /> : <Copy size={10} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre style={{
        margin: 0,
        padding: '12px',
        overflowX: 'auto',
        fontSize: '12px',
        lineHeight: '1.6',
        color: '#e4e4e7',
        fontFamily: 'var(--mono-font)',
        backgroundColor: '#050506'
      }}>
        <code>{content}</code>
      </pre>
    </div>
  );
};

function parseInline(text: string): React.ReactNode[] {
  if (!text) return [];
  
  // Combine tokenizer for bold (**), italics (*), inline code (`), and links ([text](url))
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g;
  const parts = text.split(regex);
  
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={idx} style={{ fontStyle: 'italic' }}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code 
          key={idx} 
          style={{ 
            padding: '2px 4px', 
            backgroundColor: 'var(--surface)', 
            border: '1px solid var(--border-primary)',
            borderRadius: '3px', 
            fontSize: '11.5px',
            color: '#e4e4e7'
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('[') && part.includes('](')) {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        return (
          <a 
            key={idx} 
            href={match[2]} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ 
              color: 'var(--status-blue)', 
              textDecoration: 'none' 
            }}
            onMouseOver={(e) => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseOut={(e) => (e.currentTarget.style.textDecoration = 'none')}
          >
            {match[1]}
          </a>
        );
      }
    }
    return part;
  });
}

interface MarkdownProps {
  content: string;
}

export const Markdown: React.FC<MarkdownProps> = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  
  let inCodeBlock = false;
  let codeLanguage = '';
  let codeLines: string[] = [];
  
  let currentListType: 'ordered' | 'unordered' | null = null;
  let listItems: string[] = [];

  let currentParagraphLines: string[] = [];

  const flushParagraph = (key: string | number) => {
    if (currentParagraphLines.length > 0) {
      const text = currentParagraphLines.join('\n');
      blocks.push(
        <p key={`p-${key}`} style={{ margin: '6px 0 10px 0', lineHeight: '1.6', color: 'var(--text-primary)' }}>
          {parseInline(text)}
        </p>
      );
      currentParagraphLines = [];
    }
  };

  const flushList = (key: string | number) => {
    if (currentListType && listItems.length > 0) {
      const items = listItems.map((item, idx) => (
        <li key={idx} style={{ margin: '4px 0', paddingLeft: '4px', color: 'var(--text-primary)' }}>
          {parseInline(item)}
        </li>
      ));
      
      const listStyle = {
        paddingLeft: '20px',
        margin: '6px 0 10px 0',
        lineHeight: '1.6'
      };

      if (currentListType === 'ordered') {
        blocks.push(<ol key={`ol-${key}`} style={listStyle}>{items}</ol>);
      } else {
        blocks.push(<ul key={`ul-${key}`} style={listStyle}>{items}</ul>);
      }
      
      listItems = [];
      currentListType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 1. Code block detection
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        const codeText = codeLines.join('\n');
        blocks.push(
          <CodeBlock 
            key={`code-${i}`} 
            language={codeLanguage} 
            content={codeText} 
          />
        );
        codeLines = [];
        codeLanguage = '';
        inCodeBlock = false;
      } else {
        flushParagraph(i);
        flushList(i);
        inCodeBlock = true;
        codeLanguage = line.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // 2. Unordered List detection
    const ulMatch = line.match(/^(\s*)[-*+]\s+(.*)/);
    if (ulMatch) {
      flushParagraph(i);
      if (currentListType && currentListType !== 'unordered') {
        flushList(i);
      }
      currentListType = 'unordered';
      listItems.push(ulMatch[2]);
      continue;
    }

    // 3. Ordered List detection
    const olMatch = line.match(/^(\s*)\d+\.\s+(.*)/);
    if (olMatch) {
      flushParagraph(i);
      if (currentListType && currentListType !== 'ordered') {
        flushList(i);
      }
      currentListType = 'ordered';
      listItems.push(olMatch[2]);
      continue;
    }

    // 4. Header detection
    const headerMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headerMatch) {
      flushParagraph(i);
      flushList(i);
      const level = headerMatch[1].length;
      const text = headerMatch[2];
      
      const headerStyle: React.CSSProperties = {
        color: 'var(--text-primary)',
        fontWeight: 600,
        marginTop: '16px',
        marginBottom: '6px'
      };

      if (level === 1) {
        blocks.push(<h1 key={`h-${i}`} style={{ ...headerStyle, fontSize: '16px', borderBottom: '1px solid var(--border-primary)', paddingBottom: '4px', marginTop: '20px' }}>{parseInline(text)}</h1>);
      } else if (level === 2) {
        blocks.push(<h2 key={`h-${i}`} style={{ ...headerStyle, fontSize: '14px', marginTop: '16px' }}>{parseInline(text)}</h2>);
      } else {
        blocks.push(<h3 key={`h-${i}`} style={{ ...headerStyle, fontSize: '12px', marginTop: '12px' }}>{parseInline(text)}</h3>);
      }
      continue;
    }

    // 5. Blockquote detection
    if (line.startsWith('>')) {
      flushParagraph(i);
      flushList(i);
      const quoteText = line.slice(1).trim();
      blocks.push(
        <blockquote key={`q-${i}`} style={{
          borderLeft: '2px solid var(--border-focus)',
          paddingLeft: '12px',
          color: 'var(--text-secondary)',
          margin: '8px 0 12px 0',
          fontStyle: 'italic'
        }}>
          {parseInline(quoteText)}
        </blockquote>
      );
      continue;
    }

    // 6. Blank line detection
    if (line.trim() === '') {
      flushParagraph(i);
      flushList(i);
      continue;
    }

    // 7. Regular paragraph line
    flushList(i);
    currentParagraphLines.push(line);
  }

  flushParagraph('final');
  flushList('final');

  return <div style={{ wordBreak: 'break-word' }}>{blocks}</div>;
};
