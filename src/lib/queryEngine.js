export class QueryEngine {
  constructor(vectorStore, aiService) {
    this.vectorStore = vectorStore;
    this.aiService = aiService;
    this.memory = new ChatMemory();
    this.memory.addMessage("system", 
      "You are a helpful AI assistant that answers questions based on the provided document context. " +
      "If the answer cannot be found in the context, say so. " +
      "Use previous conversation context when relevant to provide more accurate answers."
    );
  }

  async query(question, topK = 3) {
    // Find relevant document chunks
    const queryEmbedding = await this.aiService.generateEmbeddings(question);
    const relevantDocs = await this.vectorStore.similaritySearch(queryEmbedding[0], topK);

    // Construct context from relevant documents
    const context = relevantDocs
      .map(doc => doc.text)
      .join('\n\n');

    // Add user question to memory
    this.memory.addMessage("user", question);

    // Generate response using AI with chat history
    const response = await this.aiService.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        ...this.memory.getMessages(),
        {
          role: "system",
          content: `Here is the relevant context from the document:\n\n${context}`
        }
      ]
    });

    const answer = response.choices[0].message.content;
    
    // Add assistant response to memory
    this.memory.addMessage("assistant", answer);

    return {
      answer,
      relevantSources: relevantDocs.map(doc => ({
        text: doc.text.slice(0, 200) + "...",
        score: doc.score,
        metadata: doc.metadata
      }))
    };
  }

  clearMemory() {
    this.memory.clear();
  }
}