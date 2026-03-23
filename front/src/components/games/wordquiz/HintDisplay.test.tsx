import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HintDisplay } from './HintDisplay'

const hints = ['A place of worship', 'Has a dome', 'Muslims pray here', 'Contains a mihrab']

describe('HintDisplay', () => {
  it('renders the hints heading', () => {
    render(<HintDisplay hints={hints} hintsRevealed={2} maxHints={6} />)
    expect(screen.getByText('game.wordQuiz.hint')).toBeInTheDocument()
  })

  it('renders hint counter', () => {
    render(<HintDisplay hints={hints} hintsRevealed={2} maxHints={6} />)
    expect(screen.getByText('game.wordQuiz.hintNumber')).toBeInTheDocument()
  })

  it('only shows hints up to hintsRevealed count', () => {
    render(<HintDisplay hints={hints} hintsRevealed={2} maxHints={6} />)
    expect(screen.getByText('A place of worship')).toBeInTheDocument()
    expect(screen.getByText('Has a dome')).toBeInTheDocument()
    expect(screen.queryByText('Muslims pray here')).not.toBeInTheDocument()
    expect(screen.queryByText('Contains a mihrab')).not.toBeInTheDocument()
  })

  it('shows all hints when hintsRevealed equals total', () => {
    render(<HintDisplay hints={hints} hintsRevealed={4} maxHints={4} />)
    expect(screen.getByText('A place of worship')).toBeInTheDocument()
    expect(screen.getByText('Has a dome')).toBeInTheDocument()
    expect(screen.getByText('Muslims pray here')).toBeInTheDocument()
    expect(screen.getByText('Contains a mihrab')).toBeInTheDocument()
  })

  it('renders hint numbers (#1, #2, etc.)', () => {
    render(<HintDisplay hints={hints} hintsRevealed={2} maxHints={6} />)
    expect(screen.getByText('#1')).toBeInTheDocument()
    expect(screen.getByText('#2')).toBeInTheDocument()
  })
})
