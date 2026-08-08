# 🏗️ LeafForm System Design and Architecture (ASD-STE100)

This document describes the system architecture, component data flows, authentication process, and background task processing in LeafForm.

---

## 1. System Topology and Components

LeafForm uses a multi-tier monorepo architecture. The system separates presentation, API delivery, domain services, database storage, and background processing.

```mermaid
graph TB
    subgraph Client Tier ["Client Tier (Browser)"]
        WEB["Next.js 15 Web Application<br/>(App Router, React 19)"]
        CLIENT_TRPC["tRPC React Query Hooks"]
        WEB --- CLIENT_TRPC
    end

    subgraph API & Routing Tier ["API & Routing Tier (Port 4000)"]
        EXPRESS["Express API Gateway"]
        OPENAPI["OpenAPI / Scalar Docs<br/>(/docs, /openapi.json)"]
        TRPC_SERVER["tRPC Server Router"]
        EXPRESS --- TRPC_SERVER
        EXPRESS --- OPENAPI
    end

    subgraph Domain & Persistence Tier ["Domain & Persistence Tier"]
        SERVICES["Services Layer<br/>(Form, User, Workspace)"]
        DRIZZLE["Drizzle ORM Engine"]
        PG[("PostgreSQL Database<br/>Port 5432")]
        REDIS[("Redis Server<br/>Port 6379 (Rate Limiting)")]

        TRPC_SERVER --> SERVICES
        SERVICES --> DRIZZLE
        DRIZZLE --> PG
        TRPC_SERVER -.->|Throttle Checks| REDIS
    end

    subgraph Event & Analytics Tier ["Background & Event Tier"]
        INNGEST["Inngest Event Engine<br/>packages/innjest"]
        ANALYTICS["Analytics Collector Middleware"]
        TRPC_SERVER --> ANALYTICS
        ANALYTICS --> INNGEST
    end

    CLIENT_TRPC -->|HTTP / JSON RPC| EXPRESS
```

---

## 2. Authentication Flow

LeafForm uses Access Tokens (JWT) and Refresh Tokens to authenticate users safely.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Web as Web Client (Next.js)
    participant API as Express API Server
    participant Router as tRPC Auth Router
    participant Service as User Service
    participant DB as PostgreSQL DB

    User->>Web: Send Credentials (Email & Password)
    Web->>API: POST /trpc/auth.login
    API->>Router: Run auth.login mutation
    Router->>Service: Verify Password (hashIT / bcrypt)
    Service->>DB: Read User Record (leaf_account)
    DB-->>Service: User Record
    Service->>DB: Store Refresh Token (app_refresh_tokens)
    Service-->>Router: Access Token and Refresh Token
    Router-->>API: Set HTTP-Only Cookie (authentication_token)
    API-->>Web: Return User Profile Payload
    Web-->>User: Show Dashboard Page
```

### Security Rules

- **Access Token**: Short-lived JWT stored in an `authentication_token` HTTP-only cookie or sent in the `Authorization` header.
- **Refresh Token**: Stored in the `app_refresh_tokens` database table. The server deletes the token when the user logs out.
- **Context Verification**: The `createContext` helper validates JWT tokens with `verifyAccTok`. It attaches user data directly to `ctx.user`.

---

## 3. Dynamic Form and Submission Flow

LeafForm handles form creation, field configuration, submission processing, and analytics tracking:

```mermaid
sequenceDiagram
    autonumber
    actor Creator as Form Creator
    actor Respondent as Form Respondent
    participant Web as Web App (/buildform & /submit)
    participant Service as Form Service
    participant DB as Database
    participant Inngest as Inngest Event Engine

    Creator->>Web: Save Form Schema (Choice, Rating, Text, File)
    Web->>Service: Save Form Configuration
    Service->>DB: Insert Form and FormField Records

    Respondent->>Web: Open Form URL (/submit/[formId])
    Web->>Service: Request Form Schema
    Service->>DB: Query Form and Fields
    DB-->>Web: Return Form Render Schema

    Respondent->>Web: Submit Completed Form
    Web->>Service: Send Form Response Payload
    Service->>DB: Insert FormSubmission Record
    Service->>Inngest: Send form.submitted Event
    Inngest->>Inngest: Process Analytics in Background
```

---

## 4. Background Processing (`packages/innjest`)

The system processes analytics tasks asynchronously without slowing API responses:

1. **Analytics Collector**: The `createAnalyticsMiddleware` in [trpc.ts](file:///home/dron/Documents/programming/monoreop-tRPC/packages/trpc/server/trpc.ts) records latency, payload size, and IP addresses.
2. **Analytics Dashboard**: Express serves analytics endpoints at `/api/analytics` and redirects `/analytics` to the dashboard (`/api/analytics/dashboard`).
3. **Request Throttling**: The `fixedWindowRateLimiter` middleware tracks requests per IP using Redis (`FWRL:<ip>`) to block spam requests.

---

## 5. Database Schema Overview

Data models in [models/](file:///home/dron/Documents/programming/monoreop-tRPC/packages/database/models) define the core database tables:

- **Users (`leaf_account`)**: Stores user credentials, email addresses, and profile data.
- **Refresh Tokens (`app_refresh_tokens`)**: Stores active user session tokens with expiration dates.
- **Workspaces (`leaf_workspaces`)**: Stores workspace name, owner ID, and a unique invite code (`LF-XXXX-XXXX`).
- **Workspace Members (`leaf_workspace_members`)**: Maps users to workspaces with a role (`owner`, `read`, `write`).
- **Forms (`form`)**: Stores form titles, descriptions, owner IDs, workspace reference, and status.
- **Form Fields (`form_fields`)**: Stores field types (text, choice, rating, file upload, payment, captcha, etc.).
- **Field Validations (`leaf_field_validations`)**: Stores regex validation patterns and error messages per field type to run dynamic validations.
- **Form Submissions (`form_submissions`)**: Stores submitted responses in JSON format.

---

## 6. Workspace & Role-Based Access

LeafForm supports multi-tenant workspaces with role-based access control. Each user gets a default workspace on signup. Users can create additional workspaces (up to 5) or join others via invite codes.

### Roles

| Role    | Create/Edit Forms | Delete Forms | View Forms | Manage Members |
| ------- | ----------------- | ------------ | ---------- | -------------- |
| `owner` | ✅                | ✅           | ✅         | ✅             |
| `write` | ✅                | ✅           | ✅         | ❌             |
| `read`  | ❌                | ❌           | ✅         | ❌             |

### Workspace Join Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Web as Web Client
    participant API as tRPC Workspace Router
    participant Service as Workspace Service
    participant DB as PostgreSQL

    User->>Web: Enter invite code (LF-XXXX-XXXX)
    Web->>API: workspace.joinWorkspace({ inviteCode })
    API->>Service: joinWorkspace(userId, inviteCode)
    Service->>DB: Lookup workspace by invite code
    Service->>DB: Check if user is already owner or member
    alt Already a member
        Service-->>Web: Return validation error
    else New member
        Service->>DB: Insert workspace_member (role: read)
        Service-->>Web: Return workspace data
    end
    Web-->>User: Switch to joined workspace
```

### Key Implementation Details

- **Auto-provisioning**: `WorkspaceService.provisionDefaultWorkspace()` runs during user signup in `UserService`, creating a default "My Workspace" with a unique invite code.
- **Invite codes**: Generated as `LF-XXXX-XXXX` format using alphanumeric characters.
- **Frontend context**: A global `WorkspaceProvider` shares the active workspace and workspace list across all authenticated pages. The query is disabled on public pages (`/welcome`, `/`) to prevent unauthorized API calls before login.

---

## 7. Environment Configuration

- **Environment Validation**:
  - The web application validates variables with `@t3-oss/env-nextjs` in [env.js](file:///home/dron/Documents/programming/monoreop-tRPC/apps/web/env.js).
  - The API server validates variables with Zod in [env.ts](file:///home/dron/Documents/programming/monoreop-tRPC/apps/api/src/env.ts).
  - The database layer validates connection strings in [env.ts](file:///home/dron/Documents/programming/monoreop-tRPC/packages/database/env.ts).
- **Docker Setup**: The `docker-compose.yml` file configures PostgreSQL on port `5432` and Redis on port `6379`.
