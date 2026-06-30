/**
 * @jest-environment jsdom
 */
import { describe, it, expect } from '@jest/globals'
import { render, screen } from '../test-utils'
import { ErrorDisplay } from '../../src/components/result/ErrorDisplay'

describe('ErrorDisplay', () => {
  it('shows Invalid Expression heading', () => {
    render(<ErrorDisplay success={false} error="Something went wrong" />)

    expect(screen.getByText('Invalid Expression')).toBeInTheDocument()
  })

  it('displays the error message', () => {
    render(<ErrorDisplay success={false} error="Unexpected token at line 1, column 5" />)

    expect(screen.getByText('Unexpected token at line 1, column 5')).toBeInTheDocument()
  })

  it('renders position when provided', () => {
    render(
      <ErrorDisplay
        success={false}
        error="Parse error"
        position={{ line: 3, col: 12 }}
      />,
    )

    expect(screen.getByText('Line')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Column')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('does not render position section when position is absent', () => {
    render(<ErrorDisplay success={false} error="Parse error" />)

    // "Error" heading should still be present
    expect(screen.getByText('Error')).toBeInTheDocument()

    // Position-related elements should not exist
    expect(screen.queryByText('Position')).not.toBeInTheDocument()
    expect(screen.queryByText('Line')).not.toBeInTheDocument()
    expect(screen.queryByText('Column')).not.toBeInTheDocument()
  })
})
