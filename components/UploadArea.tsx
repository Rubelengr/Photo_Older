import React, { useCallback, useState } from 'react';

interface UploadAreaProps {
  onImageSelect: (file: File) => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onImageSelect }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      onImageSelect(files[0]);
    }
  }, [onImageSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onImageSelect(files[0]);
    }
  }, [onImageSelect]);

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative group w-full max-w-2xl mx-auto min-h-[300px] 
        border-2 border-dashed rounded-2xl flex flex-col items-center justify-center
        transition-all duration-300 ease-in-out cursor-pointer overflow-hidden
        ${isDragging 
          ? 'border-indigo-400 bg-indigo-500/10 scale-[1.02]' 
          : 'border-stone-600 bg-stone-800/50 hover:bg-stone-800 hover:border-stone-500'
        }
      `}
    >
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      
      <div className="flex flex-col items-center space-y-4 text-center p-8 pointer-events-none">
        <div className={`p-4 rounded-full bg-stone-700/50 transition-transform duration-300 ${isDragging ? 'scale-110 text-indigo-400' : 'text-stone-400'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-stone-200 mb-1">Drop your image here</h3>
          <p className="text-sm text-stone-400">or click to browse files</p>
        </div>
        <div className="text-xs text-stone-500 bg-stone-900/50 px-3 py-1 rounded-full">
          Supports JPG, PNG, WEBP
        </div>
      </div>
    </div>
  );
};