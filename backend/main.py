import os
from fastapi import FastAPI, Depends, Header, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from db import engine, SessionLocal
from models import Base, Event, Alert
from auth import get_db, create_user, login, require_user
from schemas import RegisterIn, LoginIn, EventIn
from stream import push_event

app = FastAPI(title="Secure File Monitor")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "http://localhost:5174", 
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# init DB tables
Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "Secure File Monitor API", "status": "running"}

# simple WS manager
class WSManager:
    def __init__(self): self.active=set()
    async def connect(self, ws:WebSocket):
        await ws.accept(); self.active.add(ws)
    def disconnect(self, ws:WebSocket):
        self.active.discard(ws)
    async def broadcast(self, data:dict):
        dead=[]
        for ws in self.active:
            try: await ws.send_json(data)
            except WebSocketDisconnect: dead.append(ws)
        for ws in dead: self.disconnect(ws)

ws_manager = WSManager()

@app.websocket("/ws")
async def ws_endpoint(ws:WebSocket):
    await ws_manager.connect(ws)
    try:
        while True:
            await ws.receive_text()  # keep alive (client can ping)
    except WebSocketDisconnect:
        ws_manager.disconnect(ws)

@app.post("/auth/register")
def route_register(p: RegisterIn, db: Session = Depends(get_db)):
    return create_user(db, p.email, p.password)

@app.post("/auth/login")
def route_login(p: LoginIn, db: Session = Depends(get_db)):
    return login(db, p.email, p.password)

def current_user(authorization: str = Header(...)):
    # Expect "Bearer <token>"
    token = authorization.split("Bearer ")[-1]
    return require_user(token)

@app.post("/events/ingest")
def ingest(ev: EventIn, db: Session = Depends(get_db), user:str = Depends(current_user)):
    e = Event(**ev.model_dump())
    db.add(e); db.commit()
    push_event(ev.model_dump())
    return {"ok": True}

@app.get("/events")
def list_events(limit:int=100, db: Session = Depends(get_db), user:str = Depends(current_user)):
    rows = db.query(Event).order_by(Event.occurred_at.desc()).limit(limit).all()
    return rows

@app.get("/alerts")
def list_alerts(limit:int=100, db: Session = Depends(get_db), user:str = Depends(current_user)):
    rows = db.query(Alert).order_by(Alert.created_at.desc()).limit(limit).all()
    return rows

# endpoint used by worker to push WS when it creates alerts
@app.post("/internal/broadcast")
async def internal_broadcast(payload: dict):
    await ws_manager.broadcast(payload)
    return {"ok": True}
