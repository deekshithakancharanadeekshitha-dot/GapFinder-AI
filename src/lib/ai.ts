import { GoogleGenerativeAI } from "@google/generative-ai";

export function getModel() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const client = new GoogleGenerativeAI(key);
  return client.getGenerativeModel({ model: "gemini-1.5-flash" });
}
export function chunkText(text: string, size = 1000, overlap = 150) {
  const clean = text.replace(/\s+/g, " ").trim();
  const chunks: string[] = [];
  for (let i = 0; i < clean.length; i += size - overlap) {
    const part = clean.slice(i, i + size);
    if (part.trim()) chunks.push(part);
  }
  return chunks;
}
// Lightweight lexical retrieval for the runnable starter. Replace with embeddings + pgvector
// for semantic retrieval in production; the route preserves chunk/source metadata.
export function retrieve(query: string, chunks: {content:string;source:string;page?:number}[], limit = 5) {
  const terms = query.toLowerCase().split(/[^a-z0-9]+/).filter(t => t.length > 2);
  return chunks.map(c => {
    const body = c.content.toLowerCase();
    const score = terms.reduce((n, term) => n + (body.includes(term) ? 1 : 0), 0);
    return {...c, score};
  }).filter(c => c.score > 0).sort((a,b) => b.score-a.score).slice(0,limit);
}