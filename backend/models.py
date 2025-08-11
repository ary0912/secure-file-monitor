from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, String, Text, BigInteger, DateTime, JSON
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True)
    actor_email = Column(String, index=True)
    action = Column(String, index=True)  # upload, download, share, delete, login_failed
    resource = Column(Text)
    bytes = Column(BigInteger)
    ip = Column(String)
    ua = Column(Text)
    occurred_at = Column(DateTime, default=datetime.utcnow, index=True)

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True)
    actor_email = Column(String, index=True)
    rule = Column(String, index=True)      # burst_download, etc.
    severity = Column(String, index=True)  # low, medium, high
    context = Column(JSON)                 # arbitrary JSON
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    resolved_at = Column(DateTime, nullable=True)
