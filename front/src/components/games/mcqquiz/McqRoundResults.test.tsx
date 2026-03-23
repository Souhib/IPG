import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { McqRoundResults } from './McqRoundResults'

const roundResults = [
  { user_id: 'u1', username: 'Alice', chose_correct: true, points: 1 },
  { user_id: 'u2', username: 'Bob', chose_correct: false, points: 0 },
]

function defaultProps(overrides: Record<string, unknown> = {}) {
  return {
    explanation: 'The Shahada is the first pillar of Islam.',
    roundResults,
    isHost: false,
    onNextRound: vi.fn(),
    isAdvancing: false,
    ...overrides,
  }
}

describe('McqRoundResults', () => {
  it('renders the explanation when provided', () => {
    render(<McqRoundResults {...defaultProps()} />)
    expect(screen.getByText('The Shahada is the first pillar of Islam.')).toBeInTheDocument()
    expect(screen.getByText('game.mcqQuiz.explanation')).toBeInTheDocument()
  })

  it('does not render explanation when null', () => {
    render(<McqRoundResults {...defaultProps({ explanation: null })} />)
    expect(screen.queryByText('game.mcqQuiz.explanation')).not.toBeInTheDocument()
  })

  it('renders all player results', () => {
    render(<McqRoundResults {...defaultProps()} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('shows correct/wrong labels for each player', () => {
    render(<McqRoundResults {...defaultProps()} />)
    expect(screen.getByText('game.mcqQuiz.correctAnswer')).toBeInTheDocument()
    expect(screen.getByText('game.mcqQuiz.wrongAnswer')).toBeInTheDocument()
  })

  it('shows next round button only for host', () => {
    render(<McqRoundResults {...defaultProps({ isHost: true })} />)
    expect(screen.getByText('game.mcqQuiz.nextRound')).toBeInTheDocument()
  })

  it('hides next round button for non-host', () => {
    render(<McqRoundResults {...defaultProps({ isHost: false })} />)
    expect(screen.queryByText('game.mcqQuiz.nextRound')).not.toBeInTheDocument()
  })

  it('calls onNextRound when clicked', () => {
    const onNextRound = vi.fn()
    render(<McqRoundResults {...defaultProps({ isHost: true, onNextRound })} />)
    fireEvent.click(screen.getByText('game.mcqQuiz.nextRound'))
    expect(onNextRound).toHaveBeenCalledOnce()
  })

  it('disables button when isAdvancing', () => {
    render(<McqRoundResults {...defaultProps({ isHost: true, isAdvancing: true })} />)
    expect(screen.getByText('common.loading')).toBeDisabled()
  })
})
