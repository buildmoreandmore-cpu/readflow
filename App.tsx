
import React, { useState, useEffect, useCallback } from 'react';
import { AppMode, AppConfig, ReadingStats, SavedDocument, ReadingSession } from './types';
import { DEFAULT_CONFIG } from './constants';
import InputMode from './components/InputMode';
import FlowMode from './components/FlowMode';
import ResultsMode from './components/ResultsMode';
import LandingPage from './components/LandingPage';
import Library from './components/Library';
import StatsPage from './components/StatsPage';
import {
  getSavedDocuments,
  saveDocument,
  updateDocument,
  deleteDocument,
  getReadingSessions,
  saveReadingSession,
  hasVisitedBefore,
  markAsVisited,
  generateId,
} from './lib/storage';

const App: React.FC = () => {
  // Determine initial mode based on first visit
  const [mode, setMode] = useState<AppMode>(() => {
    return hasVisitedBefore() ? AppMode.INPUT : AppMode.LANDING;
  });

  const [content, setContent] = useState<string>('');
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [stats, setStats] = useState<ReadingStats | null>(null);

  // Document & session tracking
  const [savedDocuments, setSavedDocuments] = useState<SavedDocument[]>([]);
  const [readingSessions, setReadingSessions] = useState<ReadingSession[]>([]);
  const [currentDocument, setCurrentDocument] = useState<SavedDocument | null>(null);

  // Load saved data on mount
  useEffect(() => {
    setSavedDocuments(getSavedDocuments());
    setReadingSessions(getReadingSessions());
  }, []);

  // Sync theme with body for immersion
  useEffect(() => {
    document.body.style.backgroundColor = config.theme === 'DARK' ? '#0a0a0b' : '#faf9f7';
    document.body.style.color = config.theme === 'DARK' ? '#f5f5f4' : '#1c1c1c';
  }, [config.theme]);

  // Manage body scroll - only disable during FLOW mode
  useEffect(() => {
    if (mode === AppMode.FLOW) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [mode]);

  const handleLandingStart = useCallback(() => {
    markAsVisited();
    setMode(AppMode.INPUT);
  }, []);

  const handleStartFlow = useCallback((text: string, title?: string, author?: string) => {
    setContent(text);

    // Create or update document
    if (title) {
      const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
      const doc = saveDocument({
        title,
        author,
        sourceType: 'gutenberg',
        content: text,
        wordCount,
        currentPosition: 0,
        progressPercent: 0,
      });
      setCurrentDocument(doc);
      setSavedDocuments(getSavedDocuments());
    } else {
      setCurrentDocument(null);
    }

    setMode(AppMode.FLOW);
  }, []);

  const handleSessionComplete = useCallback((finalStats: ReadingStats) => {
    setStats(finalStats);

    // Save the reading session
    const session: Omit<ReadingSession, 'id'> = {
      documentId: currentDocument?.id,
      documentTitle: currentDocument?.title,
      wordsRead: finalStats.wordsRead,
      durationSeconds: finalStats.timeSpentSeconds,
      averageWPM: finalStats.averageWPM,
      startedAt: finalStats.startTime,
      endedAt: Date.now(),
    };
    saveReadingSession(session);
    setReadingSessions(getReadingSessions());

    // Update document progress if applicable
    if (currentDocument) {
      updateDocument(currentDocument.id, {
        progressPercent: 100,
        currentPosition: currentDocument.wordCount,
      });
      setSavedDocuments(getSavedDocuments());
    }

    setMode(AppMode.RESULTS);
  }, [currentDocument]);

  const handleExitFlow = useCallback(() => {
    setCurrentDocument(null);
    setMode(AppMode.INPUT);
  }, []);

  const handleRestart = useCallback(() => {
    setMode(AppMode.FLOW);
  }, []);

  const handleOpenLibrary = useCallback(() => {
    setMode(AppMode.LIBRARY);
  }, []);

  const handleOpenStats = useCallback(() => {
    setMode(AppMode.STATS);
  }, []);

  const handleSelectBook = useCallback((bookContent: string, title: string, author?: string) => {
    handleStartFlow(bookContent, title, author);
  }, [handleStartFlow]);

  const handleDeleteDocument = useCallback((id: string) => {
    deleteDocument(id);
    setSavedDocuments(getSavedDocuments());
  }, []);

  const handleResumeDocument = useCallback((doc: SavedDocument) => {
    setContent(doc.content);
    setCurrentDocument(doc);
    setMode(AppMode.FLOW);
  }, []);

  const handleBackToInput = useCallback(() => {
    setMode(AppMode.INPUT);
  }, []);

  const handleGoToLanding = useCallback(() => {
    setMode(AppMode.LANDING);
  }, []);

  return (
    <div className={`min-h-screen w-full transition-colors duration-500 font-sans-ui`}>
      {mode === AppMode.LANDING && (
        <LandingPage onStart={handleLandingStart} />
      )}

      {mode === AppMode.INPUT && (
        <>
          {/* Navigation bar */}
          <div className={`fixed top-0 left-0 right-0 z-50 ${config.theme === 'DARK' ? 'bg-[#0a0a0b]/90' : 'bg-[#faf9f7]/90'} backdrop-blur-md border-b ${config.theme === 'DARK' ? 'border-zinc-800/50' : 'border-zinc-200/50'}`}>
            <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
              <button
                onClick={handleGoToLanding}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                title="View landing page"
              >
                <img src="/logo.png" alt="Lumen" className="h-8 w-auto" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGoToLanding}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    config.theme === 'DARK'
                      ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                      : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
                  }`}
                  title="About FlowState"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hidden sm:inline">About</span>
                </button>
                <button
                  onClick={handleOpenLibrary}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    config.theme === 'DARK'
                      ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                      : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="hidden sm:inline">Library</span>
                </button>
                <button
                  onClick={handleOpenStats}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    config.theme === 'DARK'
                      ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                      : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="hidden sm:inline">Stats</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-16">
            <InputMode
              onStart={(text) => handleStartFlow(text)}
              config={config}
              setConfig={setConfig}
            />
          </div>
        </>
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

      {mode === AppMode.LIBRARY && (
        <Library
          onSelectBook={handleSelectBook}
          onBack={handleBackToInput}
          savedDocuments={savedDocuments}
          onDeleteDocument={handleDeleteDocument}
          onResumeDocument={handleResumeDocument}
          config={config}
        />
      )}

      {mode === AppMode.STATS && (
        <StatsPage
          sessions={readingSessions}
          onBack={handleBackToInput}
          config={config}
        />
      )}
    </div>
  );
};

export default App;
