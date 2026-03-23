import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { HintButton } from '../HintButton'

describe('HintButton', () => {
  it('renders the info button when hint is provided', () => {
    render(<HintButton hint="This is an explanation" />)
    expect(screen.getByLabelText('Show explanation')).toBeInTheDocument()
  })

  it('renders nothing when hint is null', () => {
    const { container } = render(<HintButton hint={null} />)
    expect(container.innerHTML).toBe('')
  })

  it('calls onView when popover is opened', () => {
    const onView = vi.fn()
    render(<HintButton hint="Some hint" onView={onView} />)
    fireEvent.click(screen.getByLabelText('Show explanation'))
    expect(onView).toHaveBeenCalledOnce()
  })

  it('calls onView only once across multiple opens', () => {
    const onView = vi.fn()
    render(<HintButton hint="Some hint" onView={onView} />)
    fireEvent.click(screen.getByLabelText('Show explanation'))
    fireEvent.click(screen.getByLabelText('Show explanation'))
    expect(onView).toHaveBeenCalledOnce()
  })
})
