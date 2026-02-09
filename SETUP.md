# PulseAI — Setup & Deployment Guide

## Quick Start (Development)

### Prerequisites
- **Node.js** 20+ ([download](https://nodejs.org))
- **npm** 9+ (comes with Node.js)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/jkelley129/The-Startup.git
cd The-Startup

# 2. Install dependencies
cd app
npm install

# 3. Set up environment variables
cp ../.env.example .env
# Edit .env and set JWT_SECRET to a random secure string

# 4. Initialize the database
npx prisma generate
npx prisma db push

# 5. Seed with demo data (optional but recommended)
npm run db:seed

# 6. Start the development server
npm run dev
```

### Access the app
- **App:** http://localhost:3000
- **Demo Login:** `demo@pulseai.dev` / `password123`

---

## Production Deployment

### Option 1: Docker (Recommended)

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t pulseai .
docker run -p 3000:3000 \
  -e DATABASE_URL="file:./data/pulseai.db" \
  -e JWT_SECRET="your-production-secret-here" \
  -e NEXT_PUBLIC_APP_URL="https://your-domain.com" \
  pulseai
```

### Option 2: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd app
vercel

# Set environment variables in Vercel dashboard:
# - DATABASE_URL (use a managed PostgreSQL like Neon, Supabase, or PlanetScale)
# - JWT_SECRET
# - NEXT_PUBLIC_APP_URL
```

### Option 3: Manual Deployment

```bash
cd app

# Install production dependencies
npm ci --production

# Generate Prisma client
npx prisma generate

# Build the application
npm run build

# Start in production mode
NODE_ENV=production npm start
```

---

## Database Setup

### Development (SQLite - Default)
No setup needed. SQLite database is created automatically.

### Production (PostgreSQL)
1. Create a PostgreSQL database
2. Update `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL="postgresql://user:password@host:5432/pulseai"
   ```
3. Update `app/prisma/schema.prisma` provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

---

## Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | Database connection string | `file:./dev.db` |
| `JWT_SECRET` | Yes | Secret for JWT token signing | `default-dev-secret` |
| `NEXT_PUBLIC_APP_URL` | No | Public URL of the application | `http://localhost:3000` |
| `NODE_ENV` | No | Environment mode | `development` |

---

## API Integration

### Sending Events via API Key

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "method": "GET",
    "path": "/api/users",
    "statusCode": 200,
    "responseTimeMs": 45
  }'
```

### Batch Events

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "events": [
      {"method": "GET", "path": "/api/users", "statusCode": 200, "responseTimeMs": 45},
      {"method": "POST", "path": "/api/orders", "statusCode": 201, "responseTimeMs": 120}
    ]
  }'
```

---

## Troubleshooting

### Common Issues

1. **"Cannot find module '@prisma/client'"**
   ```bash
   npx prisma generate
   ```

2. **Database errors**
   ```bash
   npx prisma db push --force-reset
   ```

3. **Port 3000 in use**
   ```bash
   npm run dev -- -p 3001
   ```

4. **Build fails**
   - Ensure `DATABASE_URL` is set
   - Run `npx prisma generate` before building
