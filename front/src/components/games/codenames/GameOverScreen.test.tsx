import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { describe, it, expect, vi } from 'vitest'

const mockMutateAsync = vi.fn()

vi.mock('@/api/generated', () => ({
  useRematchApiV1RoomsRoomIdRematchPost: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}))

vi.mock('@/api/client', () => ({
  default: vi.fn(),
  getApiErrorMessage: vi.fn(() => 'Error'),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}))

import { GameOverScreen } from './GameOverScreen'

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const defaultProps = {
  winner: 'red' as const,
  roomId: 'room-123',
  onBackToRoom: vi.fn(),
  onLeaveRoom: vi.fn(),
}

function renderGameOver(overrides: Partial<typeof defaultProps> = {}) {
  return render(<GameOverScreen {...defaultProps} {...overrides} />, { wrapper: createWrapper() })
}

describe('GameOverScreen', () => {
  it('shows game over title', () => {
    renderGameOver()
    expect(screen.getByText('game.gameOver')).toBeInTheDocument()
  })

  it('shows red team wins with red color class', () => {
    renderGameOver({ winner: 'red' })
    const winnerText = screen.getByText(/games.codenames.teams.red/)
    expect(winnerText).toHaveClass('text-red-600')
  })

  it('shows blue team wins with blue color class', () => {
    renderGameOver({ winner: 'blue' })
    const winnerText = screen.getByText(/games.codenames.teams.blue/)
    expect(winnerText).toHaveClass('text-blue-600')
  })

  it('shows play again button when roomId is provided', () => {
    renderGameOver({ roomId: 'room-123' })
    expect(screen.getByText('game.playAgain')).toBeInTheDocument()
  })

  it('hides play again button when roomId is null', () => {
    renderGameOver({ roomId: null })
    expect(screen.queryByText('game.playAgain')).not.toBeInTheDocument()
  })

  it('calls onLeaveRoom when leave button is clicked', () => {
    const onLeaveRoom = vi.fn()
    renderGameOver({ onLeaveRoom })
    fireEvent.click(screen.getByText('room.leave'))
    expect(onLeaveRoom).toHaveBeenCalledOnce()
  })

  it('calls API and onBackToRoom when play again is clicked', async () => {
    mockMutateAsync.mockResolvedValueOnce({})

    const onBackToRoom = vi.fn()
    renderGameOver({ roomId: 'room-456', onBackToRoom })

    fireEvent.click(screen.getByText('game.playAgain'))

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({ room_id: 'room-456' })
    })

    await waitFor(() => {
      expect(onBackToRoom).toHaveBeenCalledOnce()
    })
  })
})
