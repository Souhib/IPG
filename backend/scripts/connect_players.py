"""Connect extra players to a room via Socket.IO.

Supports both Undercover (3+ players) and Codenames (4+ players).
Usage:
  PYTHONPATH=. uv run python scripts/connect_players.py               # 2 extra players (undercover)
  PYTHONPATH=. uv run python scripts/connect_players.py --codenames   # 3 extra players (codenames)
"""

import argparse
import asyncio
import socketio
import httpx

BACKEND_URL = "http://localhost:5001"
ROOM_PUBLIC_ID = "dUQph"
ROOM_PASSWORD = "5110"

# player2 and player3 were created manually; ali is from seed data
PLAYERS_UNDERCOVER = [
    {"email": "player2@test.com", "password": "player2123"},
    {"email": "player3@test.com", "password": "player3123"},
]

PLAYERS_CODENAMES = [
    {"email": "player2@test.com", "password": "player2123"},
    {"email": "player3@test.com", "password": "player3123"},
    {"email": "ali@test.com", "password": "ali12345"},
]


async def connect_player(email: str, password: str):
    # Login
    r = httpx.post(f"{BACKEND_URL}/api/v1/auth/login", json={"email": email, "password": password})
    r.raise_for_status()
    data = r.json()
    token = data["access_token"]
    user_id = data["user"]["id"]
    username = data["user"]["username"]
    print(f"[{username}] Logged in (id={user_id})")

    sio = socketio.AsyncClient(logger=False, reconnection=True, reconnection_delay=1)

    join_data = {
        "user_id": user_id,
        "public_room_id": ROOM_PUBLIC_ID,
        "password": ROOM_PASSWORD,
    }

    @sio.event
    async def connect():
        print(f"[{username}] Connected — re-joining room...")
        await sio.emit("join_room", join_data)

    @sio.event
    async def room_joined(data):
        print(f"[{username}] room_joined: {data}")

    @sio.event
    async def user_joined(data):
        print(f"[{username}] user_joined: {data}")

    # Undercover events
    @sio.event
    async def role_assigned(data):
        print(f"[{username}] *** ROLE ASSIGNED: {data}")

    @sio.event
    async def game_started(data):
        print(f"[{username}] *** GAME STARTED: {data}")

    @sio.event
    async def notification(data):
        print(f"[{username}] notification: {data}")

    @sio.event
    async def player_eliminated(data):
        print(f"[{username}] player_eliminated: {data}")

    @sio.event
    async def you_died(data):
        print(f"[{username}] you_died: {data}")

    @sio.event
    async def game_over(data):
        print(f"[{username}] game_over: {data}")

    # Codenames events
    @sio.event
    async def codenames_game_started(data):
        print(f"[{username}] *** CODENAMES GAME STARTED: team={data.get('team')}, role={data.get('role')}")
        print(f"  board: {len(data.get('board', []))} cards, current_team={data.get('current_team')}")

    @sio.event
    async def codenames_clue_given(data):
        print(f"[{username}] CLUE GIVEN: '{data.get('clue_word')}' ({data.get('clue_number')})")

    @sio.event
    async def codenames_card_revealed(data):
        print(f"[{username}] CARD REVEALED: '{data.get('card_word')}' -> {data.get('card_type')} (result={data.get('result')})")

    @sio.event
    async def codenames_turn_ended(data):
        print(f"[{username}] TURN ENDED: reason={data.get('reason')}, next_team={data.get('current_team')}")

    @sio.event
    async def codenames_game_over(data):
        print(f"[{username}] *** CODENAMES GAME OVER: winner={data.get('winner')}, reason={data.get('reason')}")

    @sio.event
    async def error(data):
        print(f"[{username}] ERROR: {data}")

    @sio.event
    async def disconnect():
        print(f"[{username}] Disconnected")

    await sio.connect(BACKEND_URL, auth={"token": token}, transports=["websocket"])
    return sio, username


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--codenames", action="store_true", help="Connect 3 extra players for Codenames (default: 2 for Undercover)")
    args = parser.parse_args()

    players = PLAYERS_CODENAMES if args.codenames else PLAYERS_UNDERCOVER
    game_name = "Codenames" if args.codenames else "Undercover"
    print(f"Connecting {len(players)} players for {game_name}...")

    clients = []
    for player in players:
        sio, username = await connect_player(player["email"], player["password"])
        clients.append((sio, username))
        await asyncio.sleep(1)  # Avoid Redis race condition on concurrent joins

    print(f"\nAll {len(clients)} players connected. Waiting for game events... (Ctrl+C to stop)")
    try:
        while True:
            await asyncio.sleep(1)
    except KeyboardInterrupt:
        pass
    finally:
        for sio, username in clients:
            await sio.disconnect()
            print(f"[{username}] Disconnected")


if __name__ == "__main__":
    asyncio.run(main())
