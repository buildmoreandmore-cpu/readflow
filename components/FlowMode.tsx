
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AppConfig, FontType, ThemeType, ReadingStats } from '../types';
import { COLORS } from '../constants';
import { semanticChunk, Chunk } from '../lib/chunker';
import { calculateChunkDelay } from '../lib/timing';
import BionicText from './BionicText';

interface FlowModeProps {
  content: string;
  config: AppConfig;
  onComplete: (stats: ReadingStats) => void;
  onExit: (currentPosition?: number, progressPercent?: number) => void;
  onUpdateConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  startPosition?: number;
}

const FlowMode: React.FC<FlowModeProps> = ({ content, config, onComplete, onExit, onUpdateConfig, startPosition = 0 }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(startPosition);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const wordsTotalRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeChunkRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<number | null>(null);

  // Split content into semantic chunks
  const chunks = useMemo(() => {
    const processed = config.semanticChunking 
      ? semanticChunk(content, 6)
      : semanticChunk(content, config.chunkSize); // simplified logic reuse
    
    wordsTotalRef.current = processed.reduce((acc, c) => acc + c.words.length, 0);
    return processed;
  }, [content, config.semanticChunking, config.chunkSize]);

  const totalChunks = chunks.length;

  const scheduleNextChunk = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    if (currentIndex >= totalChunks - 1) {
      handleFinish();
      return;
    }

    const currentChunk = chunks[currentIndex];
    const delay = calculateChunkDelay(currentChunk, config.wpm);

    timerRef.current = window.setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, delay);
  }, [currentIndex, totalChunks, chunks, config.wpm]);

  // Handle Play/Pause logic
  useEffect(() => {
    if (isPlaying) {
      scheduleNextChunk();
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isPlaying, currentIndex, scheduleNextChunk]);

  const handleFinish = useCallback(() => {
    setIsPlaying(false);
    const duration = (Date.now() - startTimeRef.current) / 1000;
    onComplete({
      wordsRead: wordsTotalRef.current,
      timeSpentSeconds: duration,
      averageWPM: Math.round((wordsTotalRef.current / duration) * 60),
      startTime: startTimeRef.current
    });
  }, [onComplete]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          setIsPlaying(prev => !prev);
          break;
        case 'ArrowLeft':
          setCurrentIndex(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowRight':
          setCurrentIndex(prev => Math.min(totalChunks - 1, prev + 1));
          break;
        case 'ArrowUp':
          onUpdateConfig(prev => ({ ...prev, wpm: Math.min(1500, prev.wpm + 25) }));
          break;
        case 'ArrowDown':
          onUpdateConfig(prev => ({ ...prev, wpm: Math.max(100, prev.wpm - 25) }));
          break;
        case 'Escape':
          onExit(currentIndex, Math.round((currentIndex / totalChunks) * 100));
          break;
        case 'KeyR':
          setCurrentIndex(0);
          setIsPlaying(true);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalChunks, onExit, onUpdateConfig]);

  // Auto-scroll into view
  useEffect(() => {
    if (activeChunkRef.current) {
      activeChunkRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentIndex]);

  // Auto-hide controls
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    resetControlsTimer();
    return () => { if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current); };
  }, [isPlaying, resetControlsTimer]);

  const isDark = config.theme === ThemeType.DARK;
  const colors = isDark ? COLORS.dark : COLORS.light;
  const fontFamily = config.fontType === FontType.SERIF ? 'font-serif' : 'font-sans-ui';

  return (
    <div 
      className="fixed inset-0 select-none flex flex-col items-center justify-center overflow-hidden"
      onMouseMove={resetControlsTimer}
      onClick={() => setIsPlaying(p => !p)}
      style={{ backgroundColor: colors.bg }}
    >
      {/* Dimming Overlays */}
      <div className="absolute inset-x-0 top-0 h-48 z-10 pointer-events-none" style={{ background: `linear-gradient(to bottom, ${colors.bg}, transparent)` }} />
      <div className="absolute inset-x-0 bottom-0 h-48 z-10 pointer-events-none" style={{ background: `linear-gradient(to top, ${colors.bg}, transparent)` }} />

      {/* Reading Canvas */}
      <div 
        ref={containerRef}
        className={`w-full max-w-3xl h-full px-8 py-[40vh] overflow-y-auto no-scrollbar transition-all duration-700 ${fontFamily}`}
        style={{ fontSize: `${config.fontSize}px`, lineHeight: 1.8 }}
      >
        <div className="flex flex-wrap gap-x-[0.35em] gap-y-0 text-left">
          {chunks.map((chunk, idx) => {
            const isActive = idx === currentIndex;
            const isRead = idx < currentIndex;
            
            return (
              <React.Fragment key={idx}>
                <span 
                  ref={isActive ? activeChunkRef : null}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  className={`inline-block px-1 rounded-md transition-all duration-300 cursor-pointer ${
                    isActive 
                      ? 'scale-105 z-20 shadow-xl' 
                      : 'scale-100 z-0'
                  }`}
                  style={{ 
                    color: isActive ? colors.text : colors.dimmed,
                    backgroundColor: isActive ? `${colors.highlight}22` : 'transparent',
                    boxShadow: isActive ? `0 0 40px ${colors.highlight}33` : 'none',
                    fontWeight: isActive ? 500 : 400,
                  }}
                >
                  {config.bionicMode ? (
                    <BionicText text={chunk.text} />
                  ) : (
                    chunk.text
                  )}
                </span>
                {chunk.isParagraphEnd && <div className="w-full h-8" />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Progress Line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-zinc-800/20 z-30">
        <div 
          className="h-full bg-amber-500 transition-all duration-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
          style={{ width: `${(currentIndex / totalChunks) * 100}%` }}
        />
      </div>

      {/* On-screen Controls */}
      <div 
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-8 px-8 py-3 rounded-full backdrop-blur-xl border border-white/5 z-40 transition-all duration-500 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
        style={{ backgroundColor: isDark ? 'rgba(15,15,18,0.8)' : 'rgba(255,255,255,0.8)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          className="p-2 hover:text-amber-500 transition-colors"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
        </button>

        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-amber-500 text-black hover:scale-110 transition-transform shadow-lg shadow-amber-500/20"
        >
          {isPlaying ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          ) : (
            <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
          )}
        </button>

        <button 
          onClick={() => setCurrentIndex(prev => Math.min(totalChunks - 1, prev + 1))}
          className="p-2 hover:text-amber-500 transition-colors"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
        </button>

        <div className="h-4 w-px bg-white/10" />

        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold">WPM</span>
          <span className="font-mono text-amber-500 font-bold leading-none">{config.wpm}</span>
        </div>

        <button
          onClick={() => onExit(currentIndex, Math.round((currentIndex / totalChunks) * 100))}
          className="p-2 opacity-40 hover:opacity-100 hover:text-red-400 transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Stats Indicators */}
      <div className={`absolute top-8 right-8 font-mono text-sm opacity-30 flex flex-col items-end z-40 transition-opacity duration-500 ${showControls ? 'opacity-30' : 'opacity-0'}`}>
        <span>{Math.round((currentIndex / totalChunks) * 100)}% Complete</span>
        <span>~{Math.round(((totalChunks - currentIndex) * calculateChunkDelay(chunks[currentIndex] || chunks[0], config.wpm)) / 1000 / 60)}m left</span>
      </div>
    </div>
  );
};

export default FlowMode;
