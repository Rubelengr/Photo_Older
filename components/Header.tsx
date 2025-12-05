import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="w-full py-8 px-4 flex flex-col items-center justify-center space-y-4">
      <div className="flex items-center space-x-3">
        <div className="bg-indigo-500/20 p-2 rounded-lg border border-indigo-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        </div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
          RetroLaminate
        </h1>
      </div>
      <p className="text-stone-400 max-w-lg text-center">
        Transform digital scans into realistic, vintage laminated ID cards. 
        Features authentic waviness, scuffs, paper grain, and natural mobile lighting on a wooden desk.
      </p>
    </header>
  );
};