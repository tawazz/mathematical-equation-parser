/**
 * @jest-environment jsdom
 */
import { describe, it, expect } from '@jest/globals'
import { render, screen } from '../test-utils'
import { SuccessDisplay } from '../../src/components/result/SuccessDisplay'
import type { ASTNode } from '../../src/lib'

describe('SuccessDisplay', () => {
  it('shows Valid Expression heading', () => {
    render(
      <SuccessDisplay
        success={true}
        ast={{ type: 'number', value: 42 }}
        result={42}
      />,
    )

    expect(screen.getByText('Valid Expression')).toBeInTheDocument()
  })

  it('renders numeric evaluation result', () => {
    render(
      <SuccessDisplay
        success={true}
        ast={{ type: 'number', value: 42 }}
        result={42}
      />,
    )

    // 42 appears both as result value and AST node value
    expect(screen.getAllByText('42')).toHaveLength(2)
  })

  it('renders boolean evaluation result', () => {
    render(
      <SuccessDisplay
        success={true}
        ast={{ type: 'comparison', operator: '=', left: { type: 'number', value: 5 }, right: { type: 'number', value: 5 } }}
        result={true}
      />,
    )

    expect(screen.getByText('true')).toBeInTheDocument()
  })

  it('shows Evaluation Result label', () => {
    render(
      <SuccessDisplay
        success={true}
        ast={{ type: 'number', value: 10 }}
        result={10}
      />,
    )

    expect(screen.getByText('Evaluation Result')).toBeInTheDocument()
  })

  it('shows Abstract Syntax Tree (AST) label', () => {
    render(
      <SuccessDisplay
        success={true}
        ast={{ type: 'number', value: 10 }}
        result={10}
      />,
    )

    expect(screen.getByText('Abstract Syntax Tree (AST)')).toBeInTheDocument()
  })

  it('renders the AstViewer with the given AST', () => {
    const ast: ASTNode = {
      type: 'binary',
      operator: '+',
      left: { type: 'number', value: 1 },
      right: { type: 'number', value: 2 },
    }

    render(<SuccessDisplay success={true} ast={ast} result={3} />)

    expect(screen.getByText('Binary')).toBeInTheDocument()
    expect(screen.getByText('+')).toBeInTheDocument()
    // Number label appears on each leaf node (left + right)
    expect(screen.getAllByText('Number')).toHaveLength(2)
    // Both child number values render
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })
})
