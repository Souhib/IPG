import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AnswerInput } from './AnswerInput'

function defaultProps(overrides: Record<string, unknown> = {}) {
  return {
    onSubmit: vi.fn().mockResolvedValue({ correct: false, points_earned: 0 }),
    disabled: false,
    answered: false,
    pointsEarned: 0,
    ...overrides,
  }
}

describe('AnswerInput', () => {
  it('renders the text input and submit button', () => {
    render(<AnswerInput {...defaultProps()} />)
    expect(screen.getByLabelText('game.wordQuiz.typeYourAnswer')).toBeInTheDocument()
    expect(screen.getByLabelText('game.wordQuiz.submitAnswer')).toBeInTheDocument()
  })

  it('submit button is disabled when input is empty', () => {
    render(<AnswerInput {...defaultProps()} />)
    expect(screen.getByLabelText('game.wordQuiz.submitAnswer')).toBeDisabled()
  })

  it('submit button is enabled when input has text', () => {
    render(<AnswerInput {...defaultProps()} />)
    fireEvent.change(screen.getByLabelText('game.wordQuiz.typeYourAnswer'), { target: { value: 'Quran' } })
    expect(screen.getByLabelText('game.wordQuiz.submitAnswer')).not.toBeDisabled()
  })

  it('calls onSubmit with trimmed input on form submit', () => {
    const onSubmit = vi.fn().mockResolvedValue({ correct: true, points_earned: 5 })
    render(<AnswerInput {...defaultProps({ onSubmit })} />)
    fireEvent.change(screen.getByLabelText('game.wordQuiz.typeYourAnswer'), { target: { value: '  Quran  ' } })
    fireEvent.submit(screen.getByLabelText('game.wordQuiz.typeYourAnswer').closest('form')!)
    expect(onSubmit).toHaveBeenCalledWith('Quran')
  })

  it('shows correct answer state when answered is true', () => {
    render(<AnswerInput {...defaultProps({ answered: true, pointsEarned: 5 })} />)
    expect(screen.getByText('game.wordQuiz.correct')).toBeInTheDocument()
    expect(screen.getByText('game.wordQuiz.pointsEarned')).toBeInTheDocument()
    expect(screen.queryByLabelText('game.wordQuiz.typeYourAnswer')).not.toBeInTheDocument()
  })

  it('input is disabled when disabled prop is true', () => {
    render(<AnswerInput {...defaultProps({ disabled: true })} />)
    expect(screen.getByLabelText('game.wordQuiz.typeYourAnswer')).toBeDisabled()
  })
})
