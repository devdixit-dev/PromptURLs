# PromptURLs

PromptURLs creates ready-to-open prompt links for ChatGPT, Claude, Gemini, and Grok from one prompt. The app is a single full-stack Next.js 16 application: the App Router serves the interface and Route Handlers, with PostgreSQL accessed through Drizzle ORM.

## Stack

- Next.js 16, React 19, TypeScript, Tailwind CSS
- Next.js Route Handlers for prompt generation and model requests
- PostgreSQL and Drizzle ORM for user prompt metadata and model requests

## Run locally

1. Install dependencies: `npm install --prefix frontend`
2. Copy `frontend/.env.example` to `frontend/.env.local` and set `DATABASE_URL`.
3. Apply the existing database migrations: `npm --prefix frontend run db:migrate`
4. Start the app: `npm run dev`

The app runs at `http://localhost:5173`. Root scripts are also available for `build`, `start`, `lint`, `db:generate`, and `db:migrate`.

## API

- `GET /api/root` — API health check
- `POST /api/root/generate` — validate a prompt, persist it to PostgreSQL, and return provider URLs
- `POST /api/root/request` — validate and persist a model/provider request

The Next.js application requires the Node.js runtime for its PostgreSQL Route Handlers. Set `DATABASE_URL` in the environment used to start the Next.js server. No separately deployed API service or `NEXT_PUBLIC_BACKEND_URL` is needed.

Prompt history in the browser remains in local storage. PostgreSQL retains the existing user/prompt metadata and model request records using the current schema and migrations.
