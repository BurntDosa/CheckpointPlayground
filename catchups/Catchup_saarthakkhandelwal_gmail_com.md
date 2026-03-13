# While You Were Gone — Since 2026-03-13 22:21:58+05:30

You missed the initial commit for a brand-new React frontend, which introduces a full UI layer to the stack. The Docker setup, React 18.3.1 dependencies, and Nginx serving static files are now in place. Expect backend API adjustments (CORS, routing) and CI/CD updates to follow.

## Critical Changes (Must-Read)

1. **React 18.3.1 frontend added**
   A multi-stage Dockerfile now builds and serves a React app via Nginx on port 80. This is a new architectural layer—no existing frontend code was refactored. You’ll need Node.js 20+ locally to match the build environment.

2. **Nginx replaces direct backend UI serving**
   Static files (React bundles) are served by Nginx, not the backend. The config (referenced but not committed) likely includes SPA routing (fallback to `index.html`). Backend APIs must now handle CORS for frontend requests.

3. **New build step required**
   The Dockerfile assumes a `build` stage (e.g., `npm run build`). CI/CD pipelines need updates to include this before deploying the Nginx image.

## New Features & Additions

- **React core + JSX runtime**
  Minified production files for React 18.3.1 (`react.production.min.js`), the scheduler (`scheduler.production.min.js`), and JSX transforms (`react-jsx-runtime.production.min.js`) are now part of the repo. These enable hooks, concurrent rendering, and modern JSX syntax.

- **Dockerized frontend workflow**
  The new `Dockerfile` defines two stages:
  - `builder`: Uses `node:20-alpine` to install dependencies and run the React build.
  - Final stage: Copies static files to `nginx:1.25-alpine` for serving.
  This replaces any prior manual frontend deployment steps.

## New Dependencies & Config Changes

- **Node.js 20+ required**
  The Docker build uses `node:20-alpine`, so local development now requires Node.js 20 or higher to match the environment.

- **Nginx 1.25**
  The production image is based on `nginx:1.25-alpine`. The referenced (but uncommitted) `nginx.conf` will need review for SPA routing rules and proxy settings for API calls.

- **React 18.3.1**
  The commit adds React as a production dependency. Key features enabled:
  - Concurrent rendering (e.g., `startTransition`).
  - Automatic batching of state updates.
  - Suspense for data fetching (if used).
  No `package.json` was committed, so dependency management details (e.g., exact versions, scripts) are still TBD.