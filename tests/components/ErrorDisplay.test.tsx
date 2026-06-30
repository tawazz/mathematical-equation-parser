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

  // ── New feature tests ─────────────────────────────────────────────────

  it('shows input context with caret marker', () => {
    render(
      <ErrorDisplay
        success={false}
        error="Unexpected token at line 1, column 7"
        position={{ line: 1, col: 7 }}
        input="1 + 2 ="
      />,
    )

    expect(screen.getByText('Input')).toBeInTheDocument()
    expect(screen.getByText('1 + 2 =')).toBeInTheDocument()
    // The caret character ^ should be present
    expect(screen.getByText((content) => content.includes('^'))).toBeInTheDocument()
  })

  it('shows expected tokens when provided', () => {
    render(
      <ErrorDisplay
        success={false}
        error="Parse error"
        expected={["'+'", "'-'", "'number'"]}
      />,
    )

    expect(screen.getByText('Expected')).toBeInTheDocument()
    expect(screen.getByText("'+'")).toBeInTheDocument()
    expect(screen.getByText("'-'")).toBeInTheDocument()
    expect(screen.getByText("'number'")).toBeInTheDocument()
  })

  it('shows suggestion when provided', () => {
    render(
      <ErrorDisplay
        success={false}
        error="Parse error"
        suggestion="Use `*` for multiplication instead of `x` or `×`"
      />,
    )

    expect(screen.getByText('Suggestion')).toBeInTheDocument()
    expect(screen.getByText(/Use.*\*.*multiplication/)).toBeInTheDocument()
  })

  it('shows category badge for each error category', () => {
    const categories: Array<{ category: 'lexer' | 'parser' | 'evaluator'; label: string }> = [
      { category: 'lexer', label: 'Lexer Error' },
      { category: 'parser', label: 'Parser Error' },
      { category: 'evaluator', label: 'Evaluator Error' },
    ]

    for (const { category, label } of categories) {
      const { unmount } = render(
        <ErrorDisplay
          success={false}
          error="Something went wrong"
          category={category}
        />,
      )
      expect(screen.getByText(label)).toBeInTheDocument()
      unmount()
    }
  })

  it('hides position section when input context is shown', () => {
    render(
      <ErrorDisplay
        success={false}
        error="Parse error"
        position={{ line: 1, col: 5 }}
        input="1 + 2 ="
      />,
    )

    // Input context should be visible
    expect(screen.getByText('Input')).toBeInTheDocument()

    // Standalone position section should be hidden (replaced by input context)
    expect(screen.queryByText('Position')).not.toBeInTheDocument()
  })
})
