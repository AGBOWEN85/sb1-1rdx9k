export class DocumentProcessor {
  async processDocx(buffer) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  tokenizeText(text) {
    return text.toLowerCase().match(/\b\w+\b/g) || [];
  }

  async analyzeText(text) {
    const tokens = this.tokenizeText(text);
    const sentences = this.getSentences(text);
    const uniqueWords = new Set(tokens);
    const chunks = this.chunkText(text);
    
    return {
      wordCount: tokens.length,
      sentenceCount: sentences.length,
      uniqueWordCount: uniqueWords.size,
      averageWordLength: this.calculateAverageWordLength(tokens),
      tokens: tokens.slice(0, 100),
      sentences: sentences.slice(0, 10),
      chunks,
      statistics: this.calculateTextStatistics(text)
    };
  }

  getSentences(text) {
    return text.match(/[^.!?]+[.!?]+/g) || [];
  }

  chunkText(text, maxChunkLength = 1000) {
    const sentences = this.getSentences(text);
    const chunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > maxChunkLength && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      currentChunk += sentence + ' ';
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  calculateAverageWordLength(tokens) {
    if (tokens.length === 0) return 0;
    const totalLength = tokens.reduce((sum, word) => sum + word.length, 0);
    return totalLength / tokens.length;
  }

  calculateTextStatistics(text) {
    const paragraphs = text.split(/\n\s*\n/);
    const characters = text.length;
    const nonWhitespaceChars = text.replace(/\s/g, '').length;

    return {
      paragraphCount: paragraphs.length,
      characterCount: characters,
      nonWhitespaceCharacterCount: nonWhitespaceChars,
      density: (nonWhitespaceChars / characters * 100).toFixed(2) + '%'
    };
  }
}