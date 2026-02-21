# IBG - Islamic Board Games

Real-time multiplayer platform for Islamized versions of popular party games. Learn about Islamic words, prophets, and concepts while playing with friends.

## Games

**Undercover** (3-12 players) - Social deduction game where players receive Islamic terms. Undercover agents get a slightly different word and must blend in. Civilians vote to find them.

**Codenames** (4-10 players) - Two teams compete to identify their agents on a 5x5 board of Islamic terms. Spymasters give one-word clues, operatives guess.

## Quick Start

```bash
# Start all services with Docker
docker compose up -d

# Or run locally:

# Backend (requires Python 3.12+ and uv)
cd backend
uv run python main.py              # http://localhost:5000

# Frontend (requires Bun)
cd front
bun install
bun dev                             # http://localhost:3000
```

## Project Structure

```
IBG/
├── backend/                    # FastAPI + Socket.IO
│   ├── ibg/
│   │   ├── api/               # REST API (controllers, models, schemas, routes)
│   │   ├── socketio/          # Real-time game events (Socket.IO)
│   │   ├── app.py             # FastAPI app factory
│   │   ├── database.py        # Async SQLAlchemy engine
│   │   ├── dependencies.py    # DI with Annotated + Depends
│   │   └── settings.py        # Multi-env pydantic-settings
│   ├── tests/
│   ├── scripts/               # Fake data generation
│   └── main.py
├── front/                     # React 19 SPA
│   ├── src/
│   │   ├── api/               # ky HTTP client + Kubb generated hooks
│   │   ├── components/        # UI components (shadcn/ui)
│   │   ├── hooks/             # Socket.IO, auth hooks
│   │   ├── i18n/              # English + Arabic translations
│   │   ├── providers/         # Auth, Query, Theme providers
│   │   └── routes/            # TanStack Router (file-based)
│   └── vite.config.ts
├── docker-compose.yml          # Local development
├── docker-compose.dokploy.yml  # Production (Dokploy)
└── .github/workflows/          # CI/CD pipeline
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, SQLModel, SQLAlchemy (async), python-socketio |
| Database | PostgreSQL (prod), SQLite (dev) |
| Cache/State | Redis (aredis_om for game state) |
| Auth | JWT (python-jose, bcrypt) |
| Frontend | React 19, TanStack Router/Query, Tailwind v4, shadcn/ui |
| Real-time | Socket.IO (server + client) |
| API Codegen | Kubb (OpenAPI -> React Query hooks) |
| i18n | i18next (English + Arabic with RTL) |
| Testing | pytest (backend), Vitest (frontend) |
| Deployment | Docker + Dokploy (Oracle VPS) |

## Development

### Backend

```bash
cd backend

uv run python main.py                    # Start server on :5000
uv run poe lint                          # Ruff lint
uv run poe format                        # Ruff format
uv run poe check                         # All checks
uv run poe test                          # pytest with coverage
```

### Frontend

```bash
cd front

bun dev                                  # Dev server on :3000
bun run generate                         # Generate API client (backend must be running)
bun run lint                             # oxlint
bun run typecheck                        # TypeScript
bun run test                             # Vitest
```

### Fake Data

```bash
cd backend

# Populate database with test users, games, words, achievements
PYTHONPATH=. uv run python scripts/generate_fake_data.py --create-db

# Reset database
PYTHONPATH=. uv run python scripts/generate_fake_data.py --delete
```

### Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@test.com | admin123 |
| User | user@test.com | user1234 |
| Player | player@test.com | player123 |

## API Documentation

- Scalar UI: http://localhost:5000/scalar
- OpenAPI JSON: http://localhost:5000/openapi.json
- Health check: http://localhost:5000/health

## License

MIT
