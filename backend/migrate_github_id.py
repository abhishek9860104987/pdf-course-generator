"""
Migration script: Add github_id column to users table.
Run once to fix the UndefinedColumn error.
"""
import psycopg2

DB_URL = "postgresql://postgres.lbpxkgdduxwjhzfbhnqs:9fArFedVsn*5AeQ@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"

conn = psycopg2.connect(DB_URL)
conn.autocommit = True
cur = conn.cursor()

# Check existing columns
cur.execute(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'users'"
)
cols = [row[0] for row in cur.fetchall()]
print("Existing columns:", cols)

if "github_id" not in cols:
    cur.execute("ALTER TABLE users ADD COLUMN github_id VARCHAR")
    print("SUCCESS: github_id column added to users table")
else:
    print("ALREADY EXISTS: github_id column is already present, no action needed")

cur.close()
conn.close()
print("Done.")
