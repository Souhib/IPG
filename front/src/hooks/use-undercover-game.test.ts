import { describe, expect, it, vi, beforeEach } from "vitest"
import { renderHook } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createElement } from "react"

// Mock dependencies before imports

const mockNavigate = vi.fn()
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}))

const mockUser = { id: "user-1", username: "TestUser" }
vi.mock("@/providers/AuthProvider", () => ({
  useAuth: () => ({ user: mockUser }),
}))

vi.mock("sonner", () => ({
  toast: { info: vi.fn(), error: vi.fn(), warning: vi.fn() },
}))

vi.mock("@/lib/analytics", () => ({
  trackEvent: vi.fn(),
}))

vi.mock("@/components/achievements/AchievementToast", () => ({
  useAchievementNotifications: vi.fn(),
}))

vi.mock("@/lib/room-session", () => ({
  retrieveRoomIdForGame: vi.fn(() => "room-123"),
}))

vi.mock("@/api/client", () => ({
  getApiErrorMessage: vi.fn((err: unknown, fallback: string) => fallback),
}))

const mockSocketReturn = { connected: true }
vi.mock("@/hooks/use-socket", () => ({
  useSocket: () => mockSocketReturn,
}))

// Mock the generated API hooks
const mockServerState = {
  my_role: "civilian",
  my_word: "Quran",
  my_word_hint: null,
  is_alive: true,
  players: [
    { user_id: "user-1", username: "TestUser", is_alive: true },
    { user_id: "user-2", username: "Player2", is_alive: true },
  ],
  eliminated_players: [],
  turn_number: 1,
  has_voted: false,
  room_id: "room-123",
  is_host: true,
  votes: {},
  winner: null,
  turn_phase: "describing",
  description_order: [{ user_id: "user-1", username: "TestUser" }],
  current_describer_index: 0,
  descriptions: {},
  vote_history: [],
  timer_config: { description_seconds: 60, voting_seconds: 30 },
  timer_started_at: null,
  newly_unlocked_achievements: [],
  word_explanations: null,
}

let mockQueryData: typeof mockServerState | undefined = undefined
let mockIsLoading = true
let mockQueryError: Error | null = null

vi.mock("@/api/generated", () => ({
  useGetUndercoverStateApiV1UndercoverGamesGameIdStateGet: () => ({
    data: mockQueryData,
    isLoading: mockIsLoading,
    error: mockQueryError,
  }),
  useSubmitVoteApiV1UndercoverGamesGameIdVotePost: () => ({ mutateAsync: vi.fn() }),
  useSubmitDescriptionApiV1UndercoverGamesGameIdDescribePost: () => ({ mutateAsync: vi.fn() }),
  useRecordHintViewedApiV1UndercoverGamesGameIdHintViewedPost: () => ({ mutateAsync: vi.fn() }),
  useTimerExpiredApiV1UndercoverGamesGameIdTimerExpiredPost: () => ({ mutateAsync: vi.fn() }),
  useLeaveRoomApiV1RoomsLeavePatch: () => ({ mutateAsync: vi.fn() }),
  getUndercoverStateApiV1UndercoverGamesGameIdStateGetQueryKey: ({ game_id }: { game_id: string }) => [
    { url: "/api/v1/undercover/games/:game_id/state", params: { game_id } },
  ],
  getRoomStateApiV1RoomsRoomIdStateGetQueryKey: ({ room_id }: { room_id: string }) => [
    { url: "/api/v1/rooms/:room_id/state", params: { room_id } },
  ],
  getCodenamesBoardApiV1CodenamesGamesGameIdBoardGetQueryKey: ({ game_id }: { game_id: string }) => [
    { url: "/api/v1/codenames/games/:game_id/board", params: { game_id } },
  ],
  getWordquizStateApiV1WordquizGamesGameIdStateGetQueryKey: ({ game_id }: { game_id: string }) => [
    { url: "/api/v1/wordquiz/games/:game_id/state", params: { game_id } },
  ],
  getMcqquizStateApiV1McqquizGamesGameIdStateGetQueryKey: ({ game_id }: { game_id: string }) => [
    { url: "/api/v1/mcqquiz/games/:game_id/state", params: { game_id } },
  ],
  getFriendsApiV1FriendsGetQueryKey: () => [{ url: "/api/v1/friends" }],
  getPendingRequestsApiV1FriendsPendingGetQueryKey: () => [{ url: "/api/v1/friends/pending" }],
  getFriendshipStatusApiV1FriendsStatusUserIdGetQueryKey: ({ user_id }: { user_id: string }) => [
    { url: "/api/v1/friends/status/:user_id", params: { user_id } },
  ],
}))

// Import after mocks
const { useUndercoverGame } = await import("./use-undercover-game")

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe("useUndercoverGame", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockQueryData = undefined
    mockIsLoading = true
    mockQueryError = null
    mockSocketReturn.connected = true
  })

  it("returns loading state when query is loading", () => {
    mockIsLoading = true
    mockQueryData = undefined

    const { result } = renderHook(() => useUndercoverGame("game-1"), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.serverState).toBeUndefined()
  })

  it("returns game data when query succeeds", () => {
    mockIsLoading = false
    mockQueryData = { ...mockServerState }

    const { result } = renderHook(() => useUndercoverGame("game-1"), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.serverState).toBeDefined()
    expect(result.current.gameState.players).toHaveLength(2)
    expect(result.current.gameState.players[0].id).toBe("user-1")
    expect(result.current.gameState.players[0].username).toBe("TestUser")
    expect(result.current.gameState.round).toBe(1)
    expect(result.current.gameState.isHost).toBe(true)
  })

  it("passes through socket connected state", () => {
    mockIsLoading = false
    mockQueryData = { ...mockServerState }
    mockSocketReturn.connected = true

    const { result } = renderHook(() => useUndercoverGame("game-1"), { wrapper: createWrapper() })
    expect(result.current.socketConnected).toBe(true)

    mockSocketReturn.connected = false
    const { result: result2 } = renderHook(() => useUndercoverGame("game-1"), { wrapper: createWrapper() })
    expect(result2.current.socketConnected).toBe(false)
  })

  it("derives correct phase from game state", () => {
    mockIsLoading = false

    // describing phase
    mockQueryData = { ...mockServerState, turn_phase: "describing", winner: null, turn_number: 2 }
    const { result: r1 } = renderHook(() => useUndercoverGame("game-1"), { wrapper: createWrapper() })
    expect(r1.current.gameState.phase).toBe("describing")

    // game_over phase
    mockQueryData = { ...mockServerState, winner: "civilians" }
    const { result: r2 } = renderHook(() => useUndercoverGame("game-1"), { wrapper: createWrapper() })
    expect(r2.current.gameState.phase).toBe("game_over")

    // voting phase
    mockQueryData = { ...mockServerState, turn_phase: "voting", turn_number: 1, winner: null }
    const { result: r3 } = renderHook(() => useUndercoverGame("game-1"), { wrapper: createWrapper() })
    expect(r3.current.gameState.phase).toBe("playing")
  })

  it("returns safe defaults when serverState is undefined", () => {
    mockIsLoading = false
    mockQueryData = undefined

    const { result } = renderHook(() => useUndercoverGame("game-1"), { wrapper: createWrapper() })

    expect(result.current.gameState.players).toEqual([])
    expect(result.current.gameState.phase).toBe("role_reveal")
    expect(result.current.gameState.round).toBe(1)
    expect(result.current.gameState.votedPlayers).toEqual([])
    expect(result.current.gameState.isHost).toBe(false)
    expect(result.current.gameState.descriptionOrder).toEqual([])
    expect(result.current.gameState.descriptions).toEqual({})
  })
})
