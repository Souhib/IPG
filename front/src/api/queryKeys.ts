import {
  getRoomStateApiV1RoomsRoomIdStateGetQueryKey,
  getCodenamesBoardApiV1CodenamesGamesGameIdBoardGetQueryKey,
  getUndercoverStateApiV1UndercoverGamesGameIdStateGetQueryKey,
  getWordquizStateApiV1WordquizGamesGameIdStateGetQueryKey,
  getMcqquizStateApiV1McqquizGamesGameIdStateGetQueryKey,
  getFriendsApiV1FriendsGetQueryKey,
  getPendingRequestsApiV1FriendsPendingGetQueryKey,
  getFriendshipStatusApiV1FriendsStatusUserIdGetQueryKey,
} from "@/api/generated"

export const queryKeys = {
  room: {
    state: (roomId: string) => getRoomStateApiV1RoomsRoomIdStateGetQueryKey({ room_id: roomId }),
  },
  game: {
    undercover: (gameId: string) => getUndercoverStateApiV1UndercoverGamesGameIdStateGetQueryKey({ game_id: gameId }),
    codenames: (gameId: string) => getCodenamesBoardApiV1CodenamesGamesGameIdBoardGetQueryKey({ game_id: gameId }),
    wordquiz: (gameId: string) => getWordquizStateApiV1WordquizGamesGameIdStateGetQueryKey({ game_id: gameId }),
    mcqquiz: (gameId: string) => getMcqquizStateApiV1McqquizGamesGameIdStateGetQueryKey({ game_id: gameId }),
    byType: (gameType: string, gameId: string) => {
      if (gameType === "codenames") return queryKeys.game.codenames(gameId)
      if (gameType === "word_quiz") return queryKeys.game.wordquiz(gameId)
      if (gameType === "mcq_quiz") return queryKeys.game.mcqquiz(gameId)
      return queryKeys.game.undercover(gameId)
    },
  },
  friends: {
    list: () => getFriendsApiV1FriendsGetQueryKey(),
    pending: () => getPendingRequestsApiV1FriendsPendingGetQueryKey(),
    status: (userId: string) => getFriendshipStatusApiV1FriendsStatusUserIdGetQueryKey({ user_id: userId }),
  },
} as const
