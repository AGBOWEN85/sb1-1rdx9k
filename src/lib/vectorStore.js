export class VectorStore {
  constructor() {
    this.documents = [];
    this.embeddings = [];
  }

  addDocument(text, embedding, metadata = {}) {
    this.documents.push({ text, metadata });
    this.embeddings.push(embedding);
  }

  async similaritySearch(queryEmbedding, topK = 5) {
    const similarities = this.embeddings.map((embedding, index) => ({
      score: this.cosineSimilarity(queryEmbedding, embedding),
      index
    }));

    similarities.sort((a, b) => b.score - a.score);
    return similarities.slice(0, topK).map(result => ({
      ...this.documents[result.index],
      score: result.score
    }));
  }

  cosineSimilarity(embeddings1, embeddings2) {
    const dotProduct = embeddings1.reduce((sum, value, i) => sum + value * embeddings2[i], 0);
    const norm1 = Math.sqrt(embeddings1.reduce((sum, value) => sum + value * value, 0));
    const norm2 = Math.sqrt(embeddings2.reduce((sum, value) => sum + value * value, 0));
    return dotProduct / (norm1 * norm2);
  }

  clear() {
    this.documents = [];
    this.embeddings = [];
  }
}