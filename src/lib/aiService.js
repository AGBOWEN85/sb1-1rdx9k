import OpenAI from 'openai';

export class AIService {
  constructor(apiKey) {
    this.openai = new OpenAI({ apiKey });
  }

  async generateEmbeddings(texts) {
    if (typeof texts === 'string') {
      texts = [texts];
    }

    const response = await this.openai.embeddings.create({
      model: "text-embedding-3-small",
      input: texts.map(text => text.slice(0, 8000))
    });
    
    return response.data.map(item => item.embedding);
  }

  async analyzeDocument(text) {
    const truncatedText = text.slice(0, 4000);
    const response = await this.openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "Analyze the following text and provide key insights in bullet points. Focus on main themes, tone, and key takeaways."
        },
        {
          role: "user",
          content: truncatedText
        }
      ]
    });
    return response.choices[0].message.content;
  }

  async summarizeDocument(text) {
    const truncatedText = text.slice(0, 4000);
    const response = await this.openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "Provide a concise summary of the following text in 2-3 sentences."
        },
        {
          role: "user",
          content: truncatedText
        }
      ]
    });
    return response.choices[0].message.content;
  }

  async searchSimilarContent(query, vectorStore) {
    const queryEmbedding = (await this.generateEmbeddings(query))[0];
    return vectorStore.similaritySearch(queryEmbedding);
  }

  get chat() {
    return this.openai.chat;
  }
}