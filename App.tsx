import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { UploadArea } from './components/UploadArea';
import { Button } from './components/Button';
import { ResultView } from './components/ResultView';
import { processImageEffect, blobToBase64 } from './services/gemini';

// Define the shape of our history state
interface HistoryState {
  imageFile: File | null;
  previewUrl: string | null;
  processedUrl: string | null;
  error: string | null;
}

// Initial empty state
const INITIAL_STATE: HistoryState = {
  imageFile: null,
  previewUrl: null,
  processedUrl: null,
  error: null,
};

function App() {
  // History State Management
  const [history, setHistory] = useState<HistoryState[]>([INITIAL_STATE]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Derived current state
  const currentState = history[currentIndex];
  const { imageFile, previewUrl, processedUrl, error } = currentState;

  // Cleanup object URLs when component unmounts
  // Note: In a full production app, we might want to more aggressively cleanup 
  // URLs from "future" history states that get sliced off, but relying on 
  // browser GC for blob URLs on reload/close is acceptable for this session-based app.
  useEffect(() => {
    return () => {
      history.forEach(state => {
        if (state.previewUrl && !state.previewUrl.startsWith('data:')) {
           // We don't revoke here to allow undo/redo navigation without breaking images
           // URL.revokeObjectURL(state.previewUrl);
        }
      });
    };
  }, []);

  // Helper to push a new state to history
  const pushState = useCallback((newState: HistoryState) => {
    setHistory(prev => {
      const nextHistory = prev.slice(0, currentIndex + 1);
      return [...nextHistory, newState];
    });
    setCurrentIndex(prev => prev + 1);
  }, [currentIndex]);

  // Undo / Redo Logic
  const canUndo = currentIndex > 0 && !isProcessing;
  const canRedo = currentIndex < history.length - 1 && !isProcessing;

  const undo = useCallback(() => {
    if (canUndo) setCurrentIndex(prev => prev - 1);
  }, [canUndo]);

  const redo = useCallback(() => {
    if (canRedo) setCurrentIndex(prev => prev + 1);
  }, [canRedo]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isProcessing) return;

      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, isProcessing]);

  // Handlers
  const handleImageSelect = (file: File) => {
    const newUrl = URL.createObjectURL(file);
    const newState: HistoryState = {
      imageFile: file,
      previewUrl: newUrl,
      processedUrl: null,
      error: null
    };
    pushState(newState);
  };

  const handleProcess = async () => {
    if (!imageFile || !previewUrl) return;

    setIsProcessing(true);
    
    // We update error in current state without pushing history first if we want
    // but better to keep error distinct. For now, let's just clear error locally or in logic.
    // Actually, let's keep the current state but clear error if any.
    
    try {
      const base64 = await blobToBase64(imageFile);
      const resultBase64 = await processImageEffect(base64, imageFile.type);
      
      const newState: HistoryState = {
        ...currentState,
        processedUrl: resultBase64,
        error: null
      };
      pushState(newState);
    } catch (err) {
      console.error(err);
      // We can push an error state, or just update the current view temporarily.
      // Let's NOT push a new history state for just an error message, 
      // but rather update the current state if we want to persist the error,
      // or simply use a local state. 
      // However, to keep it simple with our architecture, let's replace the current tip of history 
      // with the error state or just add it.
      // Let's just create a new state with the error so the user can 'undo' the error.
      const errorState: HistoryState = {
        ...currentState,
        error: "Something went wrong while processing. Please try again."
      };
      // We'll replace the current state logic slightly or just push. Pushing is safer.
      pushState(errorState);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    pushState(INITIAL_STATE);
  };

  const handleDownload = () => {
    if (!processedUrl) return;
    const link = document.createElement('a');
    link.href = processedUrl;
    link.download = 'retrolaminated-id.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 pb-20">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      
      <Header />

      <main className="container mx-auto px-4 z-10 relative">
        
        {/* Undo/Redo Controls */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-1 bg-stone-900/80 backdrop-blur-sm p-1 rounded-xl border border-stone-800 shadow-lg">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-2 text-stone-400 hover:text-white hover:bg-stone-700/50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              title="Undo (Ctrl+Z)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7v6h6" />
                <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
              </svg>
            </button>
            <div className="w-px h-5 bg-stone-800 mx-1"></div>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-2 text-stone-400 hover:text-white hover:bg-stone-700/50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              title="Redo (Ctrl+Y)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 7v6h-6" />
                <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
              </svg>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-200 flex items-start gap-3 animate-fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p>{error}</p>
          </div>
        )}

        {/* Step 1: Upload */}
        {!previewUrl && (
          <div className="animate-fade-in-up">
            <UploadArea onImageSelect={handleImageSelect} />
            <div className="mt-8 text-center text-stone-500 text-sm">
              <p>Tip: Upload a photo of an ID card or document.</p>
              <p>We'll straighten it and apply the effect.</p>
            </div>
          </div>
        )}

        {/* Step 2: Preview & Process */}
        {previewUrl && !processedUrl && (
          <div className="max-w-md mx-auto space-y-6 animate-fade-in">
            <div className="relative rounded-2xl overflow-hidden border border-stone-700 bg-stone-900 shadow-2xl">
              <img src={previewUrl} alt="Preview" className="w-full h-auto object-contain max-h-[60vh]" />
              <div className="absolute top-4 right-4">
                 <button 
                  onClick={handleReset}
                  className="p-2 bg-black/50 backdrop-blur-md text-white rounded-full hover:bg-black/70 transition-colors"
                  title="Remove image"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                 </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleProcess} 
                isLoading={isProcessing}
                className="w-full py-4 text-lg shadow-[0_0_20px_rgba(99,102,241,0.4)]"
              >
                {isProcessing ? 'Laminating & Rectifying...' : 'Process Image'}
              </Button>
              
              <p className="text-center text-xs text-stone-500 px-4">
                Processing may take 10-15 seconds. The AI will straighten perspective and simulate a vintage mobile photo with subtle flash.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Result */}
        {processedUrl && previewUrl && (
          <ResultView 
            originalUrl={previewUrl} 
            processedUrl={processedUrl} 
            onDownload={handleDownload} 
            onReset={handleReset}
          />
        )}

      </main>
    </div>
  );
}

export default App;