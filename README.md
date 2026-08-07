# 🌿 LeafForm

**LeafForm** is a high-performance, dynamic form builder, survey, quiz, and analytics platform. Built with an end-to-end type-safe TypeScript monorepo architecture, LeafForm combines Next.js 15, Express, tRPC, Drizzle ORM, and Inngest background event processing with an aesthetic **Deep Forest Green** design system.

---

## 🎨 LeafForm Design System & Vision

LeafForm provides an intuitive and visually stunning user experience designed around a custom **Deep Forest Green & Pure White** design system (documented in [DESIGN.md](file:///home/dron/Documents/programming/monoreop-tRPC/etc/doc/DESIGN.md)):

- **Primary Deep Forest Gradient**: `from-[#092218] via-[#0e2c20] to-[#081a13]` with subtle ambient emerald stage glows (`emerald-500/10`).
- **Brand Accent Greens**: Emerald highlights (`#34d399` / `text-emerald-400`), Shampoo Form Primary (`#134e3b`), Survey Primary (`#0d5c41`), and Analytics Primary (`#065f46`).
- **Clean Contrast Surfaces**: Pure White (`#ffffff`) and Slate (`#f8fafc`, `#0f172a`, `#475569`) contrast cards for form elements, builder canvases, and administrative dashboards.
- **Glassmorphism & Micro-Interactions**: Smooth 300ms–500ms transitions, rounded container surfaces (`rounded-3xl` / `rounded-2xl`), interactive carousel controls, and responsive preview stages.

---

## 📁 Complete Repository & File Structure

LeafForm is structured as a **Turborepo monorepo** using **PNPM Workspaces**. Below is the complete overview of every directory, application, package, configuration file, and git hook in the repository:

```text
monoreop-tRPC/
├── .agents/                     # Customization root containing workspace agent rules & skills
├── .github/                     # GitHub Actions CI/CD workflows and repository settings
│   ├── scripts/                 # Utility automation and notification scripts
│   │   └── notify-telegram.js   # Lightweight Telegram notification handler
│   └── workflows/               # CI/CD pipeline automation scripts
├── .husky/                      # Git hooks management (Husky)
│   ├── commit-msg               # Validates commit messages with Commitlint
│   ├── pre-commit               # Executes linting and code formatting pre-commit
│   └── pre-push                 # Executes type checks before pushing code
├── .vscode/                     # Recommended VS Code workspace settings & extensions
├── .turbo/                      # Turborepo local build cache directory
│
├── apps/                        # Executable Applications
│   ├── api/                     # Express + tRPC Backend API Server
│   │   ├── src/
│   │   │   ├── index.ts         # API server entry point & HTTP listener port setup
│   │   │   ├── server.ts        # Express app initialization, CORS, tRPC middleware
│   │   │   └── env.ts           # Backend environment schema validation via Zod
│   │   ├── eslint.config.js     # API-specific linting rules
│   │   ├── package.json         # API app scripts and backend dependencies
│   │   ├── tsconfig.json        # TypeScript compiler configuration for API
│   │   └── tsup.config.ts       # Bundler configuration for Node backend build
│   │
│   └── web/                     # Next.js 15 Web Frontend Application
│       ├── app/                 # Next.js App Router Routes & Pages
│       │   ├── admin/           # Admin dashboard & response analytics page
│       │   ├── buildform/       # Visual drag-and-drop dynamic form builder engine
│       │   ├── getstarted/      # User onboarding and registration flow
│       │   ├── logout/          # Session destruction and sign-out route
│       │   ├── submit/          # Form respondent submission view
│       │   ├── userprofile/     # Account management & profile settings
│       │   ├── welcome/         # Landing showcase page & hero stage
│       │   ├── globals.css      # LeafForm Deep Forest CSS variables & Tailwind rules
│       │   ├── layout.tsx       # Root layout wrapper, fonts, and React context providers
│       │   └── page.tsx         # Primary application homepage
│       ├── components/          # Reusable UI components & form elements (Shadcn UI)
│       ├── hooks/               # Custom React hooks (e.g. useLogin, useSignup)
│       ├── lib/                 # Client utilities and helpers (utils.ts)
│       ├── providers/           # React Query, tRPC & global context providers
│       ├── public/              # Web static assets, icons, and favicon
│       ├── trpc/                # Client-side tRPC React hooks & client bindings
│       ├── components.json      # Shadcn component generator configuration
│       ├── env.js               # Web env validation using @t3-oss/env-nextjs
│       ├── eslint.config.js     # Next.js ESLint configuration
│       ├── next.config.js       # Next.js framework configuration options
│       ├── package.json         # Web application package manifest & dependencies
│       ├── postcss.config.mjs   # PostCSS plugin setup for Tailwind CSS
│       └── tsconfig.json        # Web app TypeScript compiler settings
│
├── packages/                    # Shared Workspace Packages
│   ├── database/                # Drizzle ORM Database Access Layer
│   │   ├── drizzle/             # Drizzle SQL migrations & schema snapshots
│   │   ├── models/              # Entity schemas (form, formFields, formSubmissions, user, refreshToken)
│   │   ├── drizzle.config.ts    # Drizzle ORM database migration config
│   │   ├── env.ts               # Database environment URL validation
│   │   ├── index.ts             # Database connection instance exporter
│   │   ├── schema.ts            # Central database table & relation definitions
│   │   └── package.json         # Database package dependencies (drizzle-orm, pg)
│   │
│   ├── trpc/                    # Centralized tRPC API Layer
│   │   ├── server/              # Root tRPC router, procedures, context, & sub-routers (auth, form, health)
│   │   ├── client/              # Shared client tRPC type signatures & interfaces
│   │   └── package.json         # tRPC package dependencies
│   │
│   ├── services/                # Core Business Logic Domain Services
│   │   ├── form/                # Form creation, field validation & response processing (core.ts, model.ts)
│   │   ├── user/                # User authentication, hashing, & profile service logic (core.ts, model.ts)
│   │   └── package.json         # Domain service dependencies
│   │
│   ├── innjest/                 # Inngest Background Event Processing & Workflows
│   │   ├── src/client/          # Inngest client UI components & dashboard
│   │   ├── src/server/          # Inngest analytics handlers & tRPC middleware
│   │   └── src/shared/          # Inngest event types & shared interfaces
│   │
│   ├── logger/                  # Shared structured logging package (pino / custom logger)
│   ├── utils/                   # Shared utility helpers (apiErr, apiRes, hashIT, jwtUtils, initRedis)
│   ├── eslint-config/           # Shared ESLint rule presets across applications
│   └── typescript-config/       # Base tsconfig presets (nextjs, node, react)
│
├── etc/                         # Assets & Documentation
│   ├── doc/                     # Architecture & Design Specifications
│   │   ├── cicd/                # CI/CD & pipeline documentation
│   │   │   └── README.md        # CodeQL & Telegram notification docs
│   │   ├── DESIGN.md            # LeafForm UI/UX & Deep Forest Design System specification
│   │   └── LOGO_DESIGN.md       # Logo and brand typography specification
│   └── public/                  # Generated logos, media, and design system visual assets
│
├── .env                         # Local environment variables configuration file
├── .env.example                 # Template for required environment variables
├── .gitignore                   # Files, logs, and build output directories ignored by Git
├── .npmrc                       # PNPM engine settings and package resolution configs
├── commitlint.config.js         # Conventional commit rules validation configuration
├── docker-compose.yml           # Local Docker configuration for PostgreSQL & Redis
├── eslint.config.js             # Root monorepo linting rules configuration
├── package.json                 # Monorepo root manifest, dev dependencies & workspace scripts
├── pnpm-lock.yaml               # Locked dependency tree for PNPM
├── pnpm-workspace.yaml          # Defines active PNPM workspace modules (apps/*, packages/*)
├── prettier.config.js           # Code formatting standards (print width, semicolons, single quotes)
├── setup.sh                     # Automated setup & environment injector script
└── turbo.json                   # Turborepo task pipeline graph & caching rules
```

### Detailed Breakdown of Root & Config Files

- **Git & CI Hooks (`.husky/`, `.github/`)**:
  - `husky/commit-msg`: Validates commit messages against Conventional Commit standards using Commitlint.
  - `husky/pre-commit`: Automatically runs linting and Prettier formatting on staged files prior to commits.
  - `husky/pre-push`: Performs full TypeScript type checking across all workspaces before code is pushed.
  - `.github/workflows/`: CI/CD pipelines for automated testing, type checking, and deployment.

- **Workspace & Package Management (`pnpm-workspace.yaml`, `turbo.json`, `package.json`)**:
  - `pnpm-workspace.yaml`: Instructs PNPM to link packages under `apps/*` and `packages/*` as an integrated workspace.
  - `turbo.json`: Defines build task execution pipelines, task caching rules, and parallel dependency execution graphs.
  - `package.json`: Contains root-level npm scripts (`dev`, `build`, `lint`, `format`, `check-types`) and shared dev tooling dependencies.

- **Environment & Infrastructure (`.env`, `.env.example`, `setup.sh`, `docker-compose.yml`)**:
  - `setup.sh`: Interactive/automated setup script that verifies toolchain dependencies and injects required `.env` variables.
  - `docker-compose.yml`: Spins up local containerized PostgreSQL database (`5432`) and Redis instance (`6379`).
  - `.env` & `.env.example`: Store environment secrets such as `DATABASE_URL`, `JWT_SECRET`, `PORT`, and `NEXT_PUBLIC_API_URL`.

- **Code Quality & Formatting (`commitlint.config.js`, `eslint.config.js`, `prettier.config.js`)**:
  - `commitlint.config.js`: Enforces standardized commit message formats (e.g. `feat: ...`, `fix: ...`).
  - `eslint.config.js`: Unified ESLint configuration enforcing code style, React hooks rules, and TypeScript best practices.
  - `prettier.config.js`: Shared formatting rule definitions across all file types.

---

## ⚡ Tech Stack

| Layer                  | Technology                                                              |
| :--------------------- | :---------------------------------------------------------------------- |
| **Monorepo Manager**   | [Turborepo](https://turbo.build/) + [PNPM Workspaces](https://pnpm.io/) |
| **Frontend Framework** | [Next.js 15](https://nextjs.org/) (App Router), React 19                |
| **Backend API**        | [Express.js](https://expressjs.com/) + [tRPC v10](https://trpc.io/)     |
| **Database & ORM**     | PostgreSQL + [Drizzle ORM](https://orm.drizzle.team/)                   |
| **Async Jobs**         | [Inngest](https://www.inngest.com/) (`packages/innjest`)                |
| **Styling**            | Tailwind CSS + Custom CSS Variables (LeafForm Forest System)            |
| **Type Safety**        | End-to-End TypeScript + Zod validation                                  |

---

## 🛠️ Prerequisites

Ensure you have the following installed on your machine:

- **Node.js**: `v18.0.0` or higher
- **PNPM**: `v8.0.0` or higher (`npm install -g pnpm`)
- **Docker** (Optional): For running local PostgreSQL database services via `docker-compose.yml`

---

## 🚀 Getting Started

### 1. Environment & Setup

Run the provided setup script to make setup executables active and initialize environment configs:

```bash
chmod +x ./setup.sh
./setup.sh
```

### 2. Install Dependencies

Install workspace dependencies across all applications and shared packages:

```bash
pnpm install
```

### 3. Environment Configuration

Check the root [.env](file:///home/dron/Documents/programming/monoreop-tRPC/.env) file and adjust database connection credentials or API ports if needed:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/leaform"
PORT=4000
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

---

## 💻 Running Development Servers

### Start Everything (Recommended)

Run all applications (`web`, `api`) and watched packages concurrently:

```bash
pnpm dev
```

### Run Specific Applications

- **Start API Server (`apps/api`) only**:

  ```bash
  pnpm --filter @repo/api dev
  ```

- **Start Web Application (`apps/web`) only**:
  ```bash
  pnpm --filter web dev
  ```

---

## 🏗️ Building & Verification

- **Build all applications & packages**:

  ```bash
  pnpm build
  ```

- **Run TypeScript type checks across all workspaces**:

  ```bash
  pnpm check-types
  ```

- **Run ESLint checks**:

  ```bash
  pnpm lint
  ```

- **Format codebase with Prettier**:
  ```bash
  pnpm format
  ```

---

## 📖 Key Documentation & Entry Points

- **System Architecture & Topology**: [etc/doc/SYSTEM_DESIGN.md](file:///home/dron/Documents/programming/monoreop-tRPC/etc/doc/SYSTEM_DESIGN.md)
- **CI/CD & CodeQL Pipelines**: [etc/doc/cicd/README.md](file:///home/dron/Documents/programming/monoreop-tRPC/etc/doc/cicd/README.md)
- **Code Design & Safety Specification**: [etc/doc/CODE_DESIGN.md](file:///home/dron/Documents/programming/monoreop-tRPC/etc/doc/CODE_DESIGN.md)
- **UI/UX & Design System Spec**: [etc/doc/DESIGN.md](file:///home/dron/Documents/programming/monoreop-tRPC/etc/doc/DESIGN.md)
- **Logo & Visual Brand Specs**: [etc/doc/LOGO_DESIGN.md](file:///home/dron/Documents/programming/monoreop-tRPC/etc/doc/LOGO_DESIGN.md)
- **Web Frontend Entry**: [apps/web/app/page.tsx](file:///home/dron/Documents/programming/monoreop-tRPC/apps/web/app/page.tsx)
- **Form Builder Interface**: [apps/web/app/buildform/page.tsx](file:///home/dron/Documents/programming/monoreop-tRPC/apps/web/app/buildform/page.tsx)
- **API Server Entry**: [apps/api/src/index.ts](file:///home/dron/Documents/programming/monoreop-tRPC/apps/api/src/index.ts)
- **tRPC Root Router**: [packages/trpc/server/index.ts](file:///home/dron/Documents/programming/monoreop-tRPC/packages/trpc/server/index.ts)
- **Database Schema**: [packages/database/schema.ts](file:///home/dron/Documents/programming/monoreop-tRPC/packages/database/schema.ts)

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
