# 🚦 SmartFlow AI

### Autonomous Multi-Agent Traffic Intelligence System

> **Predict → Recommend → Prevent**
>
> SmartFlow AI proactively prevents traffic breakdowns caused by planned and unplanned events by analyzing traffic conditions, event metadata, and historical patterns through a coordinated multi-agent architecture.

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution Overview](#-solution-overview)
- [System Architecture](#-system-architecture)
- [Agent Pipeline](#-agent-pipeline)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Data Models](#-data-models)
- [Running the System](#-running-the-system)
- [Testing](#-testing)
- [Roadmap](#-roadmap)
- [Team](#-team)

---

## 🎯 Problem Statement

Traffic congestion caused by events — sports matches, festivals, political rallies, construction — is **predictable but poorly managed**. Current traffic systems are reactive: they respond to congestion after it forms rather than preventing it.

SmartFlow AI shifts the paradigm from **reactive enforcement** to **proactive prevention** by forecasting event-driven congestion and providing actionable, prioritized recommendations for traffic authorities *before* the first vehicle hits the road.

---

## 💡 Solution Overview

SmartFlow AI is a **multi-agent orchestration system** where six specialized AI agents collaborate in a pipeline:

| # | Agent | Role |
|---|-------|------|
| 1 | **Event Intelligence** | Analyzes event metadata, estimates crowd, assigns risk level |
| 2 | **Traffic Perception** | Processes CCTV/video feeds using YOLOv8 for real-time vehicle detection |
| 3 | **Congestion Prediction** | Forecasts congestion severity, timelines, and impacted corridors |
| 4 | **Resource Planning** | Recommends officer deployment, barricade placement, patrol priorities |
| 5 | **Diversion Strategy** | Suggests alternative routes, restricted zones, and public advisories |
| 6 | **Decision Synthesis** | Aggregates all outputs into a final actionable traffic management plan |

### Key Features

- 🔍 **Real-time vehicle detection** via YOLOv8 on uploaded videos or live CCTV streams
- 🧠 **LLM-powered reasoning** (Gemini / OpenAI, configurable) for natural-language decision synthesis
- 🗺️ **Route optimization** via Mapbox Directions API with real traffic data
- 📊 **Confidence-scored predictions** with explainable reasoning
- ⚡ **Sub-minute pipeline execution** for rapid response
- 📡 **Dual input modes**: Video file upload (S3/Cloudinary) + live RTSP stream processing

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SmartFlow AI System                         │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │              Node.js Backend (Express.js)                   │    │
│  │                                                             │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │    │
│  │  │   Event       │  │  Congestion  │  │   Resource      │  │    │
│  │  │   Intelligence│──│  Prediction  │──│   Planning      │  │    │
│  │  │   Agent       │  │  Agent       │  │   Agent         │  │    │
│  │  └──────────────┘  └──────────────┘  └─────────────────┘  │    │
│  │         │                  │                  │             │    │
│  │         ▼                  ▼                  ▼             │    │
│  │  ┌──────────────────────────────────────────────────────┐  │    │
│  │  │           Decision Synthesis Agent (LLM)             │  │    │
│  │  │          Gemini API  /  OpenAI GPT API               │  │    │
│  │  └──────────────────────────────────────────────────────┘  │    │
│  │         │                                                   │    │
│  │         ▼                                                   │    │
│  │  ┌──────────────┐       ┌──────────────────┐              │    │
│  │  │  Diversion   │       │    REST API       │              │    │
│  │  │  Strategy    │───────│  /api/v1/*        │              │    │
│  │  │  Agent       │       └──────────────────┘              │    │
│  │  └──────────────┘                                         │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                          │                                          │
│                          │ HTTP (internal)                          │
│                          ▼                                          │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │          Python Microservice (FastAPI)                       │    │
│  │                                                             │    │
│  │  ┌──────────────────────────────────────────────────────┐  │    │
│  │  │          Traffic Perception Agent                     │  │    │
│  │  │   YOLOv8  ·  OpenCV  ·  DeepSORT Tracker            │  │    │
│  │  │   Vehicle Count · Density · Queue · Speed            │  │    │
│  │  └──────────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐    │
│  │  PostgreSQL   │  │  Cloudinary/ │  │  Mapbox Directions    │    │
│  │  (Prisma ORM) │  │  AWS S3      │  │  API                  │    │
│  └──────────────┘  └──────────────┘  └────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

### Inter-Service Communication

| From | To | Method |
|------|----|--------|
| Express.js ↔ FastAPI | HTTP REST | Video processing requests + results |
| Agents (within Express) | Direct function calls | Monolithic pipeline for hackathon speed |
| Express.js → Cloudinary/S3 | SDK | Video file upload/retrieval |
| Express.js → Mapbox | HTTP REST | Route & traffic data |
| Express.js → Gemini/OpenAI | HTTP REST | LLM reasoning |
| Express.js ↔ PostgreSQL | Prisma ORM | Data persistence |

---

## 🤖 Agent Pipeline

```
                    ┌─────────────────┐
    User Input ────▶│  Event          │
    (event data)    │  Intelligence   │──────────────┐
                    └─────────────────┘              │
                                                      ▼
                    ┌─────────────────┐    ┌─────────────────────┐
    Video Feed ────▶│  Traffic        │───▶│  Congestion         │
    (CCTV/upload)   │  Perception     │    │  Prediction         │
                    └─────────────────┘    └─────────────────────┘
                           (FastAPI)                  │
                                                      ▼
                                           ┌─────────────────────┐
                                           │  Resource Planning   │
                                           └─────────────────────┘
                                                      │
                                                      ▼
                                           ┌─────────────────────┐
                                           │  Diversion Strategy  │
                                           └─────────────────────┘
                                                      │
                                                      ▼
                                           ┌─────────────────────┐
                                           │  Decision Synthesis  │
                                           │  (LLM-powered)       │
                                           └─────────────────────┘
                                                      │
                                                      ▼
                                             📋 FINAL REPORT
```

### Pipeline Data Flow

1. **Event Intelligence Agent** receives event metadata → outputs `event_risk_level`, `arrival_window`, `departure_window`
2. **Traffic Perception Agent** processes video feed → outputs vehicle counts, density, queue length, average speed
3. **Congestion Prediction Agent** fuses (1) + (2) → outputs severity, peak times, impacted corridors
4. **Resource Planning Agent** uses (3) → outputs officer/barricade requirements, deployment zones
5. **Diversion Strategy Agent** uses (3) + Mapbox data → outputs alternative routes, restricted zones, advisories
6. **Decision Synthesis Agent** aggregates (1)–(5) via LLM → produces the final actionable report

---

## 🛠 Tech Stack

### Backend Core (Node.js)
| Technology | Purpose |
|-----------|---------|
| **Express.js** | REST API framework |
| **Prisma** | ORM for PostgreSQL |
| **PostgreSQL** | Primary database |
| **TypeScript** | Type safety |
| **Zod** | Runtime schema validation |
| **Winston** | Structured logging |
| **Multer** | File upload handling |
| **node-cron** | Scheduled pipeline runs |

### Computer Vision Microservice (Python)
| Technology | Purpose |
|-----------|---------|
| **FastAPI** | HTTP API for CV pipeline |
| **YOLOv8 (Ultralytics)** | Vehicle detection & classification |
| **OpenCV** | Video frame processing |
| **DeepSORT** | Multi-object tracking |
| **NumPy** | Numerical computations |
| **Uvicorn** | ASGI server |

### External Services
| Service | Purpose |
|---------|---------|
| **Mapbox Directions API** | Route optimization & traffic data |
| **Google Gemini API** | LLM reasoning (primary) |
| **OpenAI GPT API** | LLM reasoning (fallback) |
| **Cloudinary / AWS S3** | Video file storage |

### DevOps & Quality
| Tool | Purpose |
|------|---------|
| **Docker + Docker Compose** | Containerized deployment |
| **Jest** | Unit & integration testing |
| **Pytest** | Python service testing |
| **ESLint + Prettier** | Code formatting |
| **Husky** | Git hooks |

---

## 📁 Project Structure

```
smartflow-ai/
├── README.md
├── docker-compose.yml
├── .env.example
├── .gitignore
│
├── backend/                          # Node.js Express backend
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   │
│   ├── prisma/
│   │   ├── schema.prisma             # Database schema
│   │   └── seed.ts                   # Seed data (sample events)
│   │
│   ├── src/
│   │   ├── index.ts                  # Express app entrypoint
│   │   ├── config/
│   │   │   ├── env.ts                # Environment variable validation
│   │   │   ├── database.ts           # Prisma client singleton
│   │   │   └── logger.ts             # Winston logger setup
│   │   │
│   │   ├── routes/
│   │   │   ├── index.ts              # Route aggregator
│   │   │   ├── event.routes.ts       # /api/v1/events
│   │   │   ├── analysis.routes.ts    # /api/v1/analysis (trigger pipeline)
│   │   │   ├── traffic.routes.ts     # /api/v1/traffic (perception data)
│   │   │   └── report.routes.ts      # /api/v1/reports (generated reports)
│   │   │
│   │   ├── controllers/
│   │   │   ├── event.controller.ts
│   │   │   ├── analysis.controller.ts
│   │   │   ├── traffic.controller.ts
│   │   │   └── report.controller.ts
│   │   │
│   │   ├── services/
│   │   │   └── pipeline.service.ts   # Orchestrates the full agent pipeline
│   │   │
│   │   ├── agents/
│   │   │   ├── index.ts              # Agent registry & types
│   │   │   ├── event-intelligence.agent.ts
│   │   │   ├── traffic-perception.agent.ts   # Calls FastAPI service
│   │   │   ├── congestion-prediction.agent.ts
│   │   │   ├── resource-planning.agent.ts
│   │   │   ├── diversion-strategy.agent.ts
│   │   │   └── decision-synthesis.agent.ts   # LLM integration
│   │   │
│   │   ├── providers/
│   │   │   ├── llm/
│   │   │   │   ├── llm.provider.ts          # Abstract LLM interface
│   │   │   │   ├── gemini.provider.ts       # Google Gemini implementation
│   │   │   │   └── openai.provider.ts       # OpenAI GPT implementation
│   │   │   ├── mapbox.provider.ts           # Mapbox Directions API
│   │   │   └── storage.provider.ts          # Cloudinary/S3 upload
│   │   │
│   │   ├── schemas/
│   │   │   ├── event.schema.ts       # Zod schemas for events
│   │   │   ├── traffic.schema.ts     # Zod schemas for traffic data
│   │   │   └── report.schema.ts      # Zod schemas for reports
│   │   │
│   │   ├── utils/
│   │   │   ├── heuristics.ts         # Congestion prediction rules
│   │   │   ├── risk-calculator.ts    # Event risk scoring
│   │   │   └── response.ts           # Standardized API responses
│   │   │
│   │   └── middleware/
│   │       ├── error-handler.ts      # Global error handling
│   │       ├── rate-limiter.ts       # API rate limiting
│   │       └── validator.ts          # Zod validation middleware
│   │
│   └── tests/
│       ├── agents/
│       ├── services/
│       └── routes/
│
├── cv-service/                       # Python FastAPI microservice
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── main.py                       # FastAPI entrypoint
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py                 # Settings & env vars
│   │   │
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── detect.py             # /detect (single frame)
│   │   │   ├── analyze_video.py      # /analyze-video (full video)
│   │   │   └── stream.py             # /stream (live RTSP)
│   │   │
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── detector.py           # YOLOv8 vehicle detector
│   │   │   ├── tracker.py            # DeepSORT multi-object tracker
│   │   │   ├── density.py            # Traffic density estimator
│   │   │   ├── speed.py              # Average speed estimator
│   │   │   └── queue.py              # Queue length calculator
│   │   │
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── schemas.py            # Pydantic request/response models
│   │   │
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── video.py              # Video frame extraction
│   │       └── visualization.py      # Debug visualization (bounding boxes)
│   │
│   ├── weights/
│   │   └── yolov8n.pt               # YOLOv8 nano model weights
│   │
│   └── tests/
│       └── test_detector.py
│
└── docs/
    ├── api-reference.md
    ├── agent-specs.md
    └── deployment.md
```

---

## 📦 Prerequisites

- **Node.js** ≥ 18.x
- **Python** ≥ 3.10
- **PostgreSQL** ≥ 14
- **Docker & Docker Compose** (recommended)
- **Git**

### API Keys Required

| Service | Key | Free Tier |
|---------|-----|-----------|
| Mapbox | `MAPBOX_ACCESS_TOKEN` | 100K requests/month |
| Google Gemini | `GEMINI_API_KEY` | 60 RPM free |
| OpenAI (optional) | `OPENAI_API_KEY` | Pay-as-you-go |
| Cloudinary | `CLOUDINARY_URL` | 25 credits/month |

---

## ⚙️ Installation & Setup

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-org/smartflow-ai.git
cd smartflow-ai

# Copy environment variables
cp .env.example .env
# Edit .env with your API keys

# Start everything
docker-compose up --build
```

### Option 2: Manual Setup

```bash
# 1. Backend (Node.js)
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev

# 2. CV Service (Python) — in a separate terminal
cd cv-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001

# 3. Database
# Ensure PostgreSQL is running on localhost:5432
```

---

## 🔐 Environment Variables

```env
# ── Database ──
DATABASE_URL="postgresql://user:password@localhost:5432/smartflow?schema=public"

# ── Server ──
PORT=3000
NODE_ENV=development
CV_SERVICE_URL=http://localhost:8001

# ── LLM Provider ──
LLM_PROVIDER=gemini          # "gemini" | "openai"
GEMINI_API_KEY=your_key
OPENAI_API_KEY=your_key       # optional fallback

# ── Mapbox ──
MAPBOX_ACCESS_TOKEN=your_token

# ── Storage ──
STORAGE_PROVIDER=cloudinary   # "cloudinary" | "s3"
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# ── CV Service ──
YOLO_MODEL_PATH=weights/yolov8n.pt
YOLO_CONFIDENCE_THRESHOLD=0.5
VIDEO_FRAME_SAMPLE_RATE=5     # Process every Nth frame
```

---

## 📡 API Reference

### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/events` | Create a new event |
| `GET` | `/api/v1/events` | List all events |
| `GET` | `/api/v1/events/:id` | Get event details |
| `PUT` | `/api/v1/events/:id` | Update event |
| `DELETE` | `/api/v1/events/:id` | Delete event |

### Analysis Pipeline

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/analysis/run` | Trigger full pipeline for an event |
| `GET` | `/api/v1/analysis/:id/status` | Check pipeline status |
| `GET` | `/api/v1/analysis/:id/result` | Get pipeline result |

### Traffic Perception

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/traffic/upload` | Upload video for analysis |
| `POST` | `/api/v1/traffic/stream` | Start live stream analysis |
| `GET` | `/api/v1/traffic/current` | Get latest traffic snapshot |

### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/reports` | List generated reports |
| `GET` | `/api/v1/reports/:id` | Get full report |
| `GET` | `/api/v1/reports/:id/pdf` | Download report as PDF |

### CV Service (Internal)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/detect` | Detect vehicles in single frame |
| `POST` | `/analyze-video` | Analyze complete video |
| `POST` | `/stream/start` | Start RTSP stream processing |
| `POST` | `/stream/stop` | Stop stream processing |
| `GET` | `/health` | Service health check |

---

## 📊 Data Models

### Core Prisma Schema

```prisma
model Event {
  id                String      @id @default(cuid())
  name              String
  venue             String
  eventType         EventType
  expectedCrowd     Int
  startTime         DateTime
  endTime           DateTime
  latitude          Float?
  longitude         Float?
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  analyses          Analysis[]
}

enum EventType {
  SPORTS
  FESTIVAL
  POLITICAL_RALLY
  CONCERT
  CONSTRUCTION
  PROTEST
  RELIGIOUS
  OTHER
}

model Analysis {
  id                    String          @id @default(cuid())
  eventId               String
  event                 Event           @relation(fields: [eventId], references: [id])
  status                AnalysisStatus  @default(PENDING)
  
  // Agent 1: Event Intelligence
  eventRiskLevel        RiskLevel?
  arrivalWindowStart    DateTime?
  arrivalWindowEnd      DateTime?
  departureWindowStart  DateTime?
  departureWindowEnd    DateTime?
  
  // Agent 2: Traffic Perception
  trafficSnapshot       Json?           // { cars, bikes, buses, trucks, density, queue, speed }
  videoUrl              String?
  
  // Agent 3: Congestion Prediction
  congestionSeverity    SeverityLevel?
  peakStartTime         DateTime?
  peakEndTime           DateTime?
  impactedCorridors     Json?           // string[]
  predictionConfidence  Float?
  
  // Agent 4: Resource Planning
  officersRequired      Int?
  barricadesRequired    Int?
  deploymentZones       Json?           // string[]
  patrolPriority        Json?           // { zone: string, priority: number }[]
  
  // Agent 5: Diversion Strategy
  diversionRoutes       Json?           // { from, to, via, estimatedTime }[]
  restrictedZones       Json?           // string[]
  advisoryMessages      Json?           // string[]
  
  // Agent 6: Decision Synthesis
  finalReport           Json?           // Full structured report
  confidenceScore       Float?
  explanation           String?         @db.Text
  
  createdAt             DateTime        @default(now())
  updatedAt             DateTime        @updatedAt
}

enum AnalysisStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
}

enum RiskLevel {
  LOW
  MODERATE
  HIGH
  CRITICAL
}

enum SeverityLevel {
  NONE
  MILD
  MODERATE
  SEVERE
  GRIDLOCK
}
```

---

## ▶️ Running the System

### Trigger a Full Analysis

```bash
# 1. Create an event
curl -X POST http://localhost:3000/api/v1/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "IPL Final 2026",
    "venue": "Narendra Modi Stadium, Ahmedabad",
    "eventType": "SPORTS",
    "expectedCrowd": 132000,
    "startTime": "2026-05-28T19:30:00+05:30",
    "endTime": "2026-05-28T23:30:00+05:30",
    "latitude": 23.0919,
    "longitude": 72.5967
  }'

# 2. Upload traffic video
curl -X POST http://localhost:3000/api/v1/traffic/upload \
  -F "video=@./sample-traffic.mp4"

# 3. Run the full analysis pipeline
curl -X POST http://localhost:3000/api/v1/analysis/run \
  -H "Content-Type: application/json" \
  -d '{ "eventId": "<event-id>", "videoUrl": "<uploaded-video-url>" }'

# 4. Get the final report
curl http://localhost:3000/api/v1/reports/<analysis-id>
```

### Sample Final Report Output

```json
{
  "eventSummary": {
    "name": "IPL Final 2026",
    "venue": "Narendra Modi Stadium",
    "riskLevel": "CRITICAL",
    "expectedCrowd": 132000
  },
  "currentTraffic": {
    "cars": 487,
    "bikes": 234,
    "buses": 45,
    "trucks": 12,
    "densityLevel": "HIGH",
    "queueLength": "1.2 km",
    "averageSpeed": "8 km/h"
  },
  "predictedCongestion": {
    "severity": "SEVERE",
    "peakStartTime": "2026-05-28T17:00:00+05:30",
    "peakEndTime": "2026-05-28T20:00:00+05:30",
    "impactedCorridors": [
      "SG Highway → Stadium Road",
      "Sarkhej-Gandhinagar Highway",
      "Kankaria Circle"
    ]
  },
  "officerDeployment": {
    "officersRequired": 85,
    "barricadesRequired": 42,
    "deploymentZones": ["Gate 1-4", "Parking Zone A-C", "SG Highway Junction"],
    "patrolPriority": [
      { "zone": "Main Entry Gate", "priority": 1 },
      { "zone": "SG Highway Junction", "priority": 2 }
    ]
  },
  "diversions": {
    "routes": [
      {
        "from": "SG Highway",
        "to": "Stadium",
        "via": "SP Ring Road → Bopal Road",
        "estimatedTime": "35 min"
      }
    ],
    "restrictedZones": ["Stadium Road (2km radius)"],
    "advisoryMessages": [
      "Use metro from Motera Station for fastest access",
      "Avoid SG Highway between 5PM-8PM"
    ]
  },
  "confidenceScore": 0.87,
  "explanation": "High confidence prediction based on IPL 2025 final patterns..."
}
```

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test                    # Unit tests
npm run test:integration    # Integration tests

# CV Service tests
cd cv-service
pytest                      # All tests
pytest --cov=app            # With coverage
```

---

## 🗺 Roadmap

- [x] System architecture design
- [ ] **Phase 1**: Backend core (Express, Prisma, PostgreSQL)
- [ ] **Phase 2**: CV microservice (FastAPI, YOLOv8)
- [ ] **Phase 3**: Agent pipeline implementation
- [ ] **Phase 4**: LLM integration (Gemini + OpenAI)
- [ ] **Phase 5**: Mapbox route optimization
- [ ] **Phase 6**: Frontend dashboard
- [ ] **Phase 7**: Docker deployment

---

## 👥 Team

*Flipkart Grid 7.0 — Smart Traffic Intelligence*

---

## 📄 License

This project is built for the **Flipkart Grid 7.0** hackathon.

---

<p align="center">
  <b>SmartFlow AI</b> — Intelligent Traffic, Safer Cities 🏙️
</p>
