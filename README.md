# Secure Digital Document Management System — Frontend

Next.js 15 + React 19 + TypeScript + Tailwind CSS frontend for the law-enforcement DMS.

## Backend contract

The UI is API-ready for the Django REST backend at `NEXT_PUBLIC_API_BASE_URL` and covers authentication, cases, complaints, documents, evidence, witness statements, legal reviews, hearings, audit logs, global search and an AI service boundary.

The reference backend repository is `https://github.com/satysabrataswain/law_enforcement_dms`.

## Run

```bash
npm install
npm run dev
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

## AI security

The frontend never contains OpenAI/Gemini/other private AI provider keys. The browser calls your backend `/api/ai/...` endpoints, and the backend keeps provider credentials and PostgreSQL credentials in its environment.

## PostgreSQL

PostgreSQL belongs to the Django backend. The frontend consumes REST APIs and does not connect directly to PostgreSQL.
