# Master Context

This codebase is the foundational frontend for a React-based web application, built to provide a modern, interactive user interface for an existing or planned backend system. The current state represents the initial setup of a production-ready React 18.3.1 application, containerized with Docker and served via Nginx. The architecture is designed for scalability, with a multi-stage Docker build to optimize image size and a static file deployment strategy. The goal is to enable rapid UI development using React’s concurrent features (e.g., hooks, JSX runtime transforms) while ensuring seamless integration with backend services. This frontend will likely replace or extend a backend-only system, introducing a decoupled UI layer that can evolve independently.

---

## Architecture Overview

The system is structured as a single-page application (SPA) with the following key components and data flows:

### High-Level Structure
```
┌───────────────────────┐    ┌───────────────────────┐    ┌───────────────────────┐
│                       │    │                       │    │                       │
│   React Application   │───▶│   Nginx (Docker)     │───▶│   End User (Browser)  │
│   (Static Build)      │    │   (Port 80)           │    │                       │
│                       │    │                       │    │                       │
└───────────────────────┘    └───────────────────────┘    └───────────────────────┘
                                      ▲
                                      │
┌───────────────────────┐             │
│                       │             │
│   Backend API(s)      ◀─────────────┘
│   (Not in this repo)  │
│                       │
└───────────────────────┘
```

### Key Components
1. **React Application (`/frontend/src`)**
   - Built with React 18.3.1, TypeScript, and Vite (based on `vite.config.ts`).
   - Uses JSX runtime transforms (`react-jsx-runtime.production.min.js`).
   - Static files are generated during build and served by Nginx.
   - Entry point: `index.html` (likely references the React app’s root component).

2. **Docker Setup**
   - **Multi-stage build** (defined in `Dockerfile`):
     - **Stage 1 (`builder`)**:
       Uses `node:20-alpine` to install dependencies (`npm ci`) and build the app (`npm run build`).
       Outputs static files to `/app/dist`.
     - **Stage 2**:
       Copies static files from Stage 1 to `nginx:1.25-alpine`.
       Serves files on port 80 using a custom `nginx.conf`.
   - Optimized for production: small image size, no dev dependencies in the final image.

3. **Nginx Configuration (`nginx.conf`)**
   - Acts as a static file server for the React app.
   - Likely includes SPA routing rules (e.g., fallback to `index.html` for client-side routing).
   - Configured to expose port 80.

4. **Backend API Interaction**
   - The React app will make HTTP requests to backend APIs (not included in this repo).
   - CORS policies must be configured on the backend to allow requests from the frontend domain.

### Data Flow
1. **Build Process**:
   - Developer runs `docker build` → Stage 1 installs dependencies and builds the React app → Stage 2 copies static files to Nginx.
   - Output: A Docker image with Nginx serving the React app.

2. **Runtime**:
   - User accesses the app via browser → Nginx serves `index.html` and static JS/CSS.
   - React hydrates the app on the client side.
   - App fetches data from backend APIs (via `fetch` or libraries like `axios`).
   - User interactions trigger React state updates and re-renders.

3. **Deployment**:
   - The Docker image is deployed to a container orchestrator (e.g., Kubernetes, ECS) or a VM.
   - Nginx handles incoming requests on port 80, serving static files or proxying API requests to the backend.

---

## Key Decision Log

1. **React 18.3.1**
   - **Decision**: Use React 18.3.1 for the frontend.
   - **Rationale**: Leverages modern features like concurrent rendering, automatic batching, and transitions for performance. The minified production builds (`react.production.min.js`, etc.) indicate a focus on optimized runtime performance.
   - **Impact**: Developers must write components using hooks (e.g., `useState`, `useEffect`) and JSX. Class components are discouraged.

2. **Multi-Stage Docker Build**
   - **Decision**: Split Docker build into `builder` (Node.js) and `runtime` (Nginx) stages.
   - **Rationale not documented**.
   - **Impact**:
     - Final Docker image is smaller (~50-100MB vs ~1GB with Node.js).
     - No Node.js or build tools in the production image, reducing attack surface.
     - Requires Docker 17.05+ for multi-stage support.

3. **Nginx as Static File Server**
   - **Decision**: Use Nginx (instead of Node.js, Apache, or a CDN) to serve static files.
   - **Rationale not documented**.
   - **Impact**:
     - Nginx is lightweight and efficient for static files.
     - Custom routing (e.g., SPA fallbacks) must be configured in `nginx.conf`.
     - Adds Nginx as a dependency to the deployment stack.

4. **Vite as Build Tool**
   - **Decision**: Use Vite (indicated by `vite.config.ts`) instead of Create React App or Webpack directly.
   - **Rationale not documented**.
   - **Impact**:
     - Faster dev server and builds due to Vite’s ES module-based approach.
     - Requires familiarity with Vite’s configuration (e.g., `vite.config.ts`) for customizations like environment variables or plugins.
     - Build output is optimized for production (e.g., code splitting, minification).

5. **Port 80 for Nginx**
   - **Decision**: Expose Nginx on port 80 (HTTP) instead of 443 (HTTPS) or a custom port.
   - **Rationale not documented**.
   - **Impact**:
     - Simplifies local development (no HTTPS setup needed).
     - Production deployments must handle HTTPS termination via a reverse proxy (e.g., cloud load balancer, Ingress controller) or update `nginx.conf` to include SSL.

---

## Gotchas & Tech Debt

1. **CORS Configuration**
   - **Issue**: The React app will make API requests to a backend, but CORS headers are not configured in this repo.
   - **Source**: Checkpoint-Karan_Bihani.md ("Backend APIs may need CORS updates").
   - **Impact**: API requests will fail in the browser unless the backend explicitly allows the frontend’s origin.
   - **Workaround**: Backend must include headers like `Access-Control-Allow-Origin` and `Access-Control-Allow-Methods`.

2. **Nginx Configuration Not Versioned**
   - **Issue**: `nginx.conf` is referenced in the `Dockerfile` but its contents are not shown in the checkpoint diff.
   - **Source**: Checkpoint-Karan_Bihani.md ("Custom Nginx config is referenced but not shown").
   - **Impact**:
     - Unknown if SPA routing (e.g., fallback to `index.html`) is configured.
     - Risk of misconfiguration in production (e.g., 404s for client-side routes).
   - **Workaround**: Ensure `nginx.conf` includes:
     ```
     location / {
       try_files $uri $uri/ /index.html;
     }
     ```

3. **Missing Local Development Setup**
   - **Issue**: No documentation or scripts (e.g., `docker-compose.yml`) for running the app locally without Docker.
   - **Source**: Inferred from absence of local dev instructions in files/checkpoints.
   - **Impact**: Developers must use Docker for local testing, which may be slower than `npm run dev`.
   - **Workaround**: Run `npm install` + `npm run dev` locally (requires Node.js 20+), but this bypasses Docker/Nginx.

4. **Backend API Assumptions**
   - **Issue**: The frontend assumes the existence of backend APIs, but no API contracts (e.g., OpenAPI specs) or mocks are included.
   - **Source**: Checkpoint-Karan_Bihani.md ("Backend APIs may need CORS updates").
   - **Impact**: Frontend development may block on backend availability.
   - **Workaround**: Use a mocking library (e.g., MSW) or define API contracts early.

5. **No CI/CD Pipeline**
   - **Issue**: The checkpoint notes that CI/CD adjustments are needed (`npm run build`), but no pipeline files (e.g., GitHub Actions, Jenkinsfile) are present.
   - **Source**: Checkpoint-Karan_Bihani.md ("Requires frontend-specific CI/CD adjustments").
   - **Impact**: Manual builds/deploys until a pipeline is added.
   - **Workaround**: Add a basic `.github/workflows/deploy.yml` for Docker builds.

6. **Hardcoded React Version**
   - **Issue**: React 18.3.1 is embedded as minified files instead of being listed in `package.json` as a dependency.
   - **Source**: Presence of `react.production.min.js` in the diff.
   - **Impact**:
     - Updating React requires replacing minified files manually.
     - Risk of version mismatches between dev and prod.
   - **Workaround**: Rebuild the project with `package.json` dependencies to generate fresh minified files.

---

## Dependency Map

| Dependency          | Version       | Role                                                                 | Source               |
|---------------------|---------------|----------------------------------------------------------------------|----------------------|
| **React**           | 18.3.1        | Core UI library for components and state management.                | `react.production.min.js` |
| **React DOM**       | (embedded)    | Renders React components to the DOM.                                | `react.production.min.js` |
| **React Scheduler** | (embedded)    | Prioritizes and schedules React work (e.g., concurrent rendering).   | `scheduler.production.min.js` |
| **JSX Runtime**     | (embedded)    | Transforms JSX into `React.createElement` calls at runtime.         | `react-jsx-runtime.production.min.js` |
| **Node.js**         | 20 (alpine)   | Build environment for installing dependencies and compiling assets. | `Dockerfile` (stage 1) |
| **Nginx**           | 1.25 (alpine) | Static file server for the React app in production.                 | `Dockerfile` (stage 2) |
| **Vite**            | (unknown)     | Build tool for bundling and optimizing the React app.                | `vite.config.ts`     |
| **TypeScript**      | (unknown)     | Static typing for the React app.                                     | `tsconfig.json`      |
| **Tailwind CSS**    | (unknown)     | Utility-first CSS framework (inferred from `tailwind.config.js`).   | `tailwind.config.js` |
| **PostCSS**         | (unknown)     | CSS post-processor (e.g., autoprefixer).                            | `postcss.config.js` |

### External Services
| Service       | Role                                                                 | Interaction Method          |
|---------------|----------------------------------------------------------------------|-----------------------------|
| Backend API   | Provides data and business logic for the React app.                 | HTTP requests (e.g., `fetch`) |
| Docker Hub    | Hosts base images (`node:20-alpine`, `nginx:1.25-alpine`).          | `FROM` in `Dockerfile`       |
| npm Registry  | Source for frontend dependencies (though none listed in `package.json` yet). | `npm install` in Dockerfile  |

---

## Getting Started

### Prerequisites
1. Install [Docker](https://docs.docker.com/get-docker/) (v17.05+ for multi-stage builds).
2. [Verify] Install [Node.js](https://nodejs.org/) v20+ (only needed if developing outside Docker).

### Step 1: Clone the Repository
```bash
git clone <repo-url>
cd <repo-dir>
```

### Step 2: Build the Docker Image
```bash
docker build -t frontend-app -f frontend/Dockerfile .
```
- This runs both stages of the Dockerfile: builds the React app and copies files to Nginx.
- Output: A Docker image tagged `frontend-app`.

### Step 3: Run the App Locally
```bash
docker run -p 8080:80 frontend-app
```
- Access the app at `http://localhost:8080`.
- [Verify] If port 8080 is unavailable, change the host port (e.g., `-p 3000:80`).

### Step 4: Develop Locally (Without Docker)
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
   - [Verify] If this fails, ensure `package.json` exists and is complete (currently missing from the checkpoint).
3. Start the dev server:
   ```bash
   npm run dev
   ```
   - Uses Vite’s dev server (hot reloading, fast refresh).
   - [Verify] Confirm the dev server URL (e.g., `http://localhost:5173`).

### Step 5: Make Changes
- Edit files in `frontend/src`.
- For Docker-based development:
  1. Rebuild the image after changes:
     ```bash
     docker build -t frontend-app -f frontend/Dockerfile .
     ```
  2. Restart the container.
- For local development, changes reflect automatically in the browser.

### Step 6: Debugging
- **Docker Logs**: Check Nginx logs for errors:
  ```bash
  docker logs <container-id>
  ```
- **React Errors**: Open browser dev tools (F12) to inspect console/network errors.
- **CORS Issues**: If API requests fail, ensure the backend includes:
  ```http
  Access-Control-Allow-Origin: http://localhost:8080
  Access-Control-Allow-Methods: GET, POST, PUT, DELETE
  ```

### Step 7: Deploy
1. Push the Docker image to a registry (e.g., Docker Hub, ECR):
   ```bash
   docker tag frontend-app <registry-url>/frontend-app:v1
   docker push <registry-url>/frontend-app:v1
   ```
2. Deploy the image to your hosting platform (e.g., Kubernetes, ECS, or a VM with Docker).
3. [Verify] Ensure the backend API is accessible from the deployed frontend.

### Step 8: Add Missing Configurations
1. **Nginx SPA Routing**:
   - Edit `frontend/nginx.conf` to include:
     ```nginx
     location / {
       try_files $uri $uri/ /index.html;
     }
     ```
2. **CORS on Backend**:
   - Configure the backend to allow requests from the frontend’s domain.
3. **CI/CD Pipeline**:
   - [Verify] Add a workflow (e.g., `.github/workflows/deploy.yml`) to automate builds/deploys on git push. Example:
     ```yaml
     name: Deploy Frontend
     on: [push]
     jobs:
       build:
         runs-on: ubuntu-latest
         steps:
           - uses: actions/checkout@v4
           - run: docker build -t frontend-app -f frontend/Dockerfile .
           - run: docker push <registry-url>/frontend-app:v1
     ```

### Step 9: Update Dependencies
1. Replace the embedded minified React files with proper `package.json` dependencies:
   ```bash
   npm install react@18.3.1 react-dom@18.3.1
   ```
2. Remove the manual `.min.js` files and rebuild the app.