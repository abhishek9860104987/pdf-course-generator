from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    groq_api_key: str = ""
    google_client_id: str = ""
    google_client_secret: str = ""
    upload_dir: str = "./uploads"
    max_file_size: int = 209715200  # 200MB
    cors_origins: str = "http://localhost:3000,http://localhost:5173"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"


settings = Settings()
