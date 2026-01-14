
const CONJUNCTIONS = ['and', 'but', 'or', 'because', 'although', 'while', 'when', 'if', 'so', 'yet'];
const PREPOSITIONS = ['in', 'on', 'at', 'with', 'for', 'to', 'from', 'by', 'about', 'through'];
const PRONOUNS = ['that', 'which', 'who', 'where'];
const ARTICLES = ['the', 'a', 'an'];

export interface Chunk {
  text: string;
  words: string[];
  isParagraphEnd: boolean;
  hasHardPunctuation: boolean;
  hasSoftPunctuation: boolean;
}

export function semanticChunk(text: string, maxWords: number = 6): Chunk[] {
  const paragraphs = text.split(/\n+/);
  const chunks: Chunk[] = [];

  paragraphs.forEach((para, pIdx) => {
    const words = para.trim().split(/\s+/);
    let currentChunk: string[] = [];

    words.forEach((word, wIdx) => {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
      const isHardPunc = /[\.\!\?\;\:]/.test(word);
      const isSoftPunc = /[\,\—\–]/.test(word);
      const isLastWord = wIdx === words.length - 1;

      currentChunk.push(word);

      const shouldBreak = 
        currentChunk.length >= maxWords ||
        isHardPunc ||
        (isSoftPunc && currentChunk.length > 2) ||
        (CONJUNCTIONS.includes(cleanWord) && currentChunk.length > 3) ||
        (PREPOSITIONS.includes(cleanWord) && currentChunk.length > 3) ||
        (PRONOUNS.includes(cleanWord) && currentChunk.length > 3) ||
        isLastWord;

      // Check "Don't break" rules (lookahead)
      const nextWord = words[wIdx + 1];
      let dontBreak = false;
      if (nextWord) {
        const nextClean = nextWord.toLowerCase();
        // Article + Noun
        if (ARTICLES.includes(cleanWord)) dontBreak = true;
        // Simple heuristic for Adjective (ends in common suffixes)
        if (/(y|ful|ish|ous|ive|ble)$/.test(cleanWord)) dontBreak = true;
      }

      if (shouldBreak && !dontBreak) {
        chunks.push({
          text: currentChunk.join(' '),
          words: [...currentChunk],
          isParagraphEnd: isLastWord && pIdx < paragraphs.length - 1,
          hasHardPunctuation: isHardPunc,
          hasSoftPunctuation: isSoftPunc,
        });
        currentChunk = [];
      } else if (shouldBreak && dontBreak && currentChunk.length >= maxWords + 2) {
        // Force break anyway if chunk getting way too long
         chunks.push({
          text: currentChunk.join(' '),
          words: [...currentChunk],
          isParagraphEnd: isLastWord && pIdx < paragraphs.length - 1,
          hasHardPunctuation: isHardPunc,
          hasSoftPunctuation: isSoftPunc,
        });
        currentChunk = [];
      }
    });
  });

  return chunks;
}
