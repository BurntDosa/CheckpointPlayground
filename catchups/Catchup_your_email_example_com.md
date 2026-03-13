# While You Were Gone — Since 2026-03-13 22:07:08+05:30
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
  Added as a production dependency (minified files). No `package.json` was committed, so dependency management details (e.g., `npm` vs `yarn`) are unclear. **Action**: Check for a `package.json` in a later commit or ask the team how to install dev dependencies.