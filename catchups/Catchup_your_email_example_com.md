# While You Were Gone — Since 2026-03-13 22:07:08+05:30
<<<<<<< HEAD
=======
<<<<<<< HEAD

You missed a single but significant commit that laid the groundwork for a React-based frontend. This isn’t just a new UI—it’s a new architectural layer with immediate implications for local development, deployment, and backend API interactions.

## Critical Changes (Must-Read)

1. **React 18.3.1 frontend introduced**
   A full React setup (core, scheduler, JSX runtime) was added as minified production files. This is a *new dependency* with no prior frontend framework in the codebase. Expect:
   - Backend APIs must now handle CORS for frontend requests.
   - Deployment pipelines need a new stage to build Docker images with Node 20 + Nginx.
   - Local development requires `node:20-alpine` (matching the Dockerfile) and a React build step.

2. **Dockerfile overhaul for multi-stage builds**
   The new `Dockerfile` replaces any prior frontend container setup. It uses:
   - **Stage 1 (`builder`)**: `node:20-alpine` to install dependencies and run `npm run build`.
   - **Stage 2**: `nginx:1.25-alpine` to serve static files on port 80.
   - *Action*: Update your local Docker setup and CI/CD to account for this. The Nginx config (referenced but not committed) likely includes SPA routing (e.g., fallback to `index.html`).

3. **Port 80 now reserved for Nginx**
   The frontend serves static assets on port 80 via Nginx. If the backend previously used this port:
   - Conflict risk in local/dev environments.
   - *Action*: Verify port assignments in `docker-compose.yml` (if used) and update accordingly.

## New Features & Additions

- **React 18.3.1 with concurrent rendering support**
  The minified files include:
  - Core React (`react.production.min.js`): `useState`, `useEffect`, and concurrent features like `startTransition`.
  - Scheduler (`scheduler.production.min.js`): Prioritizes rendering work.
  - JSX Runtime (`react-jsx-runtime.production.min.js`): Enables the new JSX transform (no `React.createElement` imports needed).
  *Note*: No source files (e.g., `.jsx`, `.tsx`) were committed—this appears to be a pre-built setup. You’ll need to locate or recreate the original React project structure.

## New Dependencies & Config Changes

- **Node.js 20+ required**
  The Dockerfile uses `node:20-alpine` for builds. Ensure your local environment matches this to avoid version mismatches during `npm install`/`build`.

- **Nginx 1.25 added**
  The production image uses `nginx:1.25-alpine`. While no config was committed, assume it’s optimized for SPAs (e.g., `try_files $uri /index.html`). *Action*: Request the missing `nginx.conf` or recreate it based on standard React deployment patterns.

- **Implicit: Backend CORS updates needed**
  The frontend will call backend APIs from a different origin (even in Docker). Verify that:
  - CORS headers (e.g., `Access-Control-Allow-Origin`) are configured.
  - Preflight requests (`OPTIONS`) are handled if using auth (e.g., cookies/JWT).
=======
>>>>>>> add-pdf-reader-llm
You missed a flurry of foundational frontend work. The repo now has a React 18.3.1 setup with a Dockerized Nginx pipeline—likely the start of a new UI layer. No backend changes yet, but expect CORS and API coordination soon. One noise commit (`hehe`) can be ignored.

## Critical Changes (Must-Read)
1. **React 18.3.1 frontend introduced**
   A full React production setup (minified core, scheduler, JSX runtime) was added. This is a new architectural layer—assume all future UI work will build on this. You’ll need Node.js 20+ locally to match the Docker build environment.

2. **Dockerfile overhaul for frontend deployment**
   New multi-stage build: `node:20-alpine` for builds, `nginx:1.25-alpine` for serving static files on port 80. The Nginx config (not shown) likely includes SPA routing (fallback to `index.html`). **Action**: Verify your local Docker setup can handle this, and check if backend APIs need CORS headers for the frontend’s domain.

3. **Build pipeline now requires frontend steps**
   The Dockerfile assumes `npm run build` generates static files. **Action**: Ensure CI/CD pipelines are updated to include frontend build steps before deployment. If you’re oncall, watch for failed deploys missing `node_modules` or build artifacts.

## New Features & Additions
- **React-based UI layer**
  Files added: `react.production.min.js`, `scheduler.production.min.js`, `react-jsx-runtime.production.min.js`. This enables modern React features (hooks, concurrent rendering). No actual UI components or routes are committed yet—this is just the framework.

- **Nginx as static file server**
  The Dockerfile’s second stage uses Nginx to serve the React app. Expect this to replace or proxy existing backend-served UI templates. The exact routing rules aren’t visible yet, but assume `/` and SPA-style paths (e.g., `/dashboard`) will hit the frontend.

## New Dependencies & Config Changes
- **Node.js 20+ required**
  The Dockerfile’s `builder` stage uses `node:20-alpine`. **Action**: Update your local Node version to match, or you’ll hit version mismatches during builds.

- **Nginx 1.25 added**
  The production image pulls `nginx:1.25-alpine`. No custom config files were committed in this diff, but the Dockerfile references an `nginx.conf`—likely with SPA-specific rules (e.g., `try_files $uri /index.html`).

- **React 18.3.1**
<<<<<<< HEAD
  Added as a production dependency (minified files). No `package.json` was committed, so dependency management details (e.g., `npm` vs `yarn`) are unclear. **Action**: Check for a `package.json` in a later commit or ask the team how to install dev dependencies.
=======
  Added as a production dependency (minified files). No `package.json` was committed, so dependency management details (e.g., `npm` vs `yarn`) are unclear. **Action**: Check for a `package.json` in a later commit or ask the team how to install dev dependencies.
>>>>>>> 233974a (docs: update catchups for 211ac130c4f8ed0828e263955651e5057fc669fa)
>>>>>>> add-pdf-reader-llm
