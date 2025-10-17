import React, { useState, useEffect } from 'react';
import { fetchRecentRoasts, Roast } from '../services/supabaseService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Mapping from highlight.js language names to PrismJS language names
// This is crucial to prevent crashes when a language alias is not recognized.
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


const HallOfYab: React.FC = () => {
  const [roasts, setRoasts] = useState<Roast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRoasts = async () => {
      try {
        setIsLoading(true);
        const recentRoasts = await fetchRecentRoasts();
        setRoasts(recentRoasts);
      } catch (err: any) {
        setError(err.message || "Failed to fetch roasts. The ancestors are not happy.");
      } finally {
        setIsLoading(false);
      }
    };

    loadRoasts();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full p-4">
        <p className="text-lg text-[#888] text-center">Summoning the spirits from the Data Moat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full p-4">
        <p className="text-lg text-red-500 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-4xl font-bold text-center mb-2 text-hazard-yellow">Hall of Yàb</h1>
      <p className="text-center text-[#888] mb-8">The most brutal roasts, immortalized.</p>
      
      <div className="space-y-8">
        {roasts.map((roast) => {
           // Normalize the language name to prevent highlighter crashes
          const lang = roast.detected_language?.toLowerCase() || 'text';
          const prismLang = langMap[lang] || lang;

          return (
            <div key={roast.id} className="bg-[#1a1a1a] border border-[#333] rounded-lg overflow-hidden">
              <div className="p-4 border-b border-[#333]">
                <p className="text-sm text-[#888]">
                  <span className="font-bold text-[#FAFAFA] capitalize">{roast.detected_language || 'Code'}</span>
                  {roast.context && ` - ${roast.context}`}
                </p>
              </div>
              <div className="md:grid md:grid-cols-2">
                <div className="p-4">
                  <h3 className="text-xs font-semibold uppercase text-[#888] mb-2">The Code Wey Vex Chook</h3>
                  <div className="bg-black rounded-md overflow-hidden text-sm max-h-96">
                     <SyntaxHighlighter 
                        language={prismLang} 
                        style={tomorrow}
                        customStyle={{ margin: 0, padding: '1rem', height: '100%', maxHeight: '24rem', overflowY: 'auto' }}
                        codeTagProps={{ style: { fontFamily: '"JetBrains Mono", monospace' } }}
                        showLineNumbers
                     >
                        {roast.code_snippet || ''}
                     </SyntaxHighlighter>
                  </div>
                </div>
                <div className="p-4 border-t md:border-t-0 md:border-l border-[#333]">
                  <h3 className="text-xs font-semibold uppercase text-[#888] mb-2">The Yàb</h3>
                  <div className="roast-display text-sm max-h-96 overflow-y-auto">
                     <ReactMarkdown remarkPlugins={[remarkGfm]}>
                       {roast.roast_markdown || ''}
                     </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default HallOfYab;