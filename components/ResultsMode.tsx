
import React from 'react';
import { ReadingStats, AppConfig, ThemeType } from '../types';

interface ResultsModeProps {
  stats: ReadingStats | null;
  config: AppConfig;
  onRestart: () => void;
  onBackToInput: () => void;
}

const ResultsMode: React.FC<ResultsModeProps> = ({ stats, config, onRestart, onBackToInput }) => {
  if (!stats) return null;

  const isDark = config.theme === ThemeType.DARK;
  const minutes = Math.floor(stats.timeSpentSeconds / 60);
  const seconds = Math.floor(stats.timeSpentSeconds % 60);

  return (
    <div className="max-w-3xl mx-auto px-6 py-24 text-center">
      <div className="mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 text-green-500 mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-4xl font-bold mb-2">Session Complete</h2>
        <p className="opacity-60 text-lg">Your focus remained steady. Here's your performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className={`p-8 rounded-2xl border ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
          <p className="text-xs uppercase tracking-widest font-bold opacity-40 mb-3">Words Read</p>
          <p className="text-3xl font-mono text-amber-500 font-bold">{stats.wordsRead.toLocaleString()}</p>
        </div>
        <div className={`p-8 rounded-2xl border ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
          <p className="text-xs uppercase tracking-widest font-bold opacity-40 mb-3">Duration</p>
          <p className="text-3xl font-mono text-amber-500 font-bold">
            {minutes > 0 ? `${minutes}m ` : ''}{seconds}s
          </p>
        </div>
        <div className={`p-8 rounded-2xl border ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
          <p className="text-xs uppercase tracking-widest font-bold opacity-40 mb-3">Average Speed</p>
          <div className="flex flex-col items-center">
             <p className="text-3xl font-mono text-amber-500 font-bold">{stats.averageWPM}</p>
             <span className="text-[10px] opacity-40 font-bold">WPM</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <button 
          onClick={onRestart}
          className="px-10 py-4 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-amber-500/20"
        >
          Read Again
        </button>
        <button 
          onClick={onBackToInput}
          className={`px-10 py-4 rounded-xl font-bold border transition-all hover:scale-105 active:scale-95 ${isDark ? 'border-zinc-800 hover:bg-zinc-800' : 'border-zinc-200 hover:bg-zinc-100'}`}
        >
          New Content
        </button>
      </div>
    </div>
  );
};

export default ResultsMode;
