import React from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs/components/prism-core';
// Fix: Reordered imports to respect Prism language dependencies and added jsx/tsx.
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-bash';


interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  language: string;
}

// Mapping from highlight.js language names to PrismJS language names
const langMap: { [key: string]: string } = {
  js: 'javascript',
  jsx: 'jsx', // Fix: Correctly map jsx to its own grammar
  javascript: 'javascript',
  ts: 'typescript',
  tsx: 'tsx', // Fix: Correctly map tsx to its own grammar
  typescript: 'typescript',
  py: 'python',
  python: 'python',
  html: 'markup',
  xml: 'markup',
  svg: 'markup',
  css: 'css',
  sql: 'sql',
  java: 'java',
  csharp: 'csharp',
  cs: 'csharp',
  cpp: 'cpp',
  php: 'php',
  go: 'go',
  rb: 'ruby',
  ruby: 'ruby',
  rust: 'rust',
  json: 'json',
  yml: 'yaml',
  yaml: 'yaml',
  sh: 'bash',
  shell: 'bash',
  bash: 'bash'
};

const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, disabled, language }) => {
  const highlighter = (code: string): string => {
    // 1. Ensure code is a valid string to prevent runtime errors.
    if (typeof code !== 'string') {
      return ''; 
    }
    
    // 2. Safely determine the language, defaulting to 'clike'.
    const lang = (typeof language === 'string' && language) ? language.toLowerCase() : 'clike';
    const prismLang = langMap[lang] || 'clike';

    // 3. Ensure the language grammar is loaded before attempting to highlight.
    if (Prism?.languages?.[prismLang]) {
      try {
        return Prism.highlight(code, Prism.languages[prismLang], prismLang);
      } catch (e) {
        // In case of a rare internal Prism error, log it and fall back gracefully.
        console.error("Prism highlighting error:", e);
        return code; // Return un-highlighted code on error
      }
    }
    
    // 4. Fallback for unsupported languages using the default 'clike' grammar.
    if (Prism?.languages?.clike) {
       return Prism.highlight(code, Prism.languages.clike, 'clike');
    }
    
    // 5. Absolute fallback if Prism or clike is somehow not available.
    return code;
  };

  return (
    <div className="relative w-full h-full p-6 bg-black text-[#FAFAFA] font-mono text-lg leading-relaxed code-editor-wrapper">
      {value && !disabled && (
        <button
          onClick={() => onChange('')}
          className="absolute top-4 right-4 z-10 text-[#888] hover:text-white transition-colors"
          aria-label="Clear input"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      <Editor
        value={value}
        onValueChange={onChange}
        highlight={highlighter}
        disabled={disabled}
        placeholder="// Paste your code here... Oga go chook eye."
        padding={0}
        textareaClassName="placeholder-[#888888]"
        style={{
          minHeight: '100%'
        }}
      />
    </div>
  );
};

export default CodeEditor;