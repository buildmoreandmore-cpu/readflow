
export enum AppMode {
  INPUT = 'INPUT',
  FLOW = 'FLOW',
  RESULTS = 'RESULTS'
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
