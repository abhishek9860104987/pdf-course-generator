from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from app.utils.security import get_password_hash, verify_password
from typing import Optional


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_user(self, user_data: UserCreate) -> User:
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            email=user_data.email,
            name=user_data.name,
            hashed_password=hashed_password,
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def get_user_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_user_by_google_id(self, google_id: str) -> Optional[User]:
        return self.db.query(User).filter(User.google_id == google_id).first()

    def get_user_by_github_id(self, github_id: str) -> Optional[User]:
        return self.db.query(User).filter(User.github_id == github_id).first()

    def create_google_user(self, email: str, name: str, google_id: str) -> User:
        db_user = User(
            email=email,
            name=name,
            google_id=google_id,
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def create_github_user(self, email: str, name: str, github_id: str) -> User:
        db_user = User(
            email=email,
            name=name,
            github_id=github_id,
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def authenticate_user(self, email: str, password: str):
        print("===== AUTHENTICATE USER =====")

        user = self.get_user_by_email(email)

        print("User found:", user is not None)

        if user:
            print("Stored hash:", user.hashed_password)
            print("Entered password:", password)

            result = verify_password(password, user.hashed_password or "")
            print("Password verified:", result)

            if result:
                return user

        return None

    def update_user(self, user_id: str, **kwargs) -> Optional[User]:
        user = self.get_user_by_id(user_id)
        if user:
            for key, value in kwargs.items():
                setattr(user, key, value)
            self.db.commit()
            self.db.refresh(user)
        return user
