# 🔐 Secure File Access Monitor & Anomaly Detector

[![Watch the Demo](https://img.shields.io/badge/▶%20Watch%20Demo-YouTube-red?style=for-the-badge)](https://youtu.be/ql-e-m7gSyI)

## 📌 Executive Summary
A **production-grade, full-stack SaaS security platform prototype** designed to **detect suspicious file activity in real-time**.  
Inspired by **Obsidian Security’s anomaly detection models**, it combines **scalable event streaming, secure APIs, and cloud-native architecture** in a Dockerized microservices stack.

This project demonstrates **end-to-end ownership** — from system architecture design → backend engineering → real-time frontend → DevOps deployment.

---

## 🎯 Key Features
| Capability | Description | Skills Demonstrated |
|------------|-------------|----------------------|
| **Real-Time Activity Feed** | Monitors file uploads/downloads live via WebSockets | Event-driven architecture, React state management |
| **Anomaly Detection Engine** | Burst-download & abnormal activity rules in worker service | Python async processing, Redis Streams |
| **Secure Authentication** | JWT-based login and role-based access | API security, RBAC |
| **Immutable Audit Logging** | For forensic investigations | PostgreSQL, schema design |
| **Cloud-Ready Deployment** | Containerized for AWS/GCP/Azure | Docker, DevOps |

---

## 🛠 Tech Stack
**Frontend:** React (Vite), Tailwind CSS, WebSockets  
**Backend:** FastAPI (Python), PostgreSQL, SQLAlchemy, JWT Auth  
**Streaming & Processing:** Redis Streams, Python Worker Service  
**DevOps:** Docker & Docker Compose, `.env`-based config

---

## 🗂 Architecture
```
[ React Dashboard ]
        ⬆  WebSocket + REST API
[ FastAPI Backend ]  <───>  [ PostgreSQL DB ]
        ⬆
   Redis Streams
        ⬆
[ Worker Service ]
        ⬆
[ Seeder / Event Producers ]
```

---

## 📦 Project Structure
```
secure-file-monitor/
│ .env
│ docker-compose.yml
├─ backend/       # API, WebSocket, DB models
├─ worker/        # Anomaly detection logic
├─ frontend/      # React dashboard
└─ seeder/        # Simulated file event generator
```

---

## 🚀 Quick Start

### 1️⃣ Prerequisites
- Docker & Docker Compose installed
- Free ports: `5173` (frontend), `8000` (backend), `5432` (Postgres), `6379` (Redis)

### 2️⃣ Clone & Configure
```bash
git clone https://github.com/YOUR_USERNAME/secure-file-monitor.git
cd secure-file-monitor
```
Create `.env`:
```env
PGHOST=db
PGPORT=5432
PGUSER=app
PGPASSWORD=app
PGDATABASE=sfm
REDIS_URL=redis://redis:6379/0
JWT_SECRET=super-secret-change-me
JWT_EXPIRES=3600
BACKEND_URL=http://backend:8000
```

### 3️⃣ Build & Run
```bash
docker compose build
docker compose up
```

---

## 🔍 How It Works
1. **Seeder** simulates SaaS file access events into Redis Streams  
2. **Worker** applies anomaly rules (burst download, unusual data volume)  
3. **Backend** logs all events in PostgreSQL & pushes alerts via WebSockets  
4. **Frontend** visualizes the activity feed + real-time alerts

---

## 📈 Example Anomaly Rule
```python
if download_count > 10 or total_bytes > 50 * 1024 * 1024:
    alert = {"message": "Burst download detected", "user": actor_email}
    backend.notify_alert(alert)
```

---

## 📊 Skills Mapped to FAANG Roles
- **Security Engineering:** JWT, RBAC, audit logging
- **Full-Stack Development:** React + FastAPI + Postgres
- **Distributed Systems:** Event-driven architecture with Redis Streams
- **DevOps Proficiency:** Dockerized microservices, `.env` configs, multi-service orchestration
- **Cloud Deployment Readiness:** AWS ECS/Fargate, GCP Cloud Run, Kubernetes

---

## 🌍 Deployment Options
- **AWS ECS/Fargate** with RDS + ElastiCache
- **Render / Fly.io** for quick PaaS hosting
- **Kubernetes** with Helm charts

---

## 👤 Author
**Aryan Lodha**  
[LinkedIn](https://www.linkedin.com/in/aryan-lodha-31b6361b8/) | [GitHub](https://github.com/ary0912) | [Portfolio](https://aryan0912portfolio.framer.website) | [Demo Video](https://youtu.be/ql-e-m7gSyI)
