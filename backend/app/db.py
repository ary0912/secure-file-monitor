import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

PGUSER=os.getenv("PGUSER","app")
PGPASSWORD=os.getenv("PGPASSWORD","app")
PGHOST=os.getenv("PGHOST","db")
PGPORT=os.getenv("PGPORT","5432")
PGDATABASE=os.getenv("PGDATABASE","sfm")

DATABASE_URL=f"postgresql://{PGUSER}:{PGPASSWORD}@{PGHOST}:{PGPORT}/{PGDATABASE}"
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
