# AICTE CaseTrack
**Integrated Institution Complaint Monitoring and Status Dashboard**

A full-stack web application for AICTE that provides a unified complaint registry across the Regulation Bureau (RB), Public Grievance Redressal Cell (PGRC), and Regional Offices — with cross-bureau overlap detection, real-time dashboards, and role-based access control.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Tailwind CSS + Vite |
| Backend | Python FastAPI + SQLAlchemy 2 + Alembic |
| Database | PostgreSQL 15 |
| Auth | JWT (HS256) + bcrypt |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| State | TanStack Query v5 |

---

## Quick Start (Docker Compose)

```bash
# 1. Clone and enter repo
cd "AICTE "

# 2. Copy backend env
cp backend/.env.example backend/.env

# 3. Start all services (PostgreSQL + Backend + Frontend)
docker-compose up --build

# 4. The backend auto-runs migrations and seeds 200 complaints + overlaps on first start

# Access:
#   Frontend:  http://localhost:5173
#   Backend API: http://localhost:8000
#   API Docs:  http://localhost:8000/docs
```

---

## Local Development (without Docker)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set up PostgreSQL and create .env
cp .env.example .env
# Edit .env with your DATABASE_URL

# Run migrations
alembic upgrade head

# Seed demo data
python -m app.seed.seed

# Start server
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

---

## Demo Credentials

| Role | Username | Password |
|---|---|---|
| Administrator | `admin` | `Admin@123` |
| RB Officer | `rb_officer1` | `RBOfficer@123` |
| RB Officer | `rb_officer2` | `RBOfficer@123` |
| PGRC Officer | `pgrc_officer1` | `PGRCOfficer@123` |
| PGRC Officer | `pgrc_officer2` | `PGRCOfficer@123` |
| Regional Officer (North) | `regional_north` | `Regional@123` |
| Regional Officer (South) | `regional_south` | `Regional@123` |
| Senior Management | `senior_mgmt` | `Director@123` |

---

## Key Features

- **Centralized Complaint Registry** — unique Case IDs (`AICTE-YYYY-BUREAU-NNNNNN`), full lifecycle tracking
- **Cross-Bureau Overlap Detection** — exact AICTE ID match + normalized name match; alerts surfaced as "Potential Overlapping Cases — Coordination Required"
- **Human-Only Decisions** — system never auto-closes or merges cases based on AI/overlap detection
- **Dashboard** — summary cards, status/bureau/region/ageing/trend charts, recent activity feed
- **Role-Based Access** — Admin, RB Officer, PGRC Officer, Regional Officer, Senior Management with enforced bureau/region scoping
- **Audit Trail** — every mutating request logged to `audit_log` table
- **Overdue Alerts** — cases past expected disposal date auto-flagged
- **Reports & CSV Export** — institution, region, bureau, ageing, disposal rate

---

## Project Structure

```
AICTE /
├── backend/
│   ├── app/
│   │   ├── api/v1/         # FastAPI route handlers
│   │   ├── core/           # Config, security, deps, audit middleware
│   │   ├── db/             # Session, base
│   │   ├── models/         # SQLAlchemy ORM models
│   │   ├── schemas/        # Pydantic v2 schemas
│   │   ├── services/       # Business logic (overlap detection, case IDs, overdue)
│   │   └── seed/           # Synthetic demo data
│   ├── alembic/            # DB migrations
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── api/            # Axios API clients
│       ├── components/     # Shared UI (badges, pagination, alerts)
│       ├── features/       # Feature-sliced pages
│       │   ├── auth/       # Login, AuthContext
│       │   ├── dashboard/  # Dashboard page + charts
│       │   ├── complaints/ # List, Detail, New complaint pages
│       │   ├── institutions/ # Institution list + profile
│       │   ├── overlaps/   # Overlaps Center
│       │   ├── reports/    # Reports tabs
│       │   └── admin/      # User management, audit log
│       ├── layouts/        # AppLayout, ProtectedRoute
│       ├── types/          # TypeScript interfaces
│       └── utils/          # Formatters, color helpers
└── docker-compose.yml
```

---

## Overlap Detection Logic

1. **Exact AICTE ID match** — any open complaints for the same `institution_id` → definite overlap (confidence 1.0)
2. **Normalized name match** — pg_trgm similarity ≥ 0.85 on `name_normalized` → probable overlap
3. **Keyword Jaccard** — token-overlap on complaint descriptions → informational score only

All detected overlaps are stored in `case_overlaps` and surfaced as amber alerts. Officers must manually acknowledge. **No automatic case closure.**

---

## Important Notes

- This application uses **synthetic demonstration data only**. No real AICTE data is included.
- Change `SECRET_KEY` in `.env` before any non-local deployment.
- The `POST /api/v1/admin/seed` endpoint is disabled in `ENVIRONMENT=production`.
