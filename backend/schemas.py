from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Any

class RegisterIn(BaseModel):
    email: EmailStr
    password: str

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class EventIn(BaseModel):
    actor_email: EmailStr
    action: str = Field(pattern="^(upload|download|share|delete|login_failed)$")
    resource: str
    bytes: int = 0
    ip: Optional[str] = None
    ua: Optional[str] = None
