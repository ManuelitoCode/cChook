import React, { useState, useCallback, useEffect } from 'react';
import CodeEditor from './components/CodeEditor';
import RoastDisplay from './components/RoastDisplay';
import { streamRoast } from './services/geminiService';
import { saveRoast } from './services/supabaseService';
import hljs from 'highlight.js';

// Base languages
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml'; // for HTML
import css from 'highlight.js/lib/languages/css';

// Additional common languages for better auto-detection
import sql from 'highlight.js/lib/languages/sql';
import java from 'highlight.js/lib/languages/java';
import csharp from 'highlight.js/lib/languages/csharp';
import cpp from 'highlight.js/lib/languages/cpp';
import php from 'highlight.js/lib/languages/php';
import go from 'highlight.js/lib/languages/go';
import ruby from 'highlight.js/lib/languages/ruby';
import rust from 'highlight.js/lib/languages/rust';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';
import shell from 'highlight.js/lib/languages/shell';


// Register languages for auto-detection
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('jsx', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('tsx', typescript);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('java', java);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('php', php);
hljs.registerLanguage('go', go);
hljs.registerLanguage('ruby', ruby);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('json', json);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('shell', shell);
hljs.registerLanguage('bash', shell);


type ActiveTab = 'code' | 'roast';

const App: React.FC = () => {
  const [code, setCode] = useState('');
  const [context, setContext] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('javascript');
  const [roast, setRoast] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRoastSaved, setIsRoastSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('code');

  useEffect(() => {
    const handler = setTimeout(() => {
      if (code.trim()) {
        const result = hljs.highlightAuto(code);
        if (result.language) {
          // Heuristic to differentiate between JS/TS and JSX/TSX for Prism compatibility.
          // highlight.js detects JSX/TSX as javascript/typescript, but Prism needs the specific grammar
          // to avoid crashing on component syntax.
          if (result.language === 'javascript' && /<\/?[A-Z]/.test(code)) {
            setDetectedLanguage('jsx');
          } else if (result.language === 'typescript' && /<\/?[A-Z]/.test(code)) {
            setDetectedLanguage('tsx');
          } else {
            setDetectedLanguage(result.language);
          }
        }
      } else {
        // Reset to a sensible default when input is cleared.
        setDetectedLanguage('javascript');
      }
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [code]);


  const handleRoast = useCallback(async () => {
    if (!code.trim()) {
      setError('Abeg, write something first before I chook eye.');
      return;
    }
    setIsLoading(true);
    setRoast('');
    setError(null);
    setIsRoastSaved(false);
    setSaveError(null);

    // On mobile, switch to the roast tab to show the loading state
    if (window.innerWidth < 768) {
        setActiveTab('roast');
    }

    try {
      const stream = streamRoast(code, context, detectedLanguage);
      for await (const chunk of stream) {
        setRoast((prev) => prev + chunk);
      }
    } catch (e: any) {
      console.error(e);
      setError(`Omo, gbege! The thing cast. Error: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [code, context, detectedLanguage]);
  
  const handleSaveRoast = useCallback(async () => {
    if (!roast || !code) return;
    setSaveError(null);
    try {
        await saveRoast({ code, roast, context, language: detectedLanguage });
        setIsRoastSaved(true);
    } catch (e: any) {
        console.error("Failed to save roast:", e);
        setSaveError(e.message || "Failed to save roast.");
        setTimeout(() => setSaveError(null), 4000);
    }
  }, [code, roast, context, detectedLanguage]);

  const handleShare = () => {
    const text = `I just got my code roasted by "Chook" and I'm crying 🤣🔥. This thing is brutal.\n\n#ChookApp #NaijaTech`;
    const appUrl = "https://chook.app"; // Your app's URL
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(appUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  return (
    <div className="bg-[#111] text-[#FAFAFA] h-screen flex flex-col font-sans">
      <header className="flex items-center justify-between p-4 border-b border-[#333] shrink-0">
        <div className="flex items-center space-x-3">
          <svg className="w-8 h-8 text-hazard-yellow" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"></path>
          </svg>
          <h1 className="text-2xl font-bold">Chook</h1>
          <span className="text-sm text-[#888]">I go chook my eye for your code.</span>
        </div>
      </header>
      
      <div className="flex-grow flex flex-col overflow-hidden">
        {/* Mobile Tab Navigation */}
        <div className="md:hidden flex border-b border-[#333] shrink-0">
          <button 
            onClick={() => setActiveTab('code')}
            className={`w-1/2 py-2 text-sm font-semibold transition-colors ${activeTab === 'code' ? 'bg-[#222] text-hazard-yellow' : 'bg-transparent text-[#888]'}`}
          >
            CODE
          </button>
          <button 
            onClick={() => setActiveTab('roast')}
            className={`w-1/2 py-2 text-sm font-semibold transition-colors ${activeTab === 'roast' ? 'bg-[#222] text-hazard-yellow' : 'bg-transparent text-[#888]'}`}
          >
            ROAST
          </button>
        </div>

        {/* Panels Container */}
        <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
          {/* Left Panel */}
          <div className={`flex-col md:w-1/2 w-full h-full bg-[#1a1a1a] ${activeTab === 'code' ? 'flex' : 'hidden'} md:flex`}>
            <div className="flex items-center p-3 border-b border-[#333] space-x-4">
                <div className="flex-grow">
                  <label htmlFor="context" className="text-xs font-semibold text-[#888] mb-1 block">Context (Wetin this code dey do?)</label>
                  <input
                    id="context"
                    type="text"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="e.g., Tiptap editor component"
                    className="w-full bg-[#222] border border-[#444] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-hazard-yellow"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#888] mb-1 block">Language</label>
                  <div className="w-32 bg-[#222] border border-[#444] rounded-md px-3 py-1.5 text-sm h-[35px] flex items-center capitalize">
                    <span className="text-hazard-yellow font-semibold">{detectedLanguage || 'Detecting...'}</span>
                  </div>
                </div>
            </div>
            <div className="flex-grow relative overflow-y-auto">
              <CodeEditor
                value={code}
                onChange={setCode}
                disabled={isLoading}
                language={detectedLanguage}
              />
            </div>
            <footer className="p-3 border-t border-[#333] flex items-center justify-between shrink-0">
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                onClick={handleRoast}
                disabled={isLoading || !code.trim()}
                className="ml-auto bg-hazard-yellow text-black font-bold py-2 px-6 rounded-md hover:bg-yellow-400 transition-colors disabled:bg-[#555] disabled:cursor-not-allowed disabled:text-[#888]"
              >
                {isLoading ? 'Chooking Eye...' : 'Yàb Am!'}
              </button>
            </footer>
          </div>

          <div className="hidden md:block w-px bg-[#333]"></div>

          {/* Right Panel */}
          <div className={`flex-col md:w-1/2 w-full h-full bg-[#1a1a1a] ${activeTab === 'roast' ? 'flex' : 'hidden'} md:flex`}>
            <div className="flex items-center justify-between p-3 border-b border-[#333] shrink-0">
              <h2 className="text-lg font-bold text-[#FAFAFA]">Chook's Yàb</h2>
              {roast && !isLoading && (
                <div className="flex items-center space-x-2">
                   <button
                    onClick={handleShare}
                    className="px-3 py-1 text-xs font-semibold bg-[#222] hover:bg-[#333] rounded-md transition-colors flex items-center space-x-1.5"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                    <span>Share on X</span>
                  </button>
                  <button
                    onClick={handleSaveRoast}
                    disabled={isRoastSaved || !!saveError}
                    className="px-3 py-1 text-xs font-semibold bg-[#222] hover:bg-[#333] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saveError ? '❌ Save Failed' : (isRoastSaved ? '✅ Saved!' : '🔥 E Cook!')}
                  </button>
                </div>
              )}
            </div>
            <div className="flex-grow overflow-hidden">
              <RoastDisplay roast={roast} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;