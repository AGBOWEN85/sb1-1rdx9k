export class ResultsDisplay {
  constructor(containerId = 'results') {
    this.container = document.getElementById(containerId);
  }

  showLoading() {
    this.container.innerHTML = '<div class="loading">Processing document...</div>';
  }

  showSearchLoading() {
    const searchResults = document.getElementById('searchResults');
    if (searchResults) {
      searchResults.innerHTML = '<div class="loading">Searching...</div>';
    }
  }

  showError(message) {
    this.container.innerHTML = `
      <div class="error-container">
        <h3>Error Processing Document</h3>
        <p>${message}</p>
      </div>
    `;
  }

  showSearchError(message) {
    const searchResults = document.getElementById('searchResults');
    if (searchResults) {
      searchResults.innerHTML = `
        <div class="error-container">
          <h3>Error Processing Query</h3>
          <p>${message}</p>
        </div>
      `;
    }
  }

  showResults(results) {
    const { analysis, insights, summary } = results;
    
    this.container.innerHTML = `
      <div class="results-container">
        <section class="analysis-section">
          <h2>Document Statistics</h2>
          <div class="stats-grid">
            <div class="stat-item">
              <label>Words:</label>
              <span>${analysis.wordCount}</span>
            </div>
            <div class="stat-item">
              <label>Sentences:</label>
              <span>${analysis.sentenceCount}</span>
            </div>
            <div class="stat-item">
              <label>Unique Words:</label>
              <span>${analysis.uniqueWordCount}</span>
            </div>
            <div class="stat-item">
              <label>Avg Word Length:</label>
              <span>${analysis.averageWordLength.toFixed(2)}</span>
            </div>
            <div class="stat-item">
              <label>Paragraphs:</label>
              <span>${analysis.statistics.paragraphCount}</span>
            </div>
            <div class="stat-item">
              <label>Text Density:</label>
              <span>${analysis.statistics.density}</span>
            </div>
          </div>
        </section>

        <section class="analysis-section">
          <h2>Summary</h2>
          <p>${summary}</p>
        </section>

        <section class="analysis-section">
          <h2>AI Insights</h2>
          <div class="insights-content">${insights}</div>
        </section>

        <section class="analysis-section">
          <h2>Ask Questions</h2>
          <form id="searchForm" class="search-form">
            <input 
              type="text" 
              id="searchInput" 
              placeholder="Ask a question about the document..."
              class="search-input"
            >
            <button type="submit" class="search-button">Search</button>
            <button type="button" id="clearChat" class="clear-button">Clear Chat</button>
          </form>
          <div id="searchResults" class="search-results"></div>
        </section>
      </div>
    `;

    // Add clear chat handler
    document.getElementById('clearChat')?.addEventListener('click', () => {
      const searchResults = document.getElementById('searchResults');
      if (searchResults) {
        searchResults.innerHTML = '';
      }
      window.app?.queryEngine?.clearMemory();
    });
  }

  showSearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    if (searchResults) {
      const existingResults = searchResults.innerHTML;
      searchResults.innerHTML = `
        ${existingResults}
        <div class="search-results-container">
          <div class="answer-section">
            <h3>Answer</h3>
            <p>${results.answer}</p>
          </div>
          
          <div class="sources-section">
            <h3>Relevant Sources</h3>
            ${results.relevantSources.map((source, index) => `
              <div class="source-item">
                <div class="source-metadata">
                  <span class="source-number">Source ${index + 1}</span>
                  <span class="source-score">Relevance: ${(source.score * 100).toFixed(1)}%</span>
                </div>
                <p class="source-text">${source.text}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  }
}