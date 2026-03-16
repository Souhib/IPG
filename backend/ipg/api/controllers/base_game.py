from datetime import datetime
from uuid import UUID

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from ipg.api.controllers.achievement import AchievementController
from ipg.api.controllers.game import GameController
from ipg.api.controllers.room import RoomController
from ipg.api.controllers.stats import StatsController
from ipg.api.models.error import GameNotFoundError, PlayerRemovedFromGameError
from ipg.api.models.relationship import RoomUserLink
from ipg.api.models.table import Game, Room


class BaseGameController:
    """Base class for game controllers with shared utility methods."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self._room_controller = RoomController(session)
        self._game_controller = GameController(session)
        self._stats_controller = StatsController(session)
        self._achievement_controller = AchievementController(session)

    async def _get_game(self, game_id: UUID) -> Game:
        """Fetch a Game from PostgreSQL or raise GameNotFoundError."""
        game = (await self.session.exec(select(Game).where(Game.id == game_id))).first()
        if not game or not game.live_state:
            raise GameNotFoundError(game_id=game_id)
        return game

    async def _check_is_host(self, room_id: UUID, user_id: UUID) -> bool:
        """Check if the user is the host of the room."""
        room = (await self.session.exec(select(Room).where(Room.id == room_id))).first()
        if room:
            return room.owner_id == user_id
        return False

    async def _update_heartbeat_throttled(self, room_id: UUID, user_id: UUID) -> None:
        """Update heartbeat only if last_seen_at is stale (>10s)."""
        link = (
            await self.session.exec(
                select(RoomUserLink).where(RoomUserLink.room_id == room_id).where(RoomUserLink.user_id == user_id)
            )
        ).first()
        if not link:
            return
        needs_update = (
            link.disconnected_at is not None
            or not link.connected
            or not link.last_seen_at
            or (datetime.now() - link.last_seen_at).total_seconds() > 10
        )
        if needs_update:
            link.last_seen_at = datetime.now()
            link.connected = True
            if link.disconnected_at is not None:
                link.disconnected_at = None
            self.session.add(link)
            await self.session.commit()

    async def _check_spectator(self, game: Game, user_id: UUID, player: dict | None) -> bool:
        """Check if user is a spectator. Raises PlayerRemovedFromGameError if not player and not spectator."""
        if player:
            return False
        link = (
            await self.session.exec(
                select(RoomUserLink)
                .where(RoomUserLink.room_id == game.room_id)
                .where(RoomUserLink.user_id == user_id)
                .where(RoomUserLink.is_spectator == True)  # noqa: E712
            )
        ).first()
        if not link:
            raise PlayerRemovedFromGameError(user_id=str(user_id), game_id=str(game.id))
        return True

    @staticmethod
    def _resolve_multilingual(data: dict | None, lang: str) -> str | None:
        """Resolve a multilingual dict {en, ar, fr} to a string in the requested language."""
        if not data or not isinstance(data, dict):
            return None
        return data.get(lang) or data.get("en") or next(iter(data.values()), None)
