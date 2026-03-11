from uuid import UUID

from ipg.api.schemas.shared import BaseModel


class FriendRequestBody(BaseModel):
    addressee_id: UUID


class FriendEntry(BaseModel):
    friendship_id: UUID
    user_id: UUID
    username: str
    status: str


class FriendActionResponse(BaseModel):
    friendship_id: str
    status: str
