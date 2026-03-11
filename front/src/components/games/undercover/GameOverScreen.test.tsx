import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

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

describe('GameOverScreen', () => {
  const defaultProps = {
    winner: 'Civilians',
    roomId: 'room-123' as string | null,
    onBackToRoom: vi.fn(),
    onLeaveRoom: vi.fn(),
  }

  it('shows game over title', () => {
    render(<GameOverScreen {...defaultProps} />, { wrapper: createWrapper() })
    expect(screen.getByText('game.gameOver')).toBeInTheDocument()
  })

  it('shows winner name', () => {
    render(<GameOverScreen {...defaultProps} winner="Civilians" />, { wrapper: createWrapper() })
    expect(screen.getByText(/Civilians/)).toBeInTheDocument()
  })

  it('shows play again button when roomId provided', () => {
    render(<GameOverScreen {...defaultProps} roomId="room-123" />, { wrapper: createWrapper() })
    expect(screen.getByText('game.playAgain')).toBeInTheDocument()
  })

  it('hides play again button when roomId is null', () => {
    render(<GameOverScreen {...defaultProps} roomId={null} />, { wrapper: createWrapper() })
    expect(screen.queryByText('game.playAgain')).not.toBeInTheDocument()
  })

  it('calls onLeaveRoom when leave button clicked', () => {
    const onLeaveRoom = vi.fn()
    render(<GameOverScreen {...defaultProps} onLeaveRoom={onLeaveRoom} />, { wrapper: createWrapper() })
    fireEvent.click(screen.getByText('room.leave'))
    expect(onLeaveRoom).toHaveBeenCalledOnce()
  })

  it('play again button calls API and onBackToRoom', async () => {
    const onBackToRoom = vi.fn()
    mockMutateAsync.mockResolvedValueOnce({})

    render(<GameOverScreen {...defaultProps} roomId="room-123" onBackToRoom={onBackToRoom} />, { wrapper: createWrapper() })
    fireEvent.click(screen.getByText('game.playAgain'))

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({ room_id: 'room-123' })
    })

    await waitFor(() => {
      expect(onBackToRoom).toHaveBeenCalledOnce()
    })
  })
})
