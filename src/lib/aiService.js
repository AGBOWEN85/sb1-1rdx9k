import OpenAI from 'openai';

// Demo mode: when no API key is configured at build time, every AI call is
// answered locally in the browser (hashed bag-of-words embeddings, extractive
// summary and keyword insights). No key is ever bundled or requested.
const DIM = 512;

function tokenize(text) {
  return (text.toLowerCase().match(/\b[a-z0-9']{2,}\b/g) || []);
}

const STOP = new Set('the a an and or but of to in on at for with by from is are was were be been it this that as not no so if then than into about over its their there they we you he she his her our your i me my them these those can will would should could has have had do does did'.split(' '));

function hashEmbed(text) {
  const v = new Array(DIM).fill(0);
  for (const t of tokenize(text)) {
    if (STOP.has(t)) continue;
    let h = 2166136261;
    for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); }
    v[Math.abs(h) % DIM] += 1;
  }
  return v;
}

function topKeywords(text, n = 8) {
  const counts = {};
  for (const t of tokenize(text)) if (!STOP.has(t) && t.length > 3) counts[t] = (counts[t] || 0) + 1;
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, n);
}

export class AIService {
  constructor(apiKey) {
    this.demo = !apiKey;
    this.openai = this.demo ? null : new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  }

  async generateEmbeddings(texts) {
    if (typeof texts === 'string') texts = [texts];
    if (this.demo) return texts.map(hashEmbed);
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts.map(text => text.slice(0, 8000))
    });
    return response.data.map(item => item.embedding);
  }

  async analyzeDocument(text) {
    if (this.demo) {
      const kw = topKeywords(text);
      if (!kw.length) return 'Demo mode: not enough text to find key terms.';
      return 'Demo mode (no AI key): most frequent key terms — ' +
        kw.map(([w, c]) => `${w} (${c})`).join(', ') + '.';
    }
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'Analyze the following text and provide key insights in bullet points. Focus on main themes, tone, and key takeaways.' },
        { role: 'user', content: text.slice(0, 4000) }
      ]
    });
    return response.choices[0].message.content;
  }

  async summarizeDocument(text) {
    if (this.demo) {
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      const kw = new Set(topKeywords(text, 12).map(([w]) => w));
      const scored = sentences.map((s, i) => ({ s: s.trim(), i, score: tokenize(s).filter(t => kw.has(t)).length }));
      const best = scored.sort((a, b) => b.score - a.score).slice(0, 3).sort((a, b) => a.i - b.i);
      return 'Demo mode (no AI key), extractive summary: ' + best.map(b => b.s).join(' ');
    }
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'Provide a concise summary of the following text in 2-3 sentences.' },
        { role: 'user', content: text.slice(0, 4000) }
      ]
    });
    return response.choices[0].message.content;
  }

  async answer(messages, context) {
    if (this.demo) {
      return 'Demo mode (no AI key): no AI answer is generated. The passages below are the closest matches in your document.';
    }
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [...messages, { role: 'system', content: `Here is the relevant context from the document:\n\n${context}` }]
    });
    return response.choices[0].message.content;
  }

  async searchSimilarContent(query, vectorStore) {
    const queryEmbedding = (await this.generateEmbeddings(query))[0];
    return vectorStore.similaritySearch(queryEmbedding);
  }
}
