from typing import Optional

from sqlalchemy.orm import Session
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserLogin, Token, UserResponse
from app.utils.security import create_access_token, create_refresh_token, verify_password, get_password_hash
from datetime import timedelta
from app.config.settings import settings


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)

    def register(self, user_data: UserCreate) -> Token:
        # Check if user already exists
        existing_user = self.user_repo.get_user_by_email(user_data.email)
        if existing_user:
            raise ValueError("Email already registered")

        # Create new user
        user = self.user_repo.create_user(user_data)

        # Generate tokens
        access_token = create_access_token(data={"sub": user.id})
        refresh_token = create_refresh_token(data={"sub": user.id})

        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserResponse.model_validate(user),
        )

    def login(self, login_data: UserLogin) -> Token:
        user = self.user_repo.authenticate_user(login_data.email, login_data.password)
        if not user:
            raise ValueError("Invalid email or password")

        access_token = create_access_token(data={"sub": user.id})
        refresh_token = create_refresh_token(data={"sub": user.id})

        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserResponse.model_validate(user),
        )

    def refresh_token(self, refresh_token: str) -> Token:
        from app.utils.security import decode_token
        
        payload = decode_token(refresh_token)
        if not payload:
            raise ValueError("Invalid refresh token")

        user_id = payload.get("sub")
        user = self.user_repo.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        access_token = create_access_token(data={"sub": user.id})
        new_refresh_token = create_refresh_token(data={"sub": user.id})

        return Token(
            access_token=access_token,
            refresh_token=new_refresh_token,
            user=UserResponse.model_validate(user),
        )

    def google_auth(self, google_id: str, email: str, name: str) -> Token:
        # Check if user exists by Google ID
        user = self.user_repo.get_user_by_google_id(google_id)
        
        if not user:
            # Check if user exists by email (merge accounts)
            existing_user = self.user_repo.get_user_by_email(email)
            if existing_user:
                # Link Google account to existing user
                user = self.user_repo.update_user(existing_user.id, google_id=google_id)
            else:
                # Create new user with Google
                user = self.user_repo.create_google_user(email, name, google_id)

        access_token = create_access_token(data={"sub": user.id})
        refresh_token = create_refresh_token(data={"sub": user.id})

        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserResponse.model_validate(user),
        )

    def github_auth(self, github_id: str, email: str, name: str) -> Token:
        # Check if user exists by GitHub ID
        user = self.user_repo.get_user_by_github_id(github_id)
        
        if not user:
            # Check if user exists by email (merge accounts)
            existing_user = self.user_repo.get_user_by_email(email)
            if existing_user:
                # Link GitHub account to existing user
                user = self.user_repo.update_user(existing_user.id, github_id=github_id)
            else:
                # Create new user with GitHub
                user = self.user_repo.create_github_user(email, name, github_id)

        access_token = create_access_token(data={"sub": user.id})
        refresh_token = create_refresh_token(data={"sub": user.id})

        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserResponse.model_validate(user),
        )

    def update_profile(self, user_id: str, name: Optional[str] = None, avatar: Optional[str] = None) -> UserResponse:
        """Update user's name and avatar."""
        user = self.user_repo.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        update_data = {}
        if name is not None:
            update_data["name"] = name
        if avatar is not None:
            update_data["avatar"] = avatar
        updated_user = self.user_repo.update_user(user_id, **update_data)
        return UserResponse.model_validate(updated_user)  # type: ignore

    def change_password(self, user_id: str, current_password: str, new_password: str) -> None:
        """Change user's password after verifying current password."""
        user = self.user_repo.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        if not verify_password(current_password, user.hashed_password or ""):
            raise ValueError("Current password is incorrect")
        new_hash = get_password_hash(new_password)
        self.user_repo.update_user(user_id, hashed_password=new_hash)
        # No return value; success if no exception

