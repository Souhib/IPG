import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { GameErrorFallback } from '../GameErrorFallback'

const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

describe('GameErrorFallback', () => {
  it('renders error heading', () => {
    render(<GameErrorFallback />)
    expect(screen.getByText('common.error')).toBeInTheDocument()
  })

  it('renders error message when error is provided', () => {
    render(<GameErrorFallback error={new Error('Something went wrong')} />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('does not render error message when no error', () => {
    const { container } = render(<GameErrorFallback />)
    const paragraphs = container.querySelectorAll('p')
    // Only the heading text, no error message paragraph
    const errorParagraphs = Array.from(paragraphs).filter((p) => p.classList.contains('text-muted-foreground'))
    expect(errorParagraphs).toHaveLength(0)
  })

  it('renders retry button when onReset is provided', () => {
    render(<GameErrorFallback onReset={vi.fn()} />)
    expect(screen.getByText('common.retry')).toBeInTheDocument()
  })

  it('does not render retry button when onReset is not provided', () => {
    render(<GameErrorFallback />)
    expect(screen.queryByText('common.retry')).not.toBeInTheDocument()
  })

  it('calls onReset when retry button is clicked', () => {
    const onReset = vi.fn()
    render(<GameErrorFallback onReset={onReset} />)
    fireEvent.click(screen.getByText('common.retry'))
    expect(onReset).toHaveBeenCalledOnce()
  })

  it('renders back to room button', () => {
    render(<GameErrorFallback />)
    expect(screen.getByText('game.backToRoom')).toBeInTheDocument()
  })

  it('navigates to /rooms when back button is clicked', () => {
    render(<GameErrorFallback />)
    fireEvent.click(screen.getByText('game.backToRoom'))
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/rooms' })
  })
})
