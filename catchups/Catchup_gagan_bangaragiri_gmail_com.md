# While You Were Gone — Since 2026-03-13 20:08:26+05:30

You were gone for less than a day, but a major new frontend layer was introduced. The codebase now includes a React 18.3.1 setup with a Dockerized Nginx deployment. This is a foundational shift—expect backend API adjustments for CORS and new CI/CD requirements for frontend builds.

## Critical Changes (Must-Read)

1. **React 18.3.1 frontend added**
   A full React app is now part of the stack, with minified production files (`react.production.min.js`, `scheduler.production.min.js`, `react-jsx-runtime.production.min.js`). You’ll need Node.js 20+ locally to match the Docker build environment.

2. **New multi-stage Dockerfile**
   The build process now splits into:
   - `builder` stage (Node 20 + `npm run build`)
   - Nginx stage (serves static files on port 80)
   Expect deployment pipelines to require updates for frontend builds.

3. **Nginx routing rules (implied)**
   The Dockerfile references a custom `nginx.conf` (not in diff). Likely includes SPA fallback to `index.html`. Verify this doesn’t conflict with existing backend routes.

## New Features & Additions

- **Frontend UI layer**
  React hooks (`useState`, `useEffect`) and JSX transforms are now available. The app is production-optimized (minified builds).

## Refactors & Structural Changes

- **New directory structure (implied)**
  The Dockerfile copies files from `/app/build` (standard React output). Expect a `src/` directory and `package.json` in the repo.

## New Dependencies & Config Changes

- **Node.js 20**
  Required locally to match the Docker build environment.

- **Nginx 1.25**
  Used in production to serve static files. Port 80 is now reserved for the frontend.

- **Environment implications**
  Backend APIs must enable CORS for the frontend’s origin. Check for new `ALLOWED_ORIGINS` or similar config keys.