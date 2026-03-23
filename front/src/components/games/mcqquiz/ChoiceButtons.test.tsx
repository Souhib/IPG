import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ChoiceButtons } from './ChoiceButtons'

const choices = ['Makkah', 'Madinah', 'Jerusalem', 'Damascus']

function defaultProps(overrides: Record<string, unknown> = {}) {
  return {
    choices,
    onSelect: vi.fn(),
    disabled: false,
    selectedIndex: null,
    correctIndex: null,
    roundPhase: 'answering',
    ...overrides,
  }
}

describe('ChoiceButtons', () => {
  it('renders all choices with labels', () => {
    render(<ChoiceButtons {...defaultProps()} />)
    expect(screen.getByText('Makkah')).toBeInTheDocument()
    expect(screen.getByText('Madinah')).toBeInTheDocument()
    expect(screen.getByText('Jerusalem')).toBeInTheDocument()
    expect(screen.getByText('Damascus')).toBeInTheDocument()
  })

  it('renders A, B, C, D labels', () => {
    render(<ChoiceButtons {...defaultProps()} />)
    expect(screen.getByLabelText('A: Makkah')).toBeInTheDocument()
    expect(screen.getByLabelText('B: Madinah')).toBeInTheDocument()
    expect(screen.getByLabelText('C: Jerusalem')).toBeInTheDocument()
    expect(screen.getByLabelText('D: Damascus')).toBeInTheDocument()
  })

  it('calls onSelect with index when choice is clicked', () => {
    const onSelect = vi.fn()
    render(<ChoiceButtons {...defaultProps({ onSelect })} />)
    fireEvent.click(screen.getByLabelText('B: Madinah'))
    expect(onSelect).toHaveBeenCalledWith(1)
  })

  it('does not call onSelect when disabled', () => {
    const onSelect = vi.fn()
    render(<ChoiceButtons {...defaultProps({ onSelect, disabled: true })} />)
    fireEvent.click(screen.getByLabelText('A: Makkah'))
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('marks selected choice with aria-checked', () => {
    render(<ChoiceButtons {...defaultProps({ selectedIndex: 2 })} />)
    expect(screen.getByLabelText('C: Jerusalem')).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByLabelText('A: Makkah')).toHaveAttribute('aria-checked', 'false')
  })

  it('shows correct answer styling during results phase', () => {
    const { container } = render(
      <ChoiceButtons {...defaultProps({ roundPhase: 'results', correctIndex: 0, selectedIndex: 1 })} />,
    )
    const buttons = container.querySelectorAll('[role="radio"]')
    // Correct answer (index 0) should have emerald styling
    expect(buttons[0].className).toContain('bg-emerald-500/15')
    // Wrong selected answer (index 1) should have destructive styling
    expect(buttons[1].className).toContain('bg-destructive/10')
  })
})
