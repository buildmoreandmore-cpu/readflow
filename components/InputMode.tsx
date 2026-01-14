
import React, { useState } from 'react';
import { AppConfig, FontType, ThemeType } from '../types';
import { gemini } from '../services/geminiService';
import { extractTextFromFile } from '../lib/fileExtractor';

interface InputModeProps {
  onStart: (text: string) => void;
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
}

const InputMode: React.FC<InputModeProps> = ({ onStart, config, setConfig }) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractionMessage, setExtractionMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'paste' | 'url'>('paste');

  const handleSubmit = async () => {
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    setExtractionMessage("Gemini is optimizing your text for speed reading...");
    const processed = await gemini.processContent(inputText);
    setExtractionMessage(null);
    setIsProcessing(false);
    onStart(processed);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setExtractionMessage(`Extracting content from ${file.name}...`);
    
    try {
      const extractedText = await extractTextFromFile(file);
      setInputText(extractedText);
      setExtractionMessage("Successfully extracted. Click 'Enter Flow' to begin training.");
    } catch (error: any) {
      alert(error.message || "Failed to process file.");
      setExtractionMessage(null);
    } finally {
      setIsProcessing(false);
      // Reset input so the same file can be uploaded again if needed
      e.target.value = '';
    }
  };

  const isDark = config.theme === ThemeType.DARK;

  return (
    <div className={`max-w-4xl mx-auto px-6 py-12 md:py-24 ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">FlowState</h1>
        <p className="text-lg opacity-60">Train your focus. Master the art of speed reading.</p>
      </header>

      <div className={`rounded-2xl border ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-zinc-200'} shadow-2xl overflow-hidden`}>
        {/* Tabs */}
        <div className={`flex border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <button 
            onClick={() => setActiveTab('paste')}
            className={`flex-1 py-4 font-medium transition-colors ${activeTab === 'paste' ? 'text-amber-500' : 'opacity-50 hover:opacity-80'}`}
          >
            Paste Text
          </button>
          <button 
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-4 font-medium transition-colors ${activeTab === 'url' ? 'text-amber-500' : 'opacity-50 hover:opacity-80'}`}
          >
            URL Fetch
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={activeTab === 'paste' ? "Paste your article, book chapter, or document here..." : "Enter a URL to summarize and read..."}
              className={`w-full h-64 p-4 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/50 transition-all resize-none ${isDark ? 'bg-zinc-950 text-white placeholder-zinc-700' : 'bg-zinc-50 text-zinc-900 placeholder-zinc-400'}`}
            />
            {extractionMessage && (
              <div className={`absolute bottom-4 left-4 right-4 p-3 rounded-lg text-xs flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 ${isDark ? 'bg-zinc-800 text-amber-400' : 'bg-zinc-100 text-amber-700'}`}>
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                {extractionMessage}
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <label className={`cursor-pointer px-4 py-2 rounded-lg border transition-all ${isDark ? 'border-zinc-700 hover:bg-zinc-800' : 'border-zinc-200 hover:bg-zinc-100'}`}>
                <span className="text-sm font-medium">Upload File</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".txt,.md,.pdf,.docx" 
                  onChange={handleFileUpload}
                  disabled={isProcessing} 
                />
              </label>
              <div className="h-6 w-px bg-zinc-800 hidden md:block" />
              <p className="text-xs opacity-40">Supported: .pdf, .docx, .txt, .md</p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isProcessing || !inputText.trim()}
              className={`w-full md:w-auto px-10 py-3 rounded-xl font-bold transition-all ${isProcessing || !inputText.trim() ? 'opacity-30 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20 active:scale-95'}`}
            >
              {isProcessing && !extractionMessage?.includes("Success") ? 'Processing...' : 'Enter Flow'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Quick Settings */}
        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-zinc-200'}`}>
          <h3 className="font-bold mb-6 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Training Parameters
          </h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm opacity-60">Speed</span>
                <span className="text-sm font-mono text-amber-500 font-bold">{config.wpm} WPM</span>
              </div>
              <input 
                type="range" min="100" max="1000" step="25" 
                value={config.wpm}
                onChange={(e) => setConfig({...config, wpm: parseInt(e.target.value)})}
                className="w-full accent-amber-500"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <span className="text-sm opacity-60 block mb-2">Chunk Method</span>
                <button 
                  onClick={() => setConfig({...config, semanticChunking: !config.semanticChunking})}
                  className={`w-full p-2 rounded-lg text-sm transition-all ${config.semanticChunking ? 'bg-amber-500 text-black font-bold' : isDark ? 'bg-zinc-800 opacity-60' : 'bg-zinc-100 opacity-60'}`}
                >
                  {config.semanticChunking ? 'Semantic' : 'Fixed Size'}
                </button>
              </div>
              {!config.semanticChunking && (
                <div className="flex-1">
                  <span className="text-sm opacity-60 block mb-2">Chunk Size</span>
                  <select 
                    value={config.chunkSize}
                    onChange={(e) => setConfig({...config, chunkSize: parseInt(e.target.value)})}
                    className={`w-full p-2 rounded-lg ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'} outline-none`}
                  >
                    {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} {n === 1 ? 'word' : 'words'}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium">Bionic Mode</span>
                <span className="text-[10px] opacity-40 uppercase tracking-tighter">Accessibility Assist</span>
              </div>
              <button 
                onClick={() => setConfig({...config, bionicMode: !config.bionicMode})}
                className={`w-12 h-6 rounded-full transition-all relative ${config.bionicMode ? 'bg-amber-500' : 'bg-zinc-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${config.bionicMode ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Visual Settings */}
        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-zinc-200'}`}>
          <h3 className="font-bold mb-6 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
            Appearance
          </h3>
          <div className="space-y-6">
             <div className="flex-1">
                <span className="text-sm opacity-60 block mb-2">Font Style</span>
                <select 
                  value={config.fontType}
                  onChange={(e) => setConfig({...config, fontType: e.target.value as FontType})}
                  className={`w-full p-2 rounded-lg ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'} outline-none`}
                >
                  <option value={FontType.SERIF}>Serif (Lora)</option>
                  <option value={FontType.SANS}>Sans (Plex Sans)</option>
                </select>
              </div>

            <div className="flex items-center justify-between">
              <span className="text-sm opacity-60">Theme</span>
              <div className={`flex p-1 rounded-xl ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                <button 
                  onClick={() => setConfig({...config, theme: ThemeType.DARK})}
                  className={`px-4 py-1.5 rounded-lg text-sm transition-all ${config.theme === ThemeType.DARK ? 'bg-zinc-950 text-white shadow-sm' : 'opacity-40'}`}
                >
                  Dark
                </button>
                <button 
                  onClick={() => setConfig({...config, theme: ThemeType.LIGHT})}
                  className={`px-4 py-1.5 rounded-lg text-sm transition-all ${config.theme === ThemeType.LIGHT ? 'bg-white text-black shadow-sm' : 'opacity-40'}`}
                >
                  Light
                </button>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm opacity-60">Text Size</span>
                <span className="text-sm font-mono">{config.fontSize}px</span>
              </div>
              <input 
                type="range" min="16" max="32" step="1" 
                value={config.fontSize}
                onChange={(e) => setConfig({...config, fontSize: parseInt(e.target.value)})}
                className="w-full accent-amber-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputMode;
