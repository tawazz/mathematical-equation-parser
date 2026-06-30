/**
 * @jest-environment jsdom
 */
import { describe, it, expect } from '@jest/globals'
import { render, screen } from '../test-utils'
import { AstViewer } from '../../src/components/result/AstViewer'
import type { ASTNode } from '../../src/lib'

describe('AstViewer', () => {
  // ── Leaf nodes ───────────────────────────────────────────────────────────

  it('renders a NumberNode leaf', () => {
    const ast: ASTNode = { type: 'number', value: 42 }

    render(<AstViewer ast={ast} />)

    expect(screen.getByText('Number')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  // ── Binary nodes ─────────────────────────────────────────────────────────

  it('renders a BinaryNode with + operator', () => {
    const ast: ASTNode = {
      type: 'binary',
      operator: '+',
      left: { type: 'number', value: 1 },
      right: { type: 'number', value: 2 },
    }

    render(<AstViewer ast={ast} />)

    expect(screen.getByText('Binary')).toBeInTheDocument()
    expect(screen.getByText('+')).toBeInTheDocument()
    expect(screen.getByText('Left')).toBeInTheDocument()
    expect(screen.getByText('Right')).toBeInTheDocument()
  })

  it('renders BinaryNode with − symbol for subtraction', () => {
    const ast: ASTNode = {
      type: 'binary',
      operator: '-',
      left: { type: 'number', value: 10 },
      right: { type: 'number', value: 3 },
    }

    render(<AstViewer ast={ast} />)

    // Minus sign
    expect(screen.getByText('-')).toBeInTheDocument()
  })

  it('renders BinaryNode with × symbol for multiplication', () => {
    const ast: ASTNode = {
      type: 'binary',
      operator: '*',
      left: { type: 'number', value: 2 },
      right: { type: 'number', value: 3 },
    }

    render(<AstViewer ast={ast} />)

    expect(screen.getByText('x')).toBeInTheDocument()
  })

  it('renders BinaryNode with ÷ symbol for division', () => {
    const ast: ASTNode = {
      type: 'binary',
      operator: '/',
      left: { type: 'number', value: 10 },
      right: { type: 'number', value: 2 },
    }

    render(<AstViewer ast={ast} />)

    expect(screen.getByText('÷')).toBeInTheDocument()
  })

  // ── Comparison nodes ─────────────────────────────────────────────────────

  it('renders ComparisonNode with = operator', () => {
    const ast: ASTNode = {
      type: 'comparison',
      operator: '=',
      left: { type: 'number', value: 5 },
      right: { type: 'number', value: 5 },
    }

    render(<AstViewer ast={ast} />)

    expect(screen.getByText('Comparison')).toBeInTheDocument()
    expect(screen.getByText('=')).toBeInTheDocument()
  })

  it('renders ComparisonNode with ≠ symbol for !=', () => {
    const ast: ASTNode = {
      type: 'comparison',
      operator: '!=',
      left: { type: 'number', value: 5 },
      right: { type: 'number', value: 6 },
    }

    render(<AstViewer ast={ast} />)

    expect(screen.getByText('≠')).toBeInTheDocument()
  })

  // ── Recursive / nested trees ─────────────────────────────────────────────

  it('recursively renders a deeply nested AST (1 + 2 * 3)', () => {
    const ast: ASTNode = {
      type: 'binary',
      operator: '+',
      left: { type: 'number', value: 1 },
      right: {
        type: 'binary',
        operator: '*',
        left: { type: 'number', value: 2 },
        right: { type: 'number', value: 3 },
      },
    }

    render(<AstViewer ast={ast} />)

    // Two Binary labels (root + inner), one Number for each leaf
    expect(screen.getAllByText('Binary')).toHaveLength(2)
    expect(screen.getAllByText('Number')).toHaveLength(3)
    expect(screen.getAllByText('Left')).toHaveLength(2)
    expect(screen.getAllByText('Right')).toHaveLength(2)
  })

  it('renders a comparison with nested arithmetic', () => {
    const ast: ASTNode = {
      type: 'comparison',
      operator: '=',
      left: {
        type: 'binary',
        operator: '+',
        left: { type: 'number', value: 1 },
        right: { type: 'number', value: 2 },
      },
      right: { type: 'number', value: 3 },
    }

    render(<AstViewer ast={ast} />)

    expect(screen.getByText('Comparison')).toBeInTheDocument()
    expect(screen.getByText('Binary')).toBeInTheDocument()
  })

  // Snapshot tests

  it('matches snapshot for a NumberNode leaf', () => {
    const { container } = render(<AstViewer ast={{ type: 'number', value: 42 }} />)
    expect(container).toMatchSnapshot()
  })

  it('matches snapshot for a BinaryNode tree', () => {
    const ast: ASTNode = {
      type: 'binary',
      operator: '+',
      left: { type: 'number', value: 1 },
      right: {
        type: 'binary',
        operator: '*',
        left: { type: 'number', value: 2 },
        right: { type: 'number', value: 3 },
      },
    }
    const { container } = render(<AstViewer ast={ast} />)
    expect(container).toMatchSnapshot()
  })

  it('matches snapshot for a ComparisonNode with nested arithmetic', () => {
    const ast: ASTNode = {
      type: 'comparison',
      operator: '=',
      left: {
        type: 'binary',
        operator: '+',
        left: { type: 'number', value: 1 },
        right: { type: 'number', value: 2 },
      },
      right: { type: 'number', value: 3 },
    }
    const { container } = render(<AstViewer ast={ast} />)
    expect(container).toMatchSnapshot()
  })
})
