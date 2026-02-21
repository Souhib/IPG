from enum import Enum
from uuid import UUID

from pydantic import BaseModel

from ibg.socketio.models.socket import Game
from ibg.socketio.models.user import SocketPlayer


class CodenamesTeam(str, Enum):
    RED = "red"
    BLUE = "blue"


class CodenamesCardType(str, Enum):
    RED = "red"
    BLUE = "blue"
    NEUTRAL = "neutral"
    ASSASSIN = "assassin"


class CodenamesRole(str, Enum):
    SPYMASTER = "spymaster"
    OPERATIVE = "operative"


class CodenamesGameStatus(str, Enum):
    WAITING = "waiting"
    IN_PROGRESS = "in_progress"
    FINISHED = "finished"


class CodenamesCard(BaseModel):
    """A single card on the Codenames board."""

    word: str
    card_type: CodenamesCardType
    revealed: bool = False


class CodenamesTurn(BaseModel):
    """Tracks the current turn state in a Codenames game."""

    team: CodenamesTeam
    clue_word: str | None = None
    clue_number: int = 0
    guesses_made: int = 0
    max_guesses: int = 0


class CodenamesPlayer(SocketPlayer):
    """A player in a Codenames game with team and role assignments."""

    team: CodenamesTeam
    role: CodenamesRole


class CodenamesGame(Game, index=True):
    """Full game state for a Codenames game, stored in Redis."""

    board: list[CodenamesCard] = []
    players: list[CodenamesPlayer] = []
    current_team: CodenamesTeam = CodenamesTeam.RED
    current_turn: CodenamesTurn | None = None
    red_remaining: int = 0
    blue_remaining: int = 0
    status: CodenamesGameStatus = CodenamesGameStatus.WAITING
    winner: CodenamesTeam | None = None


class StartCodenamesGame(BaseModel):
    """Input model for starting a Codenames game."""

    room_id: UUID
    user_id: UUID
    word_pack_ids: list[UUID] | None = None


class GiveClue(BaseModel):
    """Input model for a spymaster giving a clue."""

    room_id: str
    game_id: str
    user_id: str
    clue_word: str
    clue_number: int


class GuessCard(BaseModel):
    """Input model for an operative guessing a card."""

    room_id: str
    game_id: str
    user_id: str
    card_index: int


class EndTurn(BaseModel):
    """Input model for an operative ending their turn voluntarily."""

    room_id: str
    game_id: str
    user_id: str


class GetBoard(BaseModel):
    """Input model for requesting the board state."""

    game_id: str
    user_id: str
    room_id: str | None = None
