from app.auth import hash_password
from app.database import SessionLocal
from app.models import User


def create_admin():
    db = SessionLocal()

    existing_admin = db.query(User).filter(User.username == "admin").first()

    if existing_admin:
        print("Admin user already exists")
        db.close()
        return

    admin = User(
        username="admin",
        email="admin@example.com",
        hashed_password=hash_password("admin123"),
        role="admin",
    )

    db.add(admin)
    db.commit()
    db.close()

    print("Admin user created successfully")
    print("Username: admin")
    print("Password: admin123")


if __name__ == "__main__":
    create_admin()