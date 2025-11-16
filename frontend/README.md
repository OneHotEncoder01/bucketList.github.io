# FocusFrame Frontend

This React + Vite application renders the FocusFrame achievement board editor and viewer. The UI loads boards from the backend REST API and lets users browse, edit, and track progress.

## Local development

```bash
cd frontend
npm install
npm run dev
```

The dev server runs on `http://localhost:5173` and queries the API at `http://localhost:3000` unless you override `VITE_API_BASE`.

## Environment variables

At build time Vite reads variables that start with `VITE_`. To target a hosted API, create `.env`, `.env.development`, or `.env.production` in this folder and set:

```env
VITE_API_BASE=https://your-backend-hostname.example
```

See `.env.example` for a quick template.

## Production build

```bash
cd frontend
npm run build
```

Vite outputs static assets into `../docs/`, ready for GitHub Pages or any static host. Commit the `docs/` directory and push to publish.

To preview the production bundle locally:

```bash
npm run build
npm run preview
```

## Expected API endpoints

The frontend calls these routes on `VITE_API_BASE`:

- `GET /api/boards`
- `POST /api/boards`
- `GET /api/boards/:id`
- `PUT /api/boards/:id`
- `DELETE /api/boards/:id`
- `POST /api/boards/:id/achievements`
- `PATCH /api/boards/:id/achievements/:achievementId`
- `DELETE /api/boards/:id/achievements/:achievementId`
- `POST /api/boards/:id/achievements/:achievementId/progress`

Ensure the backend exposes these endpoints and enables CORS for your deployed origin so end-users can create and retrieve boards.
