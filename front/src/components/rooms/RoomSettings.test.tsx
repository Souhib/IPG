import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { RoomSettings } from './RoomSettings'

vi.mock('@/api/generated', () => ({
  useUpdateRoomSettingsApiV1RoomsRoomIdSettingsPatch: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}))

vi.mock('@/api/client', () => ({
  getApiErrorMessage: (err: unknown) => String(err),
}))

function defaultProps(overrides: Record<string, unknown> = {}) {
  return {
    roomId: 'room-1',
    settings: null,
    gameType: 'undercover' as const,
    playerCount: 5,
    ...overrides,
  }
}

describe('RoomSettings', () => {
  it('renders the settings heading', () => {
    render(<RoomSettings {...defaultProps()} />)
    expect(screen.getByText('room.settings')).toBeInTheDocument()
  })

  it('toggles settings panel open and closed', () => {
    const { container } = render(<RoomSettings {...defaultProps()} />)
    // Initially collapsed — the grid wrapper has opacity-0
    const gridWrapper = container.querySelector('.opacity-0')
    expect(gridWrapper).toBeInTheDocument()
    // Click to open
    fireEvent.click(screen.getByText('room.settings'))
    // After opening, the wrapper should have opacity-100
    const openWrapper = container.querySelector('.opacity-100')
    expect(openWrapper).toBeInTheDocument()
  })

  it('shows undercover settings for undercover game type', () => {
    render(<RoomSettings {...defaultProps({ gameType: 'undercover' })} />)
    fireEvent.click(screen.getByText('room.settings'))
    expect(screen.getByText('room.descriptionTimer')).toBeInTheDocument()
    expect(screen.getByText('room.votingTimer')).toBeInTheDocument()
    expect(screen.getByText('room.enableMrWhite')).toBeInTheDocument()
  })

  it('shows codenames settings for codenames game type', () => {
    render(<RoomSettings {...defaultProps({ gameType: 'codenames' })} />)
    fireEvent.click(screen.getByText('room.settings'))
    expect(screen.getByText('room.clueTimer')).toBeInTheDocument()
    expect(screen.getByText('room.guessTimer')).toBeInTheDocument()
  })

  it('shows word quiz settings for word_quiz game type', () => {
    render(<RoomSettings {...defaultProps({ gameType: 'word_quiz' })} />)
    fireEvent.click(screen.getByText('room.settings'))
    expect(screen.getByText('room.wordQuizTurnDuration')).toBeInTheDocument()
    expect(screen.getByText('room.wordQuizRounds')).toBeInTheDocument()
    expect(screen.getByText('room.wordQuizHintInterval')).toBeInTheDocument()
  })

  it('shows mcq quiz settings for mcq_quiz game type', () => {
    render(<RoomSettings {...defaultProps({ gameType: 'mcq_quiz' })} />)
    fireEvent.click(screen.getByText('room.settings'))
    expect(screen.getByText('room.mcqQuizTurnDuration')).toBeInTheDocument()
    expect(screen.getByText('room.mcqQuizRounds')).toBeInTheDocument()
  })

  it('shows mr white minimum players warning when playerCount < 4', () => {
    render(<RoomSettings {...defaultProps({ playerCount: 3 })} />)
    fireEvent.click(screen.getByText('room.settings'))
    expect(screen.getByText('room.mrWhiteMinPlayers')).toBeInTheDocument()
  })
})
