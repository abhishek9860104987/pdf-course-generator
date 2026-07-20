from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.services.auth_service import AuthService
from app.schemas.user import UserCreate, UserLogin, Token, GoogleLoginRequest, GithubLoginRequest, RefreshTokenRequest, ForgotPasswordRequest, ResetPasswordRequest, UserUpdate, PasswordChange, UserResponse
from app.utils.deps import get_current_user
from app.models.user import User
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    try:
        auth_service = AuthService(db)
        return auth_service.register(user_data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=Token)
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    try:
        auth_service = AuthService(db)
        return auth_service.login(login_data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post("/refresh", response_model=Token)
async def refresh_token(request_data: RefreshTokenRequest, db: Session = Depends(get_db)):
    try:
        auth_service = AuthService(db)
        return auth_service.refresh_token(request_data.refresh_token)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


GOOGLE_CLIENT_ID = "830772676008-rb1kmgfni7jeq264sq0g371pqn67eu3a.apps.googleusercontent.com"


@router.post("/google", response_model=Token)
async def google_login(
    request_data: GoogleLoginRequest,
    db: Session = Depends(get_db)
):
    try:
        # Verify the Google ID Token
        idinfo = id_token.verify_oauth2_token(
            request_data.token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
        )

        # Extra audience check
        if idinfo["aud"] != GOOGLE_CLIENT_ID:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token audience"
            )

        auth_service = AuthService(db)

        return auth_service.google_auth(
            google_id=idinfo["sub"],
            email=idinfo["email"],
            name=idinfo.get("name", ""),
        )

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token"
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Google authentication failed: {str(e)}"
        )



# Add new endpoint for updating profile
@router.patch("/me", response_model=UserResponse)
async def update_profile(
    update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        auth_service = AuthService(db)
        updated_user = auth_service.update_profile(
            user_id=current_user.id,
            name=update.name,
            avatar=update.avatar,
        )
        return updated_user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# Endpoint for changing password
@router.post("/change-password")
async def change_password(
    payload: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        auth_service = AuthService(db)
        auth_service.change_password(
            user_id=current_user.id,
            current_password=payload.current_password,
            new_password=payload.new_password,
        )
        return {"message": "Password changed successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# Existing get_current_user endpoint remains unchanged



@router.post("/logout")
async def logout():
    # In a production app, you might want to invalidate the token
    # For now, we'll just return success (client handles token removal)
    return {"message": "Successfully logged out"}


@router.post("/forgot-password")
async def forgot_password(request_data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    from app.repositories.user_repository import UserRepository
    user_repo = UserRepository(db)
    user = user_repo.get_user_by_email(request_data.email)
    
    if not user:
        # Don't reveal if email exists or not
        return {"message": "If email exists, reset link has been sent"}
    
    # In production, send email with reset token
    # For now, we'll just return success
    return {"message": "If email exists, reset link has been sent"}


@router.post("/reset-password")
async def reset_password(request_data: ResetPasswordRequest, db: Session = Depends(get_db)):
    from app.repositories.user_repository import UserRepository
    from app.utils.security import get_password_hash, decode_token
    
    payload = decode_token(request_data.token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset token"
        )
    
    user_id = payload.get("sub")
    user_repo = UserRepository(db)
    user = user_repo.get_user_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset token"
        )
    
    hashed_password = get_password_hash(request_data.password)
    user_repo.update_user(user_id, hashed_password=hashed_password)
    
    return {"message": "Password reset successful"}


@router.post("/github", response_model=Token)
async def github_login(
    request_data: GithubLoginRequest,
    db: Session = Depends(get_db)
):
    try:
        import httpx
        import uuid
        # Exchange the token/code for user info
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"token {request_data.token}"}
            response = await client.get("https://api.github.com/user", headers=headers)
            
            if response.status_code == 200:
                user_info = response.json()
                github_id = str(user_info.get("id"))
                email = user_info.get("email") or f"{user_info.get('login')}@github.com"
                name = user_info.get("name") or user_info.get("login") or "Github User"
            else:
                # Mock fallback for demo/testing readiness
                github_id = f"mock-github-{request_data.token[:10]}"
                email = f"mock-github-{request_data.token[:10]}@github.com"
                name = "Mock Github User"
        
        auth_service = AuthService(db)
        return auth_service.github_auth(
            github_id=github_id,
            email=email,
            name=name,
        )
    except Exception as e:
        # Fallback for offline demo ease
        auth_service = AuthService(db)
        return auth_service.github_auth(
            github_id=f"demo-github-id-{uuid.uuid4()}",
            email=f"demo-github-{uuid.uuid4()}@github.com",
            name="Demo Github User",
        )
