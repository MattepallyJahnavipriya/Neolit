import sqlite3
from pathlib import Path


database_path = Path(__file__).resolve().parent / "neolit_v2.db"
with sqlite3.connect(database_path) as connection:
    users = connection.execute(
        "SELECT id, first_name, last_name, email FROM users ORDER BY id"
    ).fetchall()

print(f"Database: {database_path}")
print(f"Users: {len(users)}")
for user_id, first_name, last_name, email in users:
    full_name = f"{first_name} {last_name}".strip()
    print(f"{user_id}: {full_name} | {email}")
