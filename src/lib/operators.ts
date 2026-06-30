/**
 * Operator registry single source of truth for operator metadata.
 *
 * When adding a new operator:
 *   1. Add a token to `lexer.ts`
 *   2. Add a rule to `grammar.ne`
 *   3. Add an entry here
 *
 * The evaluator and UI read from this registry and need NO changes.
 */

export type OperatorCategory = 'arithmetic' | 'comparison';

export interface OperatorDef {
  /** The raw text symbol as it appears in expressions (e.g. '+', '!=') */
  symbol: string;
  /** The display symbol for UI rendering (e.g. '×', '≠') */
  display: string;
  /** Which AST node type this operator produces */
  astType: 'binary' | 'comparison';
  /** Arithmetic vs comparison grouping */
  category: OperatorCategory;
  /** Evaluation function (receives coerced numeric operands) */
  eval: (left: number, right: number) => number | boolean;
}

const registry: Record<string, OperatorDef> = {
  // Arithmetic
  '+': {
    symbol: '+',
    display: '+',
    astType: 'binary',
    category: 'arithmetic',
    eval: (a, b) => a + b,
  },
  '-': {
    symbol: '-',
    display: '-',
    astType: 'binary',
    category: 'arithmetic',
    eval: (a, b) => a - b,
  },
  '*': {
    symbol: '*',
    display: 'x',
    astType: 'binary',
    category: 'arithmetic',
    eval: (a, b) => a * b,
  },
  '/': {
    symbol: '/',
    display: '÷',
    astType: 'binary',
    category: 'arithmetic',
    eval: (a, b) => {
      if (b === 0) throw new Error('Division by zero');
      return a / b;
    },
  },

  // Comparison
  '=': {
    symbol: '=',
    display: '=',
    astType: 'comparison',
    category: 'comparison',
    eval: (a, b) => a === b,
  },
  '!=': {
    symbol: '!=',
    display: '≠',
    astType: 'comparison',
    category: 'comparison',
    eval: (a, b) => a !== b,
  },
};

export default registry;

/** Look up an operator definition, returning `undefined` for unknown operators. */
export function getOperator(symbol: string): OperatorDef | undefined {
  return registry[symbol];
}
