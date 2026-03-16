import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PlayerScoreboard } from '../PlayerScoreboard'

const players = [
  { user_id: 'u1', username: 'Alice', total_score: 10, current_round_answered: true, current_round_points: 3 },
  { user_id: 'u2', username: 'Bob', total_score: 20, current_round_answered: false, current_round_points: 0 },
  { user_id: 'u3', username: 'Charlie', total_score: 15, current_round_answered: true, current_round_points: 5 },
]

describe('PlayerScoreboard', () => {
  it('renders the players heading', () => {
    render(<PlayerScoreboard players={players} />)
    expect(screen.getByText('room.players')).toBeInTheDocument()
  })

  it('renders all player usernames', () => {
    render(<PlayerScoreboard players={players} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Charlie')).toBeInTheDocument()
  })

  it('renders player scores', () => {
    render(<PlayerScoreboard players={players} />)
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
  })

  it('sorts players by total_score descending', () => {
    const { container } = render(<PlayerScoreboard players={players} />)
    const names = container.querySelectorAll('.font-medium')
    expect(names[0].textContent).toBe('Bob')
    expect(names[1].textContent).toBe('Charlie')
    expect(names[2].textContent).toBe('Alice')
  })

  it('highlights the current user row', () => {
    const { container } = render(<PlayerScoreboard players={players} currentUserId="u2" />)
    const rows = container.querySelectorAll('.flex.items-center.justify-between')
    // Bob is sorted first (highest score), and is the current user
    expect(rows[0].className).toContain('bg-primary/5')
    expect(rows[0].className).toContain('border-primary/20')
  })

  it('does not highlight rows for other users', () => {
    const { container } = render(<PlayerScoreboard players={players} currentUserId="u2" />)
    const rows = container.querySelectorAll('.flex.items-center.justify-between')
    // Charlie (index 1) and Alice (index 2) should not be highlighted
    expect(rows[1].className).not.toContain('bg-primary/5')
    expect(rows[2].className).not.toContain('bg-primary/5')
  })

  it('renders avatar initials in uppercase', () => {
    const { container } = render(<PlayerScoreboard players={players} />)
    const avatars = container.querySelectorAll('.rounded-full')
    expect(avatars[0].textContent).toBe('B')  // Bob (sorted first)
    expect(avatars[1].textContent).toBe('C')  // Charlie
    expect(avatars[2].textContent).toBe('A')  // Alice
  })

  it('renders with empty players array', () => {
    render(<PlayerScoreboard players={[]} />)
    expect(screen.getByText('room.players')).toBeInTheDocument()
  })
})
