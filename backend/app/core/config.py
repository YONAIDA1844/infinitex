from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    anthropic_api_key: str = ""
    gmail_client_id: str = ""
    gmail_client_secret: str = ""
    gmail_refresh_token: str = ""
    gmail_sender: str = "logistica@sicobenediciones.com"
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    whatsapp_from_number: str = ""
    database_url: str = "sqlite+aiosqlite:///./infinitex.db"
    approval_reminder_days: str = "3,7,15"
    monday_api_key: str = ""
    monday_board_id: str = ""          # ID de la tabla "Tráfico 2026"
    monday_board_name: str = "Tráfico 2026"

    @property
    def reminder_days(self) -> List[int]:
        return [int(d) for d in self.approval_reminder_days.split(",")]

    class Config:
        env_file = ".env"


settings = Settings()
