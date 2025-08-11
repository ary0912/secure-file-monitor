import os, json, time
from datetime import datetime, timedelta
from collections import deque

import redis, requests, psycopg2
from psycopg2.extras import Json

# env
REDIS_URL=os.getenv("REDIS_URL","redis://redis:6379/0")
PGHOST=os.getenv("PGHOST","db")
PGPORT=os.getenv("PGPORT","5432")
PGUSER=os.getenv("PGUSER","app")
PGPASSWORD=os.getenv("PGPASSWORD","app")
PGDATABASE=os.getenv("PGDATABASE","sfm")
BACKEND=os.getenv("BACKEND_URL","http://backend:8000")

# connect
r = redis.Redis.from_url(REDIS_URL)
pg = psycopg2.connect(host=PGHOST, port=PGPORT, user=PGUSER, password=PGPASSWORD, dbname=PGDATABASE)
pg.autocommit=True

# state
last_id = "0-0"
windows = {}  # actor_email -> deque[(ts, bytes)]

# rule params
T = 5 * 60             # 5 minutes
N = 10                 # >=10 downloads in window
S = 50 * 1024 * 1024   # or >=50MB total in window

def create_alert(actor, rule, severity, context):
    with pg.cursor() as cur:
        cur.execute("""
          INSERT INTO alerts(actor_email, rule, severity, context, created_at)
          VALUES (%s,%s,%s,%s, NOW())
          RETURNING id
        """, (actor, rule, severity, Json(context)))
        alert_id = cur.fetchone()[0]
    # tell backend to push WS
    try:
        requests.post(f"{BACKEND}/internal/broadcast", json={
            "type": "ALERT_CREATED",
            "payload": {"id": alert_id, "actor_email": actor, "rule": rule, "severity": severity, "context": context}
        }, timeout=2)
    except Exception:
        pass

def handle_download(actor, size):
    now = datetime.utcnow()
    dq = windows.setdefault(actor, deque())
    dq.append((now, size))
    cutoff = now - timedelta(seconds=T)
    while dq and dq[0][0] < cutoff:
        dq.popleft()
    count = len(dq)
    total = sum(sz for _, sz in dq)
    if count >= N or total >= S:
        create_alert(actor, "burst_download", "high", {"count": count, "total_bytes": total})

def parse(fields):
    # Redis returns strings
    return {k.decode(): v.decode() for k,v in fields.items()}

def run():
    global last_id
    while True:
        resp = r.xread({"file_events": last_id}, count=100, block=5000)
        if not resp:
            continue
        _, messages = resp[0]
        for (msg_id, fields) in messages:
            last_id = msg_id.decode()
            e = parse(fields)
            actor = e.get("actor_email","unknown")
            action = e.get("action","")
            size = int(e.get("bytes","0"))
            if action == "download":
                handle_download(actor, size)

if __name__ == "__main__":
    # ensure alerts table exists (safety if backend started first)
    with pg.cursor() as cur:
        cur.execute("""
        CREATE TABLE IF NOT EXISTS alerts(
          id SERIAL PRIMARY KEY,
          actor_email TEXT,
          rule TEXT,
          severity TEXT,
          context JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          resolved_at TIMESTAMPTZ
        );
        """)
    run()
