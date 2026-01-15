
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
  sourceType: 'paste' | 'url' | 'upload' | 'gutenberg' | 'substack';
  sourceUrl?: string;
  gutenbergId?: number;
  substackArticleId?: string;
  substackPublicationName?: string;
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

export interface SubstackPublication {
  name: string;           // URL slug e.g., "stratechery"
  displayName: string;    // Display name e.g., "Stratechery"
  author: string;         // Author name
  description?: string;
  logoUrl?: string;
}

export interface SubstackArticle {
  id: string;             // guid from RSS
  title: string;
  author: string;
  publicationName: string;
  publishedAt: string;    // pubDate
  link: string;           // permalink
  description: string;    // summary/excerpt
  content?: string;       // full article text (extracted)
}
