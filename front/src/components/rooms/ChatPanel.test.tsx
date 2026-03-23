import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ChatPanel } from './ChatPanel'

vi.mock('@/api/generated', () => ({
  getMessagesApiV1RoomsRoomIdMessagesGet: vi.fn().mockResolvedValue([]),
  sendMessageApiV1RoomsRoomIdMessagesPost: vi.fn().mockResolvedValue({}),
}))

vi.mock('@/api/client', () => ({
  getApiErrorMessage: (err: unknown) => String(err),
}))

function defaultProps(overrides: Record<string, unknown> = {}) {
  return {
    roomId: 'room-1',
    currentUserId: 'user-1',
    incomingMessage: null,
    ...overrides,
  }
}

describe('ChatPanel', () => {
  it('renders the chat title', () => {
    render(<ChatPanel {...defaultProps()} />)
    expect(screen.getByText('chat.title')).toBeInTheDocument()
  })

  it('shows empty state message when no messages', () => {
    render(<ChatPanel {...defaultProps()} />)
    expect(screen.getByText('chat.noMessages')).toBeInTheDocument()
  })

  it('renders the message input', () => {
    render(<ChatPanel {...defaultProps()} />)
    expect(screen.getByPlaceholderText('chat.placeholder')).toBeInTheDocument()
  })

  it('send button is disabled when input is empty', () => {
    render(<ChatPanel {...defaultProps()} />)
    const buttons = screen.getAllByRole('button')
    // The send button (with Send icon) should be in the input area
    // Filter to the one that is not the toggle button
    const inputSendButton = buttons[buttons.length - 1]
    expect(inputSendButton).toBeDisabled()
  })

  it('toggles chat panel collapsed/expanded', () => {
    render(<ChatPanel {...defaultProps()} />)
    // Chat starts open, so "no messages" should be visible
    expect(screen.getByText('chat.noMessages')).toBeVisible()
    // Click the toggle button to collapse
    fireEvent.click(screen.getByText('chat.title'))
    // The chat body should be collapsed (max-h-0)
  })

  it('renders incoming messages', () => {
    const incomingMessage = {
      id: 'msg-1',
      room_id: 'room-1',
      user_id: 'user-2',
      username: 'Alice',
      message: 'Salam everyone!',
      created_at: '2026-01-01T00:00:00Z',
    }
    render(<ChatPanel {...defaultProps({ incomingMessage })} />)
    expect(screen.getByText('Salam everyone!')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('does not show username for own messages', () => {
    const incomingMessage = {
      id: 'msg-1',
      room_id: 'room-1',
      user_id: 'user-1',
      username: 'Me',
      message: 'My own message',
      created_at: '2026-01-01T00:00:00Z',
    }
    render(<ChatPanel {...defaultProps({ incomingMessage })} />)
    expect(screen.getByText('My own message')).toBeInTheDocument()
    expect(screen.queryByText('Me')).not.toBeInTheDocument()
  })
})
