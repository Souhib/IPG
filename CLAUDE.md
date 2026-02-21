# CLAUDE.md - IBG (Islamic Board Games)

## Project Overview

IBG is a real-time multiplayer platform for Islamized versions of popular party games. Currently supports **Undercover** and **Codenames**, with plans for more games.

### Architecture

This is a **monorepo** with separate backend and frontend applications:

```
IBG/
├── backend/                    # Python/FastAPI + Socket.IO
│   ├── ibg/
│   │   ├── api/               # REST API
│   │   │   ├── controllers/   # Business logic
│   │   │   ├── models/        # SQLModel DB tables
│   │   │   ├── schemas/       # Pydantic request/response + base classes
│   │   │   ├── routes/        # FastAPI routers
│   │   │   ├── services/      # External integrations
│   │   │   ├── constants.py   # All magic values
│   │   │   └── middleware.py  # Security, request ID, logging
│   │   ├── socketio/          # Real-time game events
│   │   │   ├── controllers/   # Game logic (undercover, codenames)
│   │   │   ├── models/        # Redis OM game state models
│   │   │   └── routes/        # Socket.IO event handlers
│   │   ├── app.py             # FastAPI app factory
│   │   ├── database.py        # Async SQLAlchemy engine
│   │   ├── dependencies.py    # DI with Annotated + Depends
│   │   ├── settings.py        # Multi-env pydantic-settings
│   │   └── logger_config.py   # Structured Loguru logging
│   ├── tests/
│   ├── scripts/               # Fake data generation
│   ├── main.py                # Entry point
│   └── pyproject.toml
├── front/                     # React 19 SPA
│   ├── src/
│   │   ├── api/               # API client + Kubb generated hooks
│   │   ├── components/        # UI components
│   │   ├── hooks/             # Custom hooks (socket, auth)
│   │   ├── i18n/              # English + Arabic translations
│   │   ├── lib/               # Utilities (cn, socket, auth)
│   │   ├── providers/         # Auth, Query, Theme providers
│   │   └── routes/            # TanStack Router file-based
│   ├── kubb.config.ts         # API codegen from OpenAPI
│   └── vite.config.ts
├── e2e/                       # Playwright tests (future)
├── docker-compose.yml         # Local dev (Postgres + Redis)
├── docker-compose.dokploy.yml # Production (Oracle VPS)
└── .github/workflows/         # CI/CD
```

### Component Documentation

- **[backend/CLAUDE.md](./backend/CLAUDE.md)**: Backend architecture, API patterns, database models
- **[front/CLAUDE.md](./front/CLAUDE.md)**: Frontend patterns, component guidelines, Kubb usage

## Development Commands

### Backend

```bash
cd backend

# Start dev server
uv run python main.py                    # http://localhost:5000

# Code quality
uv run poe lint                          # Ruff lint check
uv run poe format                        # Ruff format
uv run poe check                         # All checks

# Testing
uv run poe test                          # Run tests

# Fake data
PYTHONPATH=. uv run python scripts/generate_fake_data.py --create-db
PYTHONPATH=. uv run python scripts/generate_fake_data.py --delete
```

### Frontend

```bash
cd front

# Start dev server
bun dev                                  # http://localhost:3000

# Generate API client from OpenAPI spec (requires backend running)
bun run generate

# Code quality
bun run lint                             # oxlint
bun run typecheck                        # TypeScript
bun run format                           # oxfmt

# Testing
bun run test                             # Vitest
bun run test:coverage                    # With coverage
```

### Docker

```bash
# Start all services locally
docker compose up -d

# Production deployment (Dokploy)
docker compose -f docker-compose.dokploy.yml up -d
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
| i18n | i18next (English + Arabic) |
| Testing | pytest (backend), Vitest (frontend) |
| CI/CD | GitHub Actions |
| Deployment | Docker + Dokploy (Oracle VPS) |

## Key Patterns

- **Route -> Controller -> Model**: No business logic in routes
- **Async Everything**: All DB operations and external calls are async
- **Dependency Injection**: FastAPI's `Depends()` with `Annotated` type hints
- **BaseModel/BaseTable**: All models inherit from `ibg.api.schemas.shared.BaseModel/BaseTable`
- **Enhanced Errors**: Auto i18n keys, auto-logging, `frontend_message` for UI
- **Multi-env Settings**: `IBG_ENV` selector (.env -> .env.{env})
- **Socket.IO + REST**: REST for CRUD, Socket.IO for real-time game events
- **Kubb Codegen**: Auto-generated React Query hooks from FastAPI's OpenAPI spec

## Games

### Undercover
- 3-12 players
- Roles: Civilian, Undercover, Mr. White
- Each player gets an Islamic term; undercover gets a different one
- Vote to eliminate the undercover agent

### Codenames
- 4-10 players, 2 teams (Red/Blue)
- Roles: Spymaster, Operative
- 5x5 board of Islamic terms
- Spymaster gives one-word clues, operatives guess

## Git Conventions

Use Conventional Commits with emojis:
- `feat(auth): ✨ add JWT refresh endpoint`
- `fix(game): 🐛 fix vote counting in undercover`
- `refactor(models): ♻️ migrate to async database`

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@test.com | admin123 |
| User | user@test.com | user1234 |
| Player | player@test.com | player123 |
