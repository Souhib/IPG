from aredis_om import NotFoundError

from ibg.api.controllers.game import GameController
from ibg.api.controllers.room import RoomController
from ibg.api.controllers.undercover import UndercoverController
from ibg.api.controllers.user import UserController
from ibg.api.models.error import RoomNotFoundError, UserAlreadyInRoomError, UserNotInRoomError
from ibg.api.models.event import EventCreate
from ibg.api.models.room import RoomCreate, RoomJoin, RoomLeave
from ibg.api.models.table import Room
from ibg.socketio.models.room import JoinRoomUser, LeaveRoomUser
from ibg.socketio.models.room import Room as RedisRoom
from ibg.socketio.models.shared import redis_connection
from ibg.socketio.models.user import User
from ibg.socketio.utils.redis_ttl import refresh_room_ttl, refresh_user_ttl


class SocketRoomController:
    def __init__(
        self,
        room_controller: RoomController,
        game_controller: GameController,
        user_controller: UserController,
        undercover_controller: UndercoverController,
    ):
        self._room_controller = room_controller
        self._game_controller = game_controller
        self._user_controller = user_controller
        self._undercover_controller = undercover_controller

    async def user_join_room(self, sid: str, join_room_user: JoinRoomUser) -> Room:
        """
        Join a user to a room. If the room does not exist, raise a RoomNotFoundError.
        Creates Redis room if it doesn't exist (room was created via REST).
        Skips DB join if user was already added via REST room creation.

        Uses a Redis distributed lock to prevent race conditions on concurrent joins.

        :param sid: The socket id of the user.
        :param join_room_user: The user to join the room.
        :return: The room.
        """
        db_room = await self._room_controller.get_active_room_by_public_id(join_room_user.public_room_id)
        db_user = await self._user_controller.get_user_by_id(join_room_user.user_id)

        # Join DB room (skip if user already joined via REST room creation)
        try:
            db_room = await self._room_controller.join_room(
                RoomJoin(
                    room_id=db_room.id,
                    user_id=join_room_user.user_id,
                    password=join_room_user.password,
                )
            )
        except UserAlreadyInRoomError:
            db_room = await self._room_controller.get_room_by_id(db_room.id)

        # Atomic Redis room update with distributed lock
        async with redis_connection.lock(f"room:{db_room.id}:join", timeout=5):
            # Get or create Redis room (REST creation doesn't create one)
            try:
                redis_room = await RedisRoom.get(str(db_room.id))
            except NotFoundError:
                redis_room = RedisRoom(pk=str(db_room.id), id=str(db_room.id), users=[])
                await redis_room.save()

            # Add to Redis room or update SID if already there
            existing_user = next((u for u in redis_room.users if u.id == str(db_user.id)), None)
            if existing_user:
                existing_user.sid = sid
                await redis_room.save()
            else:
                user = User(pk=str(db_user.id), id=str(db_user.id), username=db_user.username, sid=sid)
                await user.save()
                await refresh_user_ttl(user)
                redis_room.users.append(user)
                await redis_room.save()
            await refresh_room_ttl(redis_room)

        await self._room_controller.create_room_activity(
            room_id=db_room.id,
            activity_create=EventCreate(
                name="join_room",
                data={
                    "user_id": str(db_user.id),
                    "username": db_user.username,
                    "message": f"User {db_user.username} joined the room {str(db_room.id)}.",
                },
                user_id=db_user.id,
            ),
        )
        return db_room

    async def user_leave_room(self, leave_room_user: LeaveRoomUser) -> Room:
        """
        Leave a user from a room. If the room does not exist, raise a RoomNotFoundError.
        If the user is not in the room, raise a UserNotInRoomError.

        Uses a Redis distributed lock to prevent race conditions on concurrent leaves.

        :param leave_room_user: The user to leave the room.
        :return: The DB room with relationships loaded.
        """
        db_user = await self._user_controller.get_user_by_id(leave_room_user.user_id)
        db_room = await self._room_controller.leave_room(
            RoomLeave(room_id=leave_room_user.room_id, user_id=leave_room_user.user_id)
        )

        # Atomic Redis room update with distributed lock
        async with redis_connection.lock(f"room:{leave_room_user.room_id}:leave", timeout=5):
            try:
                redis_room = await RedisRoom.get(str(leave_room_user.room_id))
            except NotFoundError:
                raise RoomNotFoundError(room_id=leave_room_user.room_id)

            if not any(user.id == str(db_user.id) for user in redis_room.users):
                raise UserNotInRoomError(user_id=leave_room_user.user_id, room_id=leave_room_user.room_id)

            # Remove user from Redis room
            redis_room.users = [u for u in redis_room.users if u.id != str(db_user.id)]
            await redis_room.save()
            await refresh_room_ttl(redis_room)

        try:
            redis_user = await User.get(str(db_user.id))
            await User.delete(redis_user.pk)
        except NotFoundError:
            pass

        await self._room_controller.create_room_activity(
            room_id=leave_room_user.room_id,
            activity_create=EventCreate(
                name="leave_room",
                data={
                    "user_id": str(db_user.id),
                    "username": db_user.username,
                    "message": f"User {db_user.username} left the room {db_room.id}.",
                },
                user_id=db_user.id,
            ),
        )
        return db_room

    async def create_room(self, sid, room_create: RoomCreate) -> Room:
        """
        Create a room with the given room_id. If the room already exists, raise a RoomAlreadyExistsError.

        :param sid: The socket id of the user.
        :param room_create: The room to create.
        :return: Room
        """
        db_user = await self._user_controller.get_user_by_id(room_create.owner_id)
        db_room = await self._room_controller.create_room(room_create)
        redis_user = User(pk=str(db_user.id), id=str(db_user.id), username=db_user.username, sid=sid)
        await redis_user.save()
        await refresh_user_ttl(redis_user)
        redis_room = RedisRoom(pk=str(db_room.id), id=str(db_room.id), users=[redis_user])
        await redis_room.save()
        await refresh_room_ttl(redis_room)
        return db_room
