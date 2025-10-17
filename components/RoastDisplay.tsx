import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface RoastDisplayProps {
  roast: string;
  isLoading: boolean;
}

const RoastDisplay: React.FC<RoastDisplayProps> = ({ roast, isLoading }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to the bottom as new content streams in
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [roast]);

  // Display a loading message when fetching and roast is empty
  if (isLoading && !roast) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-[#888] p-6">
        <p className="font-mono text-lg">
          Chook dey chook eye...
          <span className="inline-block w-3 h-5 bg-hazard-yellow ml-2 animate-blink"></span>
        </p>
      </div>
    );
  }

  // Display a placeholder when idle and there's no roast content
  if (!isLoading && !roast) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-[#888] p-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-[#444] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <h3 className="font-bold text-lg">Your roast go appear here...</h3>
      </div>
    );
  }
  
  // The `roast-display` class allows for specific overrides from index.html.
  // Removed prose classes to allow custom CSS to take precedence.
  return (
    <div ref={scrollRef} className="h-full w-full overflow-y-auto p-6">
       <div className="roast-display">
         <ReactMarkdown remarkPlugins={[remarkGfm]}>
           {roast}
         </ReactMarkdown>
         {isLoading && <span className="inline-block w-2 h-5 bg-hazard-yellow ml-1 animate-pulse"></span>}
       </div>
    </div>
  );
};

export default RoastDisplay;