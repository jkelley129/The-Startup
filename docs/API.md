# PulseAI — API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

PulseAI supports two authentication methods:

### 1. JWT Token (Dashboard Users)
Include the token in the `Authorization` header:
```
Authorization: Bearer <token>
```

### 2. API Key (SDK/Programmatic Access)
Include the API key in the `x-api-key` header:
```
x-api-key: pk_live_<your_key>
```

---

## Endpoints

### Health Check

#### `GET /api/health`
Returns the service status. No authentication required.

**Response:**
```json
{
  "status": "healthy",
  "service": "PulseAI",
  "version": "1.0.0",
  "timestamp": "2026-01-15T10:30:00.000Z"
}
```

---

### Authentication

#### `POST /api/auth/register`
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "Jane Developer",
  "password": "securepassword123"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Jane Developer",
    "role": "user",
    "createdAt": "2026-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### `POST /api/auth/login`
Authenticate an existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "user": { "id": "uuid", "email": "...", "name": "...", "role": "user" },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### `GET /api/auth/me`
Get the currently authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "user": { "id": "uuid", "email": "...", "name": "...", "role": "user" }
}
```

---

### Projects

#### `GET /api/projects`
List all projects for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "projects": [
    {
      "id": "uuid",
      "name": "Production API",
      "description": "Main API server",
      "apiKey": "pk_live_...",
      "createdAt": "...",
      "_count": { "events": 5000, "alerts": 2 }
    }
  ]
}
```

#### `POST /api/projects`
Create a new project.

**Request Body:**
```json
{
  "name": "My API",
  "description": "Optional description"
}
```

**Response (201):**
```json
{
  "project": {
    "id": "uuid",
    "name": "My API",
    "apiKey": "pk_live_..."
  }
}
```

---

### Events

#### `POST /api/events`
Ingest API event data. Supports both single and batch events.

**Authentication:** API Key (`x-api-key`) or JWT (`Authorization: Bearer`)

**Single Event:**
```json
{
  "method": "GET",
  "path": "/api/users",
  "statusCode": 200,
  "responseTimeMs": 45,
  "requestSize": 0,
  "responseSize": 1234,
  "ipAddress": "192.168.1.1",
  "userAgent": "axios/1.6.0"
}
```

**Batch Events:**
```json
{
  "events": [
    { "method": "GET", "path": "/api/users", "statusCode": 200, "responseTimeMs": 45 },
    { "method": "POST", "path": "/api/orders", "statusCode": 201, "responseTimeMs": 120 }
  ]
}
```

#### `GET /api/events?projectId=<id>&limit=50&offset=0`
Query events for a project.

**Response (200):**
```json
{
  "events": [...],
  "total": 5000,
  "limit": 50,
  "offset": 0
}
```

---

### Analytics

#### `GET /api/analytics/overview?projectId=<id>`
Get overview statistics for the last 24 hours.

**Response (200):**
```json
{
  "totalRequests": 12500,
  "errorRate": 2.4,
  "avgResponseTime": 85,
  "p95ResponseTime": 250,
  "changes": {
    "requests": 15,
    "errorRate": -0.5,
    "avgResponseTime": 3
  }
}
```

#### `GET /api/analytics/timeseries?projectId=<id>&metric=requests&period=24h`
Get time series data for charting.

**Parameters:**
- `metric`: `requests`, `avg_response_time`, `error_rate`, `p95_response_time`
- `period`: `1h`, `6h`, `24h`, `7d`, `30d`

**Response (200):**
```json
{
  "timeseries": [
    { "timestamp": "2026-01-15T00:00:00.000Z", "value": 450 },
    { "timestamp": "2026-01-15T01:00:00.000Z", "value": 523 }
  ],
  "metric": "requests",
  "period": "24h"
}
```

#### `GET /api/analytics/endpoints?projectId=<id>`
Get per-endpoint performance breakdown for the last 24 hours.

**Response (200):**
```json
{
  "endpoints": [
    {
      "method": "GET",
      "path": "/api/users",
      "totalRequests": 3500,
      "errorRate": 1.2,
      "avgResponseTime": 42,
      "p95ResponseTime": 120
    }
  ]
}
```

---

### Alerts

#### `GET /api/alerts?projectId=<id>`
List alert rules for a project.

#### `POST /api/alerts`
Create an alert rule.

**Request Body:**
```json
{
  "projectId": "uuid",
  "name": "High Latency Alert",
  "conditionType": "response_time_avg",
  "threshold": 500
}
```

**Condition Types:**
- `response_time_avg` — Average response time in ms
- `error_rate` — Error rate percentage
- `request_count` — Number of requests per period
- `p95_latency` — 95th percentile latency in ms

#### `GET /api/alerts/events?projectId=<id>`
List triggered alert events.

---

## Error Responses

All errors follow this format:
```json
{
  "error": "Human-readable error message",
  "details": {} // Optional validation details
}
```

**Status Codes:**
- `400` — Bad Request (validation error)
- `401` — Unauthorized (missing/invalid auth)
- `404` — Not Found
- `409` — Conflict (duplicate resource)
- `429` — Rate Limit Exceeded
- `500` — Internal Server Error

## Rate Limits

- **API Key:** 1,000 requests per minute
- **JWT:** No rate limit (dashboard usage)
