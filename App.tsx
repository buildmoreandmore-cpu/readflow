
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppMode, AppConfig, ReadingStats } from './types';
import { DEFAULT_CONFIG } from './constants';
import InputMode from './components/InputMode';
import FlowMode from './components/FlowMode';
import ResultsMode from './components/ResultsMode';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.INPUT);
  const [content, setContent] = useState<string>('');
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [stats, setStats] = useState<ReadingStats | null>(null);

  // Sync theme with body for immersion
  useEffect(() => {
    document.body.style.backgroundColor = config.theme === 'DARK' ? '#0a0a0b' : '#faf9f7';
    document.body.style.color = config.theme === 'DARK' ? '#f5f5f4' : '#1c1c1c';
  }, [config.theme]);

  const handleStartFlow = useCallback((text: string) => {
    setContent(text);
    setMode(AppMode.FLOW);
  }, []);

  const handleSessionComplete = useCallback((finalStats: ReadingStats) => {
    setStats(finalStats);
    setMode(AppMode.RESULTS);
  }, []);

  const handleExitFlow = useCallback(() => {
    setMode(AppMode.INPUT);
  }, []);

  const handleRestart = useCallback(() => {
    setMode(AppMode.FLOW);
  }, []);

  return (
    <div className={`min-h-screen w-full transition-colors duration-500 font-sans-ui overflow-hidden`}>
      {mode === AppMode.INPUT && (
        <InputMode 
          onStart={handleStartFlow} 
          config={config} 
          setConfig={setConfig} 
        />
      )}
      
      {mode === AppMode.FLOW && (
        <FlowMode 
          content={content} 
          config={config} 
          onComplete={handleSessionComplete} 
          onExit={handleExitFlow}
          onUpdateConfig={setConfig}
        />
      )}

      {mode === AppMode.RESULTS && (
        <ResultsMode 
          stats={stats} 
          config={config}
          onRestart={handleRestart}
          onBackToInput={handleExitFlow}
        />
      )}
    </div>
  );
};

export default App;
