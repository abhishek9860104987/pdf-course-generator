"""
Initialize database with tables.
This script can be used to create all tables without using Alembic.
"""
from app.database.database import engine, Base
from app.models import *


def init_db():
    """Create all tables in the database."""
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")


if __name__ == "__main__":
    init_db()
