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
  retrieveRoomIdForGame: vi.fn(() => "room-456"),
}))

vi.mock("@/api/client", () => ({
  getApiErrorMessage: vi.fn((err: unknown, fallback: string) => fallback),
}))

const mockSocketReturn = { connected: true }
vi.mock("@/hooks/use-socket", () => ({
  useSocket: () => mockSocketReturn,
}))

// Mock server state for codenames
const mockBoard = [
  { word: "Quran", card_type: "red", revealed: false, hint: null },
  { word: "Mosque", card_type: "blue", revealed: false, hint: null },
  { word: "Prayer", card_type: "neutral", revealed: false, hint: null },
  { word: "Hajj", card_type: "assassin", revealed: false, hint: null },
]

const mockServerState = {
  game_id: "game-1",
  room_id: "room-456",
  team: "red" as const,
  role: "spymaster" as const,
  is_host: true,
  board: mockBoard,
  current_team: "red" as const,
  red_remaining: 3,
  blue_remaining: 3,
  status: "in_progress",
  current_turn: {
    team: "red" as const,
    clue_word: null,
    clue_number: 0,
    guesses_made: 0,
    max_guesses: null,
  },
  winner: null,
  players: [
    { user_id: "user-1", username: "TestUser", team: "red", role: "spymaster" },
    { user_id: "user-2", username: "Player2", team: "blue", role: "operative" },
  ],
  clue_history: [],
  timer_config: { clue_seconds: 60, guess_seconds: 60 },
  timer_started_at: null,
  newly_unlocked_achievements: [],
}

let mockQueryData: typeof mockServerState | undefined = undefined
let mockIsLoading = true
let mockQueryError: Error | null = null

vi.mock("@/api/generated", () => ({
  useGetCodenamesBoardApiV1CodenamesGamesGameIdBoardGet: () => ({
    data: mockQueryData,
    isLoading: mockIsLoading,
    error: mockQueryError,
  }),
  useGiveClueApiV1CodenamesGamesGameIdCluePost: () => ({ mutateAsync: vi.fn() }),
  useGuessCardApiV1CodenamesGamesGameIdGuessPost: () => ({ mutateAsync: vi.fn() }),
  useEndTurnApiV1CodenamesGamesGameIdEndTurnPost: () => ({ mutateAsync: vi.fn() }),
  useRecordHintViewedApiV1CodenamesGamesGameIdHintViewedPost: () => ({ mutateAsync: vi.fn() }),
  useTimerExpiredApiV1CodenamesGamesGameIdTimerExpiredPost: () => ({ mutateAsync: vi.fn() }),
  useLeaveRoomApiV1RoomsLeavePatch: () => ({ mutateAsync: vi.fn() }),
  getCodenamesBoardApiV1CodenamesGamesGameIdBoardGetQueryKey: ({ game_id }: { game_id: string }) => [
    { url: "/api/v1/codenames/games/:game_id/board", params: { game_id } },
  ],
  getRoomStateApiV1RoomsRoomIdStateGetQueryKey: ({ room_id }: { room_id: string }) => [
    { url: "/api/v1/rooms/:room_id/state", params: { room_id } },
  ],
  getUndercoverStateApiV1UndercoverGamesGameIdStateGetQueryKey: ({ game_id }: { game_id: string }) => [
    { url: "/api/v1/undercover/games/:game_id/state", params: { game_id } },
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
const { useCodenamesGame } = await import("./use-codenames-game")

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe("useCodenamesGame", () => {
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

    const { result } = renderHook(() => useCodenamesGame("game-1"), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.serverState).toBeUndefined()
    expect(result.current.gameState).toBeNull()
  })

  it("returns game data when query succeeds", () => {
    mockIsLoading = false
    mockQueryData = { ...mockServerState }

    const { result } = renderHook(() => useCodenamesGame("game-1"), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.serverState).toBeDefined()
    expect(result.current.gameState).not.toBeNull()
    expect(result.current.gameState!.board).toHaveLength(4)
    expect(result.current.gameState!.my_team).toBe("red")
    expect(result.current.gameState!.my_role).toBe("spymaster")
    expect(result.current.gameState!.current_team).toBe("red")
    expect(result.current.gameState!.red_remaining).toBe(3)
    expect(result.current.gameState!.blue_remaining).toBe(3)
    expect(result.current.gameState!.players).toHaveLength(2)
  })

  it("passes through socket connected state", () => {
    mockIsLoading = false
    mockQueryData = { ...mockServerState }
    mockSocketReturn.connected = true

    const { result } = renderHook(() => useCodenamesGame("game-1"), { wrapper: createWrapper() })
    expect(result.current.socketConnected).toBe(true)

    mockSocketReturn.connected = false
    const { result: result2 } = renderHook(() => useCodenamesGame("game-1"), { wrapper: createWrapper() })
    expect(result2.current.socketConnected).toBe(false)
  })

  it("derives correct status from game state", () => {
    mockIsLoading = false

    // in_progress
    mockQueryData = { ...mockServerState, status: "in_progress", winner: null }
    const { result: r1 } = renderHook(() => useCodenamesGame("game-1"), { wrapper: createWrapper() })
    expect(r1.current.gameState!.status).toBe("in_progress")
    expect(r1.current.gameState!.winner).toBeNull()

    // finished with winner
    mockQueryData = { ...mockServerState, status: "finished", winner: "red" }
    const { result: r2 } = renderHook(() => useCodenamesGame("game-1"), { wrapper: createWrapper() })
    expect(r2.current.gameState!.status).toBe("finished")
    expect(r2.current.gameState!.winner).toBe("red")
  })

  it("returns null gameState when serverState is undefined", () => {
    mockIsLoading = false
    mockQueryData = undefined

    const { result } = renderHook(() => useCodenamesGame("game-1"), { wrapper: createWrapper() })

    expect(result.current.gameState).toBeNull()
    expect(result.current.clueWord).toBe("")
    expect(result.current.clueNumber).toBe(1)
    expect(result.current.isSubmittingClue).toBe(false)
    expect(result.current.cancelMessage).toBeNull()
    expect(result.current.showGameOverTransition).toBe(false)
  })
})
