from ipg.api.schemas.shared import BaseModel


class StatusResponse(BaseModel):
    status: str


class StatusMessageResponse(BaseModel):
    status: str
    message: str


class GameStartResponse(BaseModel):
    game_id: str
    room_id: str


class HintRecordResponse(BaseModel):
    game_id: str
    recorded: bool


class TimerExpiredResponse(BaseModel):
    game_id: str
    action: str
