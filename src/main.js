import { DocumentProcessor } from './lib/documentProcessor.js';
import { AIService } from './lib/aiService.js';
import { VectorStore } from './lib/vectorStore.js';
import { QueryEngine } from './lib/queryEngine.js';
import { DocumentUploader } from './components/DocumentUploader.js';
import { ResultsDisplay } from './components/ResultsDisplay.js';
import { config } from './config/environment.js';
import './styles/main.css';

class App {
  constructor() {
    this.processor = new DocumentProcessor();
    this.ai = new AIService(config.openaiApiKey);
    this.vectorStore = new VectorStore();
    this.queryEngine = new QueryEngine(this.vectorStore, this.ai);
    this.display = new ResultsDisplay();
    this.initializeApp();
  }

  initializeApp() {
    const mode = document.getElementById('modeBanner');
    if (mode) {
      mode.textContent = this.ai.demo
        ? 'Demo mode, no AI key: everything runs in your browser. Summary, key terms and search are computed locally, and nothing is uploaded.'
        : 'AI mode: OpenAI is used for summary, insights and answers.';
      mode.className = this.ai.demo ? 'mode-banner demo' : 'mode-banner live';
    }
    document.getElementById('sampleButton')?.addEventListener('click', async () => {
      const file = new File([SAMPLE_TEXT], 'sample.txt', { type: 'text/plain' });
      await this.handleFileUpload(file);
    });
    new DocumentUploader(async (file) => {
      await this.handleFileUpload(file);
    });

    this.initializeSearchForm();
  }

  initializeSearchForm() {
    const form = document.getElementById('searchForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = document.getElementById('searchInput').value;
        if (query) {
          await this.handleSearch(query);
        }
      });
    }
  }

  async handleFileUpload(file) {
    this.display.showLoading();
    try {
      const result = await this.processDocument(file);
      this.display.showResults(result);
      this.initializeSearchForm();
    } catch (error) {
      console.error('Failed to process document:', error);
      this.display.showError(error.message);
    }
  }

  async handleSearch(query) {
    this.display.showSearchLoading();
    try {
      const result = await this.queryEngine.query(query);
      this.display.showSearchResults(result);
    } catch (error) {
      console.error('Failed to process query:', error);
      this.display.showSearchError(error.message);
    }
  }

  async processDocument(file) {
    const text = await this.processor.processFile(file);
    if (!text || !text.trim()) throw new Error('No readable text found in this file.');
    const analysis = await this.processor.analyzeText(text);
    if (!analysis.chunks.length) analysis.chunks = [text.trim().slice(0, 1000)];
    
    // Generate embeddings for each chunk
    const embeddings = await this.ai.generateEmbeddings(analysis.chunks);
    
    // Store chunks and embeddings
    this.vectorStore.clear();
    analysis.chunks.forEach((chunk, index) => {
      this.vectorStore.addDocument(chunk, embeddings[index], {
        fileName: file.name,
        chunkIndex: index
      });
    });

    const [insights, summary] = await Promise.all([
      this.ai.analyzeDocument(text),
      this.ai.summarizeDocument(text)
    ]);

    return {
      analysis,
      insights,
      summary,
      searchEnabled: true
    };
  }
}

const SAMPLE_TEXT = `Document AI Processor turns a Word or text file into searchable knowledge. When you upload a file, the text is extracted and split into chunks. Each chunk gets an embedding so similar passages can be found later.

In demo mode no AI key is used. Embeddings are computed locally with a hashed bag of words, the summary picks the sentences that carry the most key terms, and search returns the closest passages. With a server-side key configured, the same pipeline uses OpenAI for summaries, insights and answers.

Privacy matters. In demo mode the file never leaves your browser. Keys are never bundled into the public page.`;

// Initialize the application
window.app = new App();