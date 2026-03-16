import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>,
  },
}))

import { QuizGameOver } from '../QuizGameOver'

const leaderboard = [
  { user_id: 'u1', username: 'Alice', total_score: 10 },
  { user_id: 'u2', username: 'Bob', total_score: 20 },
  { user_id: 'u3', username: 'Charlie', total_score: 15 },
]

const defaultProps = {
  winner: 'Bob',
  leaderboard,
  onBackToRoom: vi.fn(),
  onLeaveRoom: vi.fn(),
}

describe('QuizGameOver', () => {
  it('renders winner announcement when winner is provided', () => {
    render(<QuizGameOver {...defaultProps} />)
    expect(screen.getByText('game.winner')).toBeInTheDocument()
  })

  it('does not render winner announcement when winner is null', () => {
    render(<QuizGameOver {...defaultProps} winner={null} />)
    expect(screen.queryByText('game.winner')).not.toBeInTheDocument()
  })

  it('renders final scores heading with default i18n key', () => {
    render(<QuizGameOver {...defaultProps} />)
    expect(screen.getByText('game.finalScores')).toBeInTheDocument()
  })

  it('renders custom i18n keys when provided', () => {
    render(
      <QuizGameOver
        {...defaultProps}
        winnerI18nKey="game.wordQuiz.winner"
        finalScoresI18nKey="game.wordQuiz.finalScores"
        backToRoomI18nKey="game.wordQuiz.backToRoom"
      />,
    )
    expect(screen.getByText('game.wordQuiz.winner')).toBeInTheDocument()
    expect(screen.getByText('game.wordQuiz.finalScores')).toBeInTheDocument()
    expect(screen.getByText('game.wordQuiz.backToRoom')).toBeInTheDocument()
  })

  it('renders all leaderboard entries', () => {
    render(<QuizGameOver {...defaultProps} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Charlie')).toBeInTheDocument()
  })

  it('sorts leaderboard by total_score descending', () => {
    const { container } = render(<QuizGameOver {...defaultProps} />)
    const names = container.querySelectorAll('.text-sm.font-medium')
    expect(names[0].textContent).toBe('Bob')
    expect(names[1].textContent).toBe('Charlie')
    expect(names[2].textContent).toBe('Alice')
  })

  it('renders rank numbers', () => {
    render(<QuizGameOver {...defaultProps} />)
    expect(screen.getByText('#1')).toBeInTheDocument()
    expect(screen.getByText('#2')).toBeInTheDocument()
    expect(screen.getByText('#3')).toBeInTheDocument()
  })

  it('renders scores for each entry', () => {
    render(<QuizGameOver {...defaultProps} />)
    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('calls onBackToRoom when back button is clicked', () => {
    const onBackToRoom = vi.fn()
    render(<QuizGameOver {...defaultProps} onBackToRoom={onBackToRoom} />)
    fireEvent.click(screen.getByText('game.backToRoom'))
    expect(onBackToRoom).toHaveBeenCalledOnce()
  })

  it('calls onLeaveRoom when leave button is clicked', () => {
    const onLeaveRoom = vi.fn()
    render(<QuizGameOver {...defaultProps} onLeaveRoom={onLeaveRoom} />)
    fireEvent.click(screen.getByText('room.leave'))
    expect(onLeaveRoom).toHaveBeenCalledOnce()
  })

  it('renders with empty leaderboard', () => {
    render(<QuizGameOver {...defaultProps} leaderboard={[]} />)
    expect(screen.getByText('game.finalScores')).toBeInTheDocument()
  })
})
