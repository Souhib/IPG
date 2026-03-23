import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { RoundResults } from './RoundResults'

const roundResults = [
  { user_id: 'u1', username: 'Alice', answered_at_hint: 2, points: 5 },
  { user_id: 'u2', username: 'Bob', answered_at_hint: null, points: 0 },
  { user_id: 'u3', username: 'Charlie', answered_at_hint: 4, points: 3 },
]

function defaultProps(overrides: Record<string, unknown> = {}) {
  return {
    correctAnswer: 'Mosque',
    explanation: 'A mosque is a place of worship for Muslims.',
    roundResults,
    isHost: false,
    onNextRound: vi.fn(),
    isAdvancing: false,
    ...overrides,
  }
}

describe('RoundResults', () => {
  it('displays the correct answer', () => {
    render(<RoundResults {...defaultProps()} />)
    expect(screen.getByText('Mosque')).toBeInTheDocument()
  })

  it('displays the explanation when provided', () => {
    render(<RoundResults {...defaultProps()} />)
    expect(screen.getByText('A mosque is a place of worship for Muslims.')).toBeInTheDocument()
  })

  it('does not display explanation when null', () => {
    render(<RoundResults {...defaultProps({ explanation: null })} />)
    expect(screen.queryByText('A mosque is a place of worship for Muslims.')).not.toBeInTheDocument()
  })

  it('renders all player results sorted by points descending', () => {
    const { container } = render(<RoundResults {...defaultProps()} />)
    const names = container.querySelectorAll('.font-medium')
    expect(names[0].textContent).toBe('Alice')
    expect(names[1].textContent).toBe('Charlie')
    expect(names[2].textContent).toBe('Bob')
  })

  it('shows "not answered" for players who did not answer', () => {
    render(<RoundResults {...defaultProps()} />)
    expect(screen.getByText('game.wordQuiz.notAnswered')).toBeInTheDocument()
  })

  it('shows next round button only for host', () => {
    render(<RoundResults {...defaultProps({ isHost: true })} />)
    expect(screen.getByText('game.wordQuiz.nextRound')).toBeInTheDocument()
  })

  it('hides next round button for non-host', () => {
    render(<RoundResults {...defaultProps({ isHost: false })} />)
    expect(screen.queryByText('game.wordQuiz.nextRound')).not.toBeInTheDocument()
  })

  it('calls onNextRound when next round button is clicked', () => {
    const onNextRound = vi.fn()
    render(<RoundResults {...defaultProps({ isHost: true, onNextRound })} />)
    fireEvent.click(screen.getByText('game.wordQuiz.nextRound'))
    expect(onNextRound).toHaveBeenCalledOnce()
  })

  it('disables next round button when isAdvancing is true', () => {
    render(<RoundResults {...defaultProps({ isHost: true, isAdvancing: true })} />)
    expect(screen.getByText('common.loading')).toBeDisabled()
  })
})
