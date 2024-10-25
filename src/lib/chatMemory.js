export class ChatMemory {
  constructor(maxTokens = 4500) {
    this.messages = [];
    this.maxTokens = maxTokens;
  }

  addMessage(role, content) {
    this.messages.push({ role, content });
    this.truncateIfNeeded();
  }

  truncateIfNeeded() {
    // Simple token estimation (4 chars ≈ 1 token)
    while (this.estimateTokens() > this.maxTokens && this.messages.length > 2) {
      this.messages.splice(1, 2); // Remove oldest Q&A pair, keep system
    }
  }

  estimateTokens() {
    return this.messages.reduce((sum, msg) => sum + Math.ceil(msg.content.length / 4), 0);
  }

  getMessages() {
    return this.messages;
  }

  clear() {
    this.messages = [];
  }
}