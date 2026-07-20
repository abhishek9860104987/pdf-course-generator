import sqlite3

conn = sqlite3.connect('courseai.db')
cursor = conn.cursor()

# Get all tables
cursor.execute('SELECT name FROM sqlite_master WHERE type="table"')
tables = cursor.fetchall()

print("=== Database Tables ===")
for table in tables:
    print(f"- {table[0]}")

print("\n=== Users Table ===")
cursor.execute('SELECT id, email, name, created_at FROM users')
users = cursor.fetchall()
for user in users:
    print(f"ID: {user[0]}, Email: {user[1]}, Name: {user[2]}, Created: {user[3]}")

print("\n=== PDFs Table ===")
cursor.execute('SELECT id, user_id, filename, status FROM pdfs')
pdfs = cursor.fetchall()
for pdf in pdfs:
    print(f"ID: {pdf[0]}, User ID: {pdf[1]}, File: {pdf[2]}, Status: {pdf[3]}")

print("\n=== Courses Table ===")
cursor.execute('SELECT id, user_id, title, difficulty FROM courses')
courses = cursor.fetchall()
for course in courses:
    print(f"ID: {course[0]}, User ID: {course[1]}, Title: {course[2]}, Difficulty: {course[3]}")

conn.close()
