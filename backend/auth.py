import os, datetime
from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from passlib.hash import bcrypt
from sqlalchemy.orm import Session
from db import SessionLocal
from models import User

SECRET=os.getenv("JWT_SECRET","dev")
EXPIRES=int(os.getenv("JWT_EXPIRES","3600"))
ALGO="HS256"

def get_db():
    db=SessionLocal()
    try: yield db
    finally: db.close()

def create_user(db:Session, email:str, password:str):
    exists = db.query(User).filter_by(email=email).first()
    if exists: raise HTTPException(400,"User exists")
    u=User(email=email, password_hash=bcrypt.hash(password))
    db.add(u); db.commit()
    return {"ok":True}

def login(db:Session, email:str, password:str):
    u=db.query(User).filter_by(email=email).first()
    if not u or not bcrypt.verify(password,u.password_hash):
        raise HTTPException(401,"Invalid credentials")
    payload={"sub":u.email,"exp":datetime.datetime.utcnow()+datetime.timedelta(seconds=EXPIRES)}
    token=jwt.encode(payload,SECRET,algorithm=ALGO)
    return {"access_token":token,"token_type":"bearer"}

def require_user(token:str)->str:
    try:
        payload=jwt.decode(token,SECRET,algorithms=[ALGO])
        return payload["sub"]
    except Exception:
        raise HTTPException(401,"Invalid token")
