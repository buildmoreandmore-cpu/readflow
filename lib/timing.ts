
import { Chunk } from './chunker';
import { TIMING_MODIFIERS } from '../constants';

export function calculateChunkDelay(chunk: Chunk, wpm: number): number {
  const wordCount = chunk.words.length;
  // Base timing: (60,000ms / WPM) per word
  const baseMsPerWord = 60000 / wpm;
  let delay = wordCount * baseMsPerWord;

  // Modifiers
  if (chunk.hasHardPunctuation) delay += TIMING_MODIFIERS.PERIOD;
  if (chunk.hasSoftPunctuation) delay += TIMING_MODIFIERS.COMMA;
  if (chunk.isParagraphEnd) delay += TIMING_MODIFIERS.PARAGRAPH;

  // Length modifier
  chunk.words.forEach(word => {
    if (word.length >= TIMING_MODIFIERS.LONG_WORD_THRESHOLD) {
      delay += (word.length - TIMING_MODIFIERS.LONG_WORD_THRESHOLD) * TIMING_MODIFIERS.LONG_WORD_EXTRA;
    }
  });

  return delay;
}
