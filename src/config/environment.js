export const config = {
  openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY,
  models: {
    embedding: "text-embedding-3-small",
    completion: "gpt-4-turbo-preview"
  }
};