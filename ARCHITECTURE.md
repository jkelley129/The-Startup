# PulseAI — Architecture Document

## Tech Stack Rationale

### Frontend: Next.js 14 + TypeScript + Tailwind CSS
- **Next.js 14:** App Router provides SSR, API routes, and excellent developer experience. Eliminates need for separate backend server for MVP.
- **TypeScript:** Type safety reduces bugs and improves developer productivity. Industry standard for production applications.
- **Tailwind CSS:** Utility-first CSS enables rapid UI development without sacrificing quality. Excellent for dashboard-heavy applications.
- **Recharts:** Lightweight, composable charting library for React. Perfect for analytics dashboards.

### Backend: Next.js API Routes
- For MVP, Next.js API routes eliminate the need for a separate backend service.
- Serverless-ready architecture supports deployment on Vercel, AWS Lambda, etc.
- Easy to extract into standalone service as complexity grows.

### Database: SQLite (via Prisma) → PostgreSQL
- **SQLite for MVP:** Zero-config, embedded database ideal for development and early production.
- **Prisma ORM:** Type-safe database access with excellent migration support. Switching from SQLite to PostgreSQL requires only a connection string change.
- **Migration Path:** PostgreSQL for production scale (handled by changing Prisma datasource).

### Authentication: NextAuth.js (Auth.js)
- Open-source, well-maintained authentication library.
- Supports multiple providers (GitHub, Google, email/password).
- Session management with JWT or database sessions.
- No vendor lock-in compared to Auth0/Clerk.

### Deployment: Docker + Vercel-ready
- Docker for self-hosted deployment and local development.
- Vercel-optimized for instant deployment of Next.js apps.
- CI/CD via GitHub Actions.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │  Dashboard   │  │  Analytics   │  │  Settings/Profile   │ │
│  │  (React)     │  │  (Recharts)  │  │  (React Forms)      │ │
│  └──────┬───────┘  └──────┬───────┘  └─────────┬───────────┘ │
└─────────┼─────────────────┼────────────────────┼─────────────┘
          │                 │                    │
          ▼                 ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Application                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    API Routes Layer                      │ │
│  │  /api/auth/*     /api/events     /api/analytics         │ │
│  │  /api/projects   /api/alerts     /api/dashboard         │ │
│  └──────────────────────┬──────────────────────────────────┘ │
│                         │                                    │
│  ┌──────────────────────┼──────────────────────────────────┐ │
│  │              Business Logic Layer                        │ │
│  │  ┌──────────┐  ┌────────────┐  ┌─────────────────────┐  │ │
│  │  │  Auth    │  │  Analytics │  │  Anomaly Detection  │  │ │
│  │  │  Service │  │  Engine    │  │  Engine (AI)        │  │ │
│  │  └──────────┘  └────────────┘  └─────────────────────┘  │ │
│  └──────────────────────┬──────────────────────────────────┘ │
│                         │                                    │
│  ┌──────────────────────┼──────────────────────────────────┐ │
│  │              Data Access Layer (Prisma)                  │ │
│  └──────────────────────┬──────────────────────────────────┘ │
└─────────────────────────┼────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │    SQLite / PostgreSQL │
              │    (via Prisma)        │
              └───────────────────────┘
```

## Database Schema

### Core Entities

**User** — Platform users (developers/teams)
- id, email, name, password_hash, role, created_at, updated_at

**Project** — API projects being monitored
- id, name, api_key, user_id, description, created_at

**ApiEvent** — Individual API call records
- id, project_id, method, path, status_code, response_time_ms, request_size, response_size, ip_address, user_agent, timestamp

**Alert** — Configured alerts for anomaly detection
- id, project_id, name, condition_type, threshold, is_active, created_at

**AlertEvent** — Triggered alert instances
- id, alert_id, message, severity, resolved, triggered_at

**Dashboard** — Custom dashboard configurations
- id, project_id, name, config (JSON), created_at

## API Design

### Authentication
- `POST /api/auth/register` — Create new account
- `POST /api/auth/login` — Login with credentials
- `GET /api/auth/me` — Get current user

### Projects
- `GET /api/projects` — List user's projects
- `POST /api/projects` — Create new project
- `GET /api/projects/:id` — Get project details
- `PUT /api/projects/:id` — Update project
- `DELETE /api/projects/:id` — Delete project

### Events (API Analytics Data)
- `POST /api/events` — Ingest API event (SDK endpoint)
- `GET /api/events?projectId=&limit=&offset=` — Query events

### Analytics
- `GET /api/analytics/overview?projectId=` — Dashboard overview stats
- `GET /api/analytics/timeseries?projectId=&metric=&period=` — Time series data
- `GET /api/analytics/endpoints?projectId=` — Per-endpoint breakdown

### Alerts
- `GET /api/alerts?projectId=` — List alerts
- `POST /api/alerts` — Create alert
- `PUT /api/alerts/:id` — Update alert
- `GET /api/alerts/events?projectId=` — List triggered alerts

## Security Considerations

1. **Authentication:** bcrypt password hashing, JWT tokens with expiry
2. **API Keys:** SHA-256 hashed storage, rate limiting per key
3. **Input Validation:** Zod schemas for all API inputs
4. **CORS:** Configurable allowed origins
5. **Rate Limiting:** Per-IP and per-API-key limits
6. **SQL Injection:** Prevented by Prisma's parameterized queries
7. **XSS:** Next.js auto-escapes outputs, CSP headers

## Scalability Path

### Phase 1 (MVP - Current)
- Single Next.js app with SQLite
- Supports ~10K events/day
- Single-server deployment

### Phase 2 (Growth)
- Migrate to PostgreSQL
- Add Redis for caching and rate limiting
- Deploy on managed platforms (Vercel + managed DB)
- Supports ~1M events/day

### Phase 3 (Scale)
- Separate API ingestion service (Go/Rust for performance)
- ClickHouse or TimescaleDB for time-series data
- Kafka/NATS for event streaming
- Multi-region deployment
- Supports ~100M events/day

## Architecture Decision Records (ADRs)

### ADR-001: Next.js Monolith for MVP
**Decision:** Use Next.js as a monolithic full-stack framework.
**Rationale:** Fastest path to market. API routes, SSR, and React in one framework. Easy to deploy on Vercel.
**Trade-off:** Less separation of concerns vs. dedicated backend. Acceptable for MVP scale.

### ADR-002: SQLite for Initial Database
**Decision:** Use SQLite via Prisma for the initial release.
**Rationale:** Zero configuration, embedded database. Prisma makes migration to PostgreSQL trivial.
**Trade-off:** Single-writer limitation. Acceptable until ~50K events/day.

### ADR-003: JWT for Authentication
**Decision:** Use JWT tokens for API authentication.
**Rationale:** Stateless, scalable, works well with API-first architecture.
**Trade-off:** Cannot revoke individual tokens without a blocklist. Acceptable with short expiry times.

### ADR-004: Statistical Anomaly Detection over ML Models
**Decision:** Use Z-score based anomaly detection for MVP instead of ML models.
**Rationale:** Simpler to implement, no training data needed, works with small datasets. Can be replaced with ML models in Phase 2.
**Trade-off:** Less sophisticated detection. Acceptable for early users.
