
import { AppConfig, FontType, ThemeType } from './types';

export const DEFAULT_CONFIG: AppConfig = {
  wpm: 250,
  chunkSize: 3,
  fontType: FontType.SERIF,
  theme: ThemeType.DARK,
  fontSize: 22,
  bionicMode: false,
  semanticChunking: true,
};

export const TIMING_MODIFIERS = {
  PERIOD: 300,
  COMMA: 150,
  COLON: 200,
  PARAGRAPH: 500,
  LONG_WORD_THRESHOLD: 8,
  LONG_WORD_EXTRA: 30,
  TECHNICAL_TERM_EXTRA: 100,
};

export const COLORS = {
  dark: {
    bg: '#0a0a0b',
    text: '#f5f5f4',
    dimmed: 'rgba(245, 245, 244, 0.15)',
    highlight: '#fbbf24', // Amber
  },
  light: {
    bg: '#faf9f7',
    text: '#1c1c1c',
    dimmed: 'rgba(28, 28, 28, 0.15)',
    highlight: '#d97706', // Warm brown/amber
  }
};
