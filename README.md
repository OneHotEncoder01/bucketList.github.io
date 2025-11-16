# FocusFrame

FocusFrame is a gamified life board that combines a React/Vite frontend with an Express + MongoDB backend. The static frontend is published with GitHub Pages (`docs/`), while the API can be deployed to any Node-friendly host so other users can create and manage boards.

## Repository structure

```
backend/   Express API that stores boards in MongoDB
frontend/  React app powered by Vite (builds to ../docs)
docs/      Static bundle published via GitHub Pages
```

## Quick start (local development)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env with your MongoDB credentials
npm run dev
```

The backend exposes the REST API on `http://localhost:3000` by default.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. The frontend talks to `http://localhost:3000` unless you define `VITE_API_BASE`.

## Deploying the backend for other users

1. **Provision MongoDB** – e.g. MongoDB Atlas. Keep the connection string (`MONGODB_URI`) private.
2. **Choose a Node host** – Render, Railway, Fly.io, or any VPS. Push the `backend/` folder there.
3. **Set environment variables** on the host:
   - `MONGODB_URI` (required)
   - `DB_NAME` (optional)
   - `PORT` (optional)
   - `CORS_ORIGINS` (comma-separated list of allowed frontend URLs, e.g. `https://onehotencoder01.github.io/bucketList.github.io`)
4. **Start the server** (`npm start`). Confirm `GET /api/_debug` responds with JSON.

Give this public API URL to the frontend via `VITE_API_BASE`.

## Building and publishing the frontend

```bash
cd frontend
npm run build
```

The build emits static assets into `docs/`. Commit that folder and push to GitHub. In the repository settings, configure **Pages → Build and deployment** to serve from the `docs/` folder on the `master` branch (or whichever branch you use).

If you prefer GitHub Actions deployments, update `.github/workflows/deploy.yml` so the `branches` filter matches your branch and keep `frontend/dist` as the artifact path.

## Environment files

- `backend/.env` – holds server secrets (never commit this).
- `frontend/.env*` – contains public configuration such as `VITE_API_BASE`.
- `.env.example` files in both folders show the required keys.

## Seeding a sample board

The backend includes a generator that creates a tree-structured “Life Quest Achievements” board.

```bash
cd backend
node scripts/generate-life-quest-board.js
npm run import-board -- seed/life-quest-achievements.json
```

After importing, the API will expose the seeded board for any connected frontend.

## Making the app usable for others

- Deploy the backend and share the public API URL.
- Set `VITE_API_BASE` to that URL when you run `npm run build` in `frontend/`.
- Rebuild to `docs/`, commit, and push. GitHub Pages immediately serves the updated frontend, and end-users interact with the live API to create or receive boards.

With the backend running on the public internet and CORS configured, anyone visiting your Pages site can sign in, create new boards, or update existing ones through the API.
