import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ClueHistory } from './ClueHistory'

type GuessEntry = { word: string; card_type: string; correct: boolean }
type ClueHistoryEntry = {
  team: 'red' | 'blue'
  clue_word: string
  clue_number: number
  guesses: GuessEntry[]
}

function renderClueHistory(history: ClueHistoryEntry[]) {
  return render(<ClueHistory history={history} />)
}

describe('ClueHistory', () => {
  it('returns null when history is empty', () => {
    const { container } = renderClueHistory([])
    expect(container.innerHTML).toBe('')
  })

  it('renders heading when history is present', () => {
    renderClueHistory([
      { team: 'red', clue_word: 'mosque', clue_number: 2, guesses: [] },
    ])
    expect(screen.getByText('game.codenames.clueHistory')).toBeInTheDocument()
  })

  it('renders entries in reverse order (most recent first)', () => {
    renderClueHistory([
      { team: 'red', clue_word: 'first', clue_number: 1, guesses: [] },
      { team: 'blue', clue_word: 'second', clue_number: 2, guesses: [] },
      { team: 'red', clue_word: 'third', clue_number: 3, guesses: [] },
    ])
    // In timeline layout, clue word and number are in a parent span
    const entries = screen.getAllByText(/\(\d\)/)
    expect(entries[0].closest('.text-sm')?.textContent).toContain('third')
    expect(entries[1].closest('.text-sm')?.textContent).toContain('second')
    expect(entries[2].closest('.text-sm')?.textContent).toContain('first')
  })

  it('shows team color dot - red team gets bg-red-500', () => {
    const { container } = renderClueHistory([
      { team: 'red', clue_word: 'prayer', clue_number: 1, guesses: [] },
    ])
    const dot = container.querySelector('.bg-red-500.rounded-full')
    expect(dot).toBeInTheDocument()
  })

  it('shows clue word and number', () => {
    renderClueHistory([
      { team: 'blue', clue_word: 'charity', clue_number: 4, guesses: [] },
    ])
    // In timeline layout, clue word and number are in separate elements within a parent span
    const parentSpan = screen.getByText(/charity/)
    expect(parentSpan.textContent).toContain('charity')
    expect(parentSpan.textContent).toContain('(4)')
  })

  it('shows correct guess with green styling', () => {
    renderClueHistory([
      {
        team: 'red',
        clue_word: 'faith',
        clue_number: 1,
        guesses: [{ word: 'Quran', card_type: 'red', correct: true }],
      },
    ])
    const guess = screen.getByText('Quran')
    expect(guess).toHaveClass('bg-green-100')
  })

  it('shows incorrect guess with red styling', () => {
    renderClueHistory([
      {
        team: 'red',
        clue_word: 'faith',
        clue_number: 1,
        guesses: [{ word: 'Sand', card_type: 'neutral', correct: false }],
      },
    ])
    const guess = screen.getByText('Sand')
    expect(guess).toHaveClass('bg-red-100')
  })

  it('renders multiple guesses per entry', () => {
    renderClueHistory([
      {
        team: 'blue',
        clue_word: 'worship',
        clue_number: 3,
        guesses: [
          { word: 'Salah', card_type: 'blue', correct: true },
          { word: 'Dua', card_type: 'blue', correct: true },
          { word: 'Fasting', card_type: 'red', correct: false },
        ],
      },
    ])
    expect(screen.getByText('Salah')).toBeInTheDocument()
    expect(screen.getByText('Dua')).toBeInTheDocument()
    expect(screen.getByText('Fasting')).toBeInTheDocument()
  })
})
