from uuid import UUID

from ipg.api.schemas.shared import BaseModel


class UpdateBioRequest(BaseModel):
    bio: str | None = None


class PublicProfile(BaseModel):
    user_id: UUID
    username: str
    bio: str | None
    total_games_played: int
    total_games_won: int
    win_rate: float
    current_win_streak: int
