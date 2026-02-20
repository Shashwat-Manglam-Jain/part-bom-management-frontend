# Frontend - Part BOM Management UI

React frontend for managing parts, BOM relationships, and audit history.

## What this frontend does
- Search parts by name or part number.
- Select a part from search and open **Part Details**.
- Create parts with client-side validation.
- Manage BOM links (create, update quantity, delete).
- View audit logs for the selected part.
- Uses a single theme preset: **Emerald Leaf**.

## Tech stack
- React 19
- TypeScript
- Vite
- MUI
- Yup (form validation)

## Prerequisites
- Node.js 18+ (recommended)
- pnpm
- Backend API running (default: `http://localhost:3000`)

## Run locally

### 1) Install dependencies
```bash
pnpm install
```

### 2) Start frontend
```bash
pnpm run dev
```

### 3) Open app
- `http://localhost:5173`

## Environment variable
- `VITE_API_BASE_URL` (optional)
  - Default: `http://localhost:3000`
  - Used by `src/shared/api/httpClient.ts`

## Available scripts
- `pnpm run dev` - start Vite dev server
- `pnpm run build` - type-check + production build
- `pnpm run preview` - preview production build locally
- `pnpm run lint` - run ESLint

## UI modules
- **Part Details**: selected part metadata + parent/child relationships.
- **BOM Manager**: expand BOM tree and manage child links with quantity.
- **Audit Logs**: timeline of part and BOM actions.
- **Create Part**: create new parts and refresh selection.
- **Part Search**: search with clear icon and quick selection.

## Validation rules (frontend)
- Create part:
  - `name` required, max 80 chars
  - `partNumber` max 40 chars
  - `description` max 240 chars
- BOM link quantity:
  - required, number, integer, minimum 1

## API routes used by frontend
- `GET /parts`
- `POST /parts`
- `GET /parts/:partId`
- `GET /parts/:partId/audit-logs`
- `GET /bom/:rootPartId`
- `POST /bom/links`
- `PUT /bom/links`
- `DELETE /bom/links/:parentId/:childId`

## Folder pointers
- `src/features/parts/` - feature UI, hooks, validation
- `src/shared/api/` - API client functions
- `src/shared/types/` - shared TypeScript models
- `src/app/theme.ts` - MUI theme setup (Emerald Leaf)

## Quick explanation
"This frontend is a dashboard for part and BOM operations. Users can search or create parts, inspect details, manage BOM links, and track audit history. It talks to a NestJS backend through REST APIs and keeps the workflow in a single workspace."
