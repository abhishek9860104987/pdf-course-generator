from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime



class UserBase(BaseModel):
    email: EmailStr
    name: str


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    avatar: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str


# JWT Token Response
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: Optional[UserResponse] = None


# JWT Token Payload
class TokenData(BaseModel):
    user_id: Optional[str] = None


class GoogleLoginRequest(BaseModel):
    token: str


class GithubLoginRequest(BaseModel):
    token: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    password: str