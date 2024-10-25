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
    const buffer = await file.arrayBuffer();
    const text = await this.processor.processDocx(buffer);
    const analysis = await this.processor.analyzeText(text);
    
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

// Initialize the application
new App();