
export enum AppMode {
  LANDING = 'LANDING',
  INPUT = 'INPUT',
  FLOW = 'FLOW',
  RESULTS = 'RESULTS',
  LIBRARY = 'LIBRARY',
  STATS = 'STATS'
}

export enum FontType {
  SERIF = 'SERIF',
  SANS = 'SANS'
}

export enum ThemeType {
  DARK = 'DARK',
  LIGHT = 'LIGHT'
}

export interface ReadingStats {
  wordsRead: number;
  timeSpentSeconds: number;
  averageWPM: number;
  startTime: number;
}

export interface AppConfig {
  wpm: number;
  chunkSize: number;
  fontType: FontType;
  theme: ThemeType;
  fontSize: number;
  bionicMode: boolean;
  semanticChunking: boolean;
}

export interface SavedDocument {
  id: string;
  title: string;
  author?: string;
  sourceType: 'paste' | 'url' | 'upload' | 'gutenberg';
  sourceUrl?: string;
  gutenbergId?: number;
  content?: string;
  wordCount: number;
  currentPosition: number;
  progressPercent: number;
  createdAt: number;
  updatedAt: number;
}

export interface ReadingSession {
  id: string;
  documentId?: string;
  documentTitle?: string;
  wordsRead: number;
  durationSeconds: number;
  averageWPM: number;
  startedAt: number;
  endedAt: number;
}

export interface GutenbergBook {
  id: number;
  title: string;
  author: string;
  coverUrl?: string;
  textUrl?: string;
  subjects?: string[];
  downloadCount?: number;
}
