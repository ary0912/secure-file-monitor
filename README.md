# 🔐 Secure File Access Monitor & Anomaly Detector

## 📌 Overview
The **Secure File Access Monitor & Anomaly Detector** is a full-stack SaaS-style security application that monitors file access events in real time, detects suspicious behavior, and generates alerts before potential data exfiltration.

It simulates what **enterprise SaaS security platforms** (like Obsidian Security) do:
- **Real-time monitoring of user activity**
- **Event-based anomaly detection**
- **Cloud-native, scalable architecture**
- **Security-first design principles**

This project is **containerized with Docker** for easy deployment and runs with a single command.

---

## 🎯 Features
- 📡 **Real-time Activity Feed** — See file uploads/downloads as they happen.
- 🔍 **Anomaly Detection** — Flags suspicious patterns like burst downloads.
- 🔐 **Secure Authentication** — JWT-based login system.
- 📜 **Audit Logging** — Immutable logs for forensic investigations.
- ⚡ **Distributed Event Streaming** — Redis Streams for ingesting events.
- 📢 **WebSocket Alerts** — Instant push notifications to the dashboard.
- ☁ **Cloud-Ready Deployment** — Easily deployable to AWS, GCP, Azure.

---

## 🛠 Tech Stack

**Frontend**
- React (Vite)
- TailwindCSS
- WebSockets

**Backend**
- FastAPI (Python)
- PostgreSQL
- SQLAlchemy
- JWT Authentication

**Event Processing**
- Redis Streams
- Python Worker Service

**DevOps**
- Docker & Docker Compose
- Environment Variables for config

---

## 🗂 Architecture
```plaintext
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
## 📦 Project Structure
```plaintext
secure-file-monitor/
│ .env
│ docker-compose.yml
├─ backend/
│  ├─ Dockerfile
│  ├─ requirements.txt
│  └─ app/
│     ├─ main.py         # API & WebSocket logic
│     ├─ models.py       # SQLAlchemy models (User, Event, Alert)
│     ├─ schemas.py      # Pydantic schemas for validation
│     ├─ auth.py         # JWT authentication helpers
│     ├─ db.py           # Postgres connection & session
│     └─ stream.py       # Redis Streams event producer
├─ worker/
│  ├─ Dockerfile
│  └─ worker.py          # Event consumer & anomaly detection logic
├─ frontend/
│  ├─ Dockerfile
│  ├─ index.html
│  └─ src/
│     ├─ main.jsx        # React entrypoint
│     ├─ App.jsx         # Dashboard UI
│     └─ api.js          # API & WebSocket helpers
└─ seeder/
   ├─ Dockerfile
   └─ seed.py            # Simulates file access events
```
## 🚀 Getting Started

### 1️⃣ Prerequisites
- **Docker** & **Docker Compose** installed
- Free ports: `5173` (frontend), `8000` (backend), `5432` (Postgres), `6379` (Redis)

### 2️⃣ Clone & Enter
```bash
git clone https://github.com/YOUR_USERNAME/secure-file-monitor.git
cd secure-file-monitor
```
### 3️⃣ Configure Environment
Create a `.env` file in the project root with the following values:

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
### 4️⃣ Build & Run
To build and run the entire stack with Docker:

```bash
docker compose build
docker compose up
```
This will:

- Spin up PostgreSQL, Redis, Backend, Frontend, Worker, and Seeder services.
- Automatically apply migrations and seed initial admin credentials.

### 5️⃣ Access the App
Once running:

- **Frontend Dashboard:** http://localhost:5173  
- **API Docs (Swagger UI):** http://localhost:8000/docs  

Default login credentials:
Email: admin@corp.com
Password: adminpass


---

## 🧠 How It Works
1. **Seeder Service** generates file access events and sends them to **Redis Streams**.
2. **Worker Service** consumes the streams and applies **security anomaly detection rules**.
3. **Backend API** stores all events in **PostgreSQL** and broadcasts **real-time alerts** to connected clients via **WebSockets**.
4. **React Frontend** displays a live activity feed and alert notifications.

---

## 🔍 Example API Payload
A typical file access event looks like:

```json
{
  "actor_email": "alex@corp.com",
  "action": "download",
  "resource": "s3://dept/finance/report.pdf",
  "bytes": 1500000,
  "ip": "91.201.10.8",
  "ua": "Mozilla/5.0"
}
```
## ⚙️ Key Code Snippets

**Backend WebSocket Broadcasting**
```python
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connections.append(websocket)
    try:
        while True:
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        connections.remove(websocket)

async def broadcast_alert(alert):
    for ws in connections:
        await ws.send_json(alert)
```
**Worker Anomaly Rule**
```python
if download_count > 10 or total_bytes > 50 * 1024 * 1024:
    alert = {"message": "Burst download detected", "user": actor_email}
    backend.notify_alert(alert)
```
## 📈 Skills Demonstrated
- **Security Engineering**: JWT authentication, RBAC, audit logging
- **Full-Stack Development**: React + FastAPI + PostgreSQL
- **Distributed Systems**: Redis Streams for event-driven architecture
- **DevOps**: Dockerized microservices, service orchestration

---

## ☁ Deployment Options
- AWS ECS/Fargate
- Render
- Fly.io
- Kubernetes (with Postgres & Redis as managed services)

---
## 👤 Author
**Aryan Lodha**  
[LinkedIn](https://www.linkedin.com/in/aryan-lodha-31b6361b8/) | [GitHub](https://github.com/ary0912) | [Portfolio](https://aryan0912portfolio.framer.website)

