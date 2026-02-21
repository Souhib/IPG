from aredis_om import NotFoundError

from ibg.api.models.error import GameNotFoundError
from ibg.api.models.undercover import UndercoverRole
from ibg.socketio.controllers.undercover_game import (
    check_if_a_team_has_win,
    create_undercover_game,
    eliminate_player_based_on_votes,
    set_vote,
    start_new_turn,
)
from ibg.socketio.models.shared import IBGSocket
from ibg.socketio.models.socket import StartGame, StartNewTurn, UndercoverGame, VoteForAPerson
from ibg.socketio.routes.shared import send_event_to_client, socketio_exception_handler


def undercover_events(sio: IBGSocket) -> None:

    @sio.event
    @socketio_exception_handler(sio)
    async def start_undercover_game(sid, data) -> None:
        """Start an Undercover Game in a Room with the given data."""
        # Validation
        start_game_input = StartGame(**data)

        # Function Logic
        db_room, db_game, redis_game = await create_undercover_game(sio, start_game_input)

        # Send Notification to each player to assign role
        for player in redis_game.players:
            if player.role == UndercoverRole.MR_WHITE:
                await send_event_to_client(
                    sio,
                    "role_assigned",
                    {
                        "role": player.role.value,
                        "word": "You are Mr. White. You have to guess the word.",
                    },
                    room=player.sid,
                )
            else:
                word = (
                    redis_game.undercover_word if player.role == UndercoverRole.UNDERCOVER else redis_game.civilian_word
                )
                await send_event_to_client(
                    sio,
                    "role_assigned",
                    {
                        "role": player.role.value,
                        "word": word,
                    },
                    room=player.sid,
                )

        # Send Notification to Room that game has started
        await send_event_to_client(
            sio,
            "game_started",
            {
                "game_id": str(db_game.id),
                "game_type": "undercover",
                "message": "Undercover Game has started. Check your role and word.",
                "players": [player.username for player in redis_game.players],
                "mayor": next(player.username for player in redis_game.players if player.is_mayor),
            },
            room=str(db_room.public_id),
        )

    @sio.event
    @socketio_exception_handler(sio)
    async def start_new_turn_event(sid, data) -> None:
        """Start a new turn in the game."""
        # Validation
        start_new_turn_data = StartNewTurn(**data)

        db_room = await sio.room_controller.get_room_by_id(start_new_turn_data.room_id)
        try:
            redis_game = await UndercoverGame.get(start_new_turn_data.game_id)
        except NotFoundError:
            raise GameNotFoundError(game_id=start_new_turn_data.game_id) from None
        db_game = await sio.game_controller.get_game_by_id(redis_game.id)

        # Function Logic
        await start_new_turn(sio, db_room, db_game, redis_game)

        # Send Notification to Room that a new turn has started
        await send_event_to_client(
            sio,
            "notification",
            {"message": "Starting a new turn."},
            room=start_new_turn_data.room_id,
        )

    @sio.event
    @socketio_exception_handler(sio)
    async def vote_for_a_player(sid, data) -> None:
        """Vote for a player in the game."""
        data = VoteForAPerson(**data)
        try:
            game = await UndercoverGame.get(data.game_id)
        except NotFoundError:
            raise GameNotFoundError(game_id=data.game_id) from None

        player_to_vote, voted_player = await set_vote(game, data)

        # Re-fetch game after vote to get latest state
        game = await UndercoverGame.get(data.game_id)

        if len(game.turns[-1].votes) == len(game.players) - len(game.eliminated_players):
            eliminated_player, number_of_vote = await eliminate_player_based_on_votes(game)

            # Send Notification to Room that a player has been eliminated
            await send_event_to_client(
                sio,
                "player_eliminated",
                {
                    "message": f"Player {eliminated_player.username} is eliminated with {number_of_vote} votes against him.",
                    "eliminated_player_role": eliminated_player.role,
                },
                room=data.room_id,
            )

            # Send Notification to the eliminated player
            await send_event_to_client(
                sio,
                "you_died",
                {"message": f"You have been eliminated with {number_of_vote} votes against you."},
                room=eliminated_player.sid,
            )
            team_that_won = await check_if_a_team_has_win(game)
            if team_that_won == UndercoverRole.CIVILIAN:
                await send_event_to_client(
                    sio,
                    "game_over",
                    {
                        "data": "The civilians have won the game.",
                    },
                    room=game.room_id,
                )
            elif team_that_won == UndercoverRole.UNDERCOVER:
                await send_event_to_client(
                    sio,
                    "game_over",
                    {
                        "data": "The undercovers have won the game.",
                    },
                    room=game.room_id,
                )

        else:
            players_that_voted = [player for player in game.players if player.id in game.turns[-1].votes.values()]
            await send_event_to_client(
                sio,
                "vote_casted",
                {
                    "message": "Vote casted.",
                },
                room=sid,
            )
            await send_event_to_client(
                sio,
                "waiting_other_votes",
                {
                    "message": "Waiting for other players to vote.",
                    "players_that_voted": [
                        {
                            "username": player.username,
                            "user_id": str(player.user_id),
                        }
                        for player in players_that_voted
                    ],
                },
                room=sid,
            )
