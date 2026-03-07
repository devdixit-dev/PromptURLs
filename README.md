# PromptURLs

PromptURLs is a full-stack web app to generate ready-to-open prompt links for major AI providers from a single prompt.

It currently supports:
- ChatGPT
- Claude
- Gemini (Google)
- Grok

## Tech Stack
- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS
- Backend: Fastify, TypeScript, Drizzle ORM, PostgreSQL

## Project Structure
```text
PromptURLs/
|- frontend/   # Next.js client app (port 5173 in dev)
|- backend/    # Fastify API + Drizzle + PostgreSQL
```

## Features
- Generate provider-specific prompt URLs from one input
- Open or copy generated links quickly
- Prompt history stored in browser local storage
- Persistent user/prompt metadata in PostgreSQL
- Model request form (`/api/root/request`) for new provider/model support

## Local Setup

### 1) Clone and move into project
```bash
git clone <your-repo-url>
cd PromptURLs
```

### 2) Configure backend environment
Create `backend/.env`:
```env
PORT=3000
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<db>
DEV_URL=http://localhost:5173
PRO_URL=https://your-frontend-domain.com
```

### 3) Install dependencies
Backend (pnpm):
```bash
cd backend
pnpm install
```

Frontend (npm):
```bash
cd ../frontend
npm install
```

### 4) Run database migrations
```bash
cd ../backend
pnpm migrate
```

### 5) Start both apps
Backend:
```bash
cd backend
pnpm dev
```

Frontend (new terminal):
```bash
cd frontend
npm run dev
```

App URLs:
- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:3000/`

## Frontend Environment
If your backend is not running on `http://localhost:3000`, create `frontend/.env.local`:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

## API Endpoints
- `GET /` -> health check
- `GET /api/root` -> root API check
- `POST /api/root/generate` -> generate prompt URLs
- `POST /api/root/request` -> submit model/provider request

## Contributing
Contributions are welcome and appreciated.

If you want to contribute:
1. Fork the repo
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes with clear commits
4. Open a pull request with context, screenshots (if UI changes), and testing notes

Please keep changes focused, typed, and aligned with the existing code style.

## Collaboration Invite
If you want to collaborate on PromptURLs (features, design, backend improvements, integrations, or scaling), open an issue or start a discussion in this repository.

You can also connect directly:
- LinkedIn: https://www.linkedin.com/in/devershdixit/
- GitHub: https://github.com/devdixit-dev