import os, json, redis
r = redis.Redis.from_url(os.getenv("REDIS_URL","redis://redis:6379/0"))

def push_event(e: dict):
    # Redis Streams requires flat strings
    fields = {k: (json.dumps(v) if isinstance(v,(dict,list)) else str(v)) for k,v in e.items()}
    r.xadd("file_events", fields)
