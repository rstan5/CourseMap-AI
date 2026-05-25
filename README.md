# CourseMap

Transform messy class materials into a clean, structured course map — powered by AI.

**Not** a chatbot, notes app, or flashcards. One flow: paste chaos → get clarity.

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn-style UI primitives
- OpenAI structured outputs (`gpt-4o-mini`)

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure OpenAI**

   Copy `.env.example` to `.env.local` and add your key:

   ```bash
   cp .env.example .env.local
   ```

   ```env
   OPENAI_API_KEY=sk-...
   ```

3. **Run locally**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

1. Push to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add `OPENAI_API_KEY` in Project → Settings → Environment Variables
4. Deploy

## Project structure

```
src/
├── app/
│   ├── api/generate/route.ts   # OpenAI structured output
│   ├── layout.tsx
│   ├── page.tsx                # Landing + flow orchestration
│   └── globals.css
├── components/
│   ├── course-dashboard.tsx    # Sidebar + concept detail
│   ├── notes-input.tsx
│   ├── landing-hero.tsx
│   └── ui/                     # Button, ScrollArea
├── lib/
│   ├── course-schema.ts        # Zod schema for OpenAI
│   └── utils.ts
└── types/
    └── course.ts
```

## MVP flow

1. User pastes messy notes into the textarea
2. Clicks **Generate Course Structure**
3. `/api/generate` extracts concepts and returns JSON
4. Course dashboard shows navigable concepts with summaries and subconcepts

## License

MIT
