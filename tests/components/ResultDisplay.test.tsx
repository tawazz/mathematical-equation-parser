/**
 * @jest-environment jsdom
 */
import { describe, it, expect } from '@jest/globals'
import { render, screen } from '../test-utils'
import { ResultDisplay } from '../../src/components/result/ResultDisplay'
import type { ParseSuccess, ParseError } from '../../src/lib'

describe('ResultDisplay', () => {
  it('renders SuccessDisplay when result is successful', () => {
    const successResult: ParseSuccess = {
      success: true,
      ast: { type: 'number', value: 42 },
      result: 42,
    }

    render(<ResultDisplay result={successResult} />)

    expect(screen.getByText('Valid Expression')).toBeInTheDocument()
    expect(screen.getAllByText('42')).toHaveLength(2) // result + AST node
  })

  it('renders ErrorDisplay when result is a failure', () => {
    const errorResult: ParseError = {
      success: false,
      error: 'Unexpected token',
      position: { line: 1, col: 5 },
    }

    render(<ResultDisplay result={errorResult} />)

    expect(screen.getByText('Invalid Expression')).toBeInTheDocument()
    expect(screen.getByText('Unexpected token')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })
})
