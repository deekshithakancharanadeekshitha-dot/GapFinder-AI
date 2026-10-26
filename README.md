# GapFinder AI

A Next.js + TypeScript MVP for topic-level learning diagnosis, source-aware material upload, diagnostic quizzes, gap reports, adaptive revision plans, and a grounded study assistant.

## Demo login
- Email: `demo@gapfinder.ai`
- Password: `gapfinder123`

> This is a UI demo sign-in, not production authentication. Before a public deployment, integrate Supabase Auth and isolate every document/query by authenticated user.

## Requirements
- Node.js 20+
- npm
- Optional: Gemini API key for topic extraction and AI features

## Run locally
```bash
npm install
cp .env.example .env.local
# Add GEMINI_API_KEY to .env.local (optional)
npm run dev
```
Open http://localhost:3000.

## Features in this starter
- Responsive dashboard and topic mastery overview
- Preloaded sample topics and quiz so judges can immediately explore
- Upload PDF, TXT and Markdown; PDF text extraction, chunking and source-aware processing endpoint
- Quiz, answer evaluation, topic-level scores and gap report
- Revision plan with completion checkboxes and adjustable horizon
- Explain-topic UI that fails closed when source evidence is unavailable
- API routes for uploads, quiz requests and explanations
- Gemini-based topic extraction when `GEMINI_API_KEY` is configured

## Important MVP limitations
This zip is a runnable starter, not a production-complete AI learning platform. Uploads are processed by the API but are not persisted or indexed across sessions. The quiz uses clearly labelled sample questions until a retrieval-backed question-generation pipeline is connected. The explain endpoint intentionally refuses to invent an answer without retrieved source text. The UI uses demo-only sign-in and session state; data resets on refresh.

For a real judging deployment, finish the following:
1. Supabase Auth and user-scoped PostgreSQL tables.
2. Persist document metadata, page-aware chunks and quiz attempts.
3. Generate embeddings and store them in `pgvector`; retrieve top-k chunks by vector similarity and metadata filters.
4. Generate quiz questions from retrieved chunks only; save source chunk IDs and answer keys server-side.
5. Grade submissions on the server, avoid exposing answer keys before submission, and compute mastery with sufficient question evidence.
6. Persist revision plan and progress, then recalculate after each attempt.
7. Add upload malware checks, rate limits, file retention controls and privacy notice.

## RAG design
```text
Upload → text extraction → chunking with page/source metadata
       → embeddings → pgvector
Query/topic → query embedding → top-k retrieval → evidence check
       → LLM answer/question generation → citation validation
Quiz answers → server-side grading → topic mastery → gap report
            → prioritized revision plan → re-assessment
```

## Environment
`GEMINI_API_KEY` is optional for local demo. Never commit `.env.local` or expose API keys in client-side code.

## Deploy
Push this repository to GitHub, import it into Vercel, add environment variables, and deploy. Configure Supabase before inviting real users. Do not advertise this demo as having persistent RAG or secure production authentication until those components are implemented.

## Project structure
```text
src/
  app/
    api/upload/route.ts
    api/quiz/route.ts
    api/explain/route.ts
    globals.css
    layout.tsx
    page.tsx
  lib/ai.ts
```
