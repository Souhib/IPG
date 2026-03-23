import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { QuestionDisplay } from './QuestionDisplay'

describe('QuestionDisplay', () => {
  it('renders the question text', () => {
    render(<QuestionDisplay question="What is the first pillar of Islam?" currentRound={1} totalRounds={10} />)
    expect(screen.getByText('What is the first pillar of Islam?')).toBeInTheDocument()
  })

  it('renders the round counter', () => {
    render(<QuestionDisplay question="Test question" currentRound={3} totalRounds={10} />)
    expect(screen.getByText('game.mcqQuiz.round')).toBeInTheDocument()
  })

  it('renders question in an h2 heading', () => {
    render(<QuestionDisplay question="Who built the Kaaba?" currentRound={1} totalRounds={5} />)
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveTextContent('Who built the Kaaba?')
  })
})
