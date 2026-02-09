# PulseAI — AI-Powered API Analytics Platform

<div align="center">

**Monitor, analyze, and optimize your APIs with AI-powered insights.**

[Get Started](#quick-start) · [Documentation](docs/API.md) · [Architecture](ARCHITECTURE.md) · [Business Case](EXECUTIVE_SUMMARY.md)

</div>

---

## What is PulseAI?

PulseAI is a lightweight, AI-powered API analytics platform that provides instant insights into API performance, security threats, and usage patterns. Set up in 2 minutes with one line of code.

### Key Features

- 📊 **Real-Time Dashboard** — Live metrics on response times, error rates, and throughput
- 🤖 **AI Anomaly Detection** — Statistical models detect unusual patterns before they become incidents
- ⚡ **2-Minute Setup** — One API key, instant monitoring
- 🔍 **Endpoint Analytics** — Per-endpoint performance breakdowns
- 🔔 **Smart Alerts** — Configurable alerts with AI-powered noise reduction
- 🔒 **Security Insights** — Detect suspicious traffic patterns

## Quick Start

### Prerequisites
- Node.js 20+
- npm 9+

### Setup

```bash
# 1. Clone and install
git clone https://github.com/jkelley129/The-Startup.git
cd The-Startup/app
npm install

# 2. Configure environment
cp ../.env.example .env

# 3. Initialize database
npx prisma generate
npx prisma db push

# 4. Seed demo data (optional)
npm run db:seed

# 5. Start development server
npm run dev
```

Open http://localhost:3000

**Demo Login:** `demo@pulseai.dev` / `password123`

### Send Your First Event

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"method":"GET","path":"/api/users","statusCode":200,"responseTimeMs":45}'
```

## Project Structure

```
├── EXECUTIVE_SUMMARY.md    # Business case and market analysis
├── ARCHITECTURE.md         # Technical architecture and decisions
├── SETUP.md               # Detailed setup and deployment guide
├── app/                   # Next.js application
│   ├── src/
│   │   ├── app/           # Pages and API routes
│   │   │   ├── api/       # Backend API endpoints
│   │   │   ├── (auth)/    # Login and registration pages
│   │   │   └── (dashboard)/ # Dashboard, analytics, alerts, settings
│   │   └── lib/           # Business logic and utilities
│   └── prisma/            # Database schema and seed data
├── tests/                 # Test suite
├── docs/                  # Documentation
│   ├── API.md             # API reference
│   ├── CONTRIBUTING.md    # Contribution guidelines
│   └── PITCH_DECK.md      # Investor pitch deck
├── Dockerfile             # Docker production build
├── docker-compose.yml     # Docker Compose configuration
└── .github/workflows/     # CI/CD pipeline
```

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js 14, React, Tailwind CSS | Fast SSR, great DX, rapid UI development |
| Backend | Next.js API Routes | Monolithic simplicity for MVP, easy to extract |
| Database | SQLite (Prisma ORM) | Zero-config, trivial migration to PostgreSQL |
| Auth | JWT + bcrypt | Stateless, scalable, no vendor lock-in |
| AI/ML | Statistical anomaly detection (Z-score) | Works with small datasets, no training needed |
| Testing | Jest | Industry standard, great TypeScript support |
| Deployment | Docker, Vercel-ready | Flexible deployment options |

## Deployment

### Docker
```bash
docker-compose up -d
```

### Vercel
```bash
cd app && vercel
```

See [SETUP.md](SETUP.md) for detailed deployment instructions.

## Testing

```bash
cd app
npm test
```

## Documentation

- [📋 Executive Summary](EXECUTIVE_SUMMARY.md) — Business case, market analysis, competitive positioning
- [🏗️ Architecture](ARCHITECTURE.md) — Technical decisions, system design, ADRs
- [🚀 Setup Guide](SETUP.md) — Installation, deployment, configuration
- [📡 API Reference](docs/API.md) — Complete API documentation
- [🤝 Contributing](docs/CONTRIBUTING.md) — How to contribute
- [💼 Pitch Deck](docs/PITCH_DECK.md) — Investor-ready summary

## License

MIT