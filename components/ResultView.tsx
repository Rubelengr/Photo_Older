import React from 'react';

interface ResultViewProps {
  originalUrl: string;
  processedUrl: string;
  onDownload: () => void;
  onReset: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ originalUrl, processedUrl, onDownload, onReset }) => {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Original */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-stone-400 uppercase tracking-wider">Original Input</h3>
          </div>
          <div className="relative aspect-[3/4] md:aspect-auto md:h-[500px] w-full bg-stone-800 rounded-xl overflow-hidden border border-stone-700 shadow-xl">
            <img 
              src={originalUrl} 
              alt="Original" 
              className="w-full h-full object-contain p-4"
            />
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] rounded-xl"></div>
          </div>
        </div>

        {/* Processed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-indigo-400 uppercase tracking-wider flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              Mobile Photo Simulation
            </h3>
            <span className="text-xs text-stone-500">Gemini 2.5 Flash Image</span>
          </div>
          <div className="relative aspect-[3/4] md:aspect-auto md:h-[500px] w-full bg-stone-900/50 rounded-xl overflow-hidden border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.1)] group">
            <img 
              src={processedUrl} 
              alt="Processed" 
              className="w-full h-full object-contain" 
            />
          </div>
        </div>

      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-6 border-t border-stone-800/50">
        <button 
          onClick={onReset}
          className="px-6 py-3 rounded-xl font-medium text-stone-300 hover:text-white hover:bg-stone-800 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12" /><path d="M3 3v9h9" /></svg>
          Start Over
        </button>
        
        <button 
          onClick={onDownload}
          className="px-8 py-3 rounded-xl font-semibold bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 transition-all transform active:scale-95 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
          Download Image
        </button>
      </div>
    </div>
  );
};