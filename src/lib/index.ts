import nearley from 'nearley';
import grammar from './grammar';
import { generateSuggestion } from './suggestions';
import { getOperator } from './operators';

// AST type definitions

interface NumberNode {
  type: 'number';
  value: number;
}

interface BinaryNode {
  type: 'binary';
  operator: string;
  left: ASTNode;
  right: ASTNode;
}

interface ComparisonNode {
  type: 'comparison';
  operator: string;
  left: ASTNode;
  right: ASTNode;
}

export type ASTNode = NumberNode | BinaryNode | ComparisonNode;

// ── Parse result types ────────────────────────────────────────────────────────

export interface ParseSuccess {
  success: true;
  ast: ASTNode;
  result: number | boolean;
}

export type ErrorCategory = 'lexer' | 'parser' | 'evaluator';

export interface ParseError {
  success: false;
  ast?: undefined;
  result?: undefined;
  error: string;
  position?: { line: number; col: number };
  results?: ASTNode[];
  input?: string;
  expected?: string[];
  suggestion?: string;
  category?: ErrorCategory;
}

export type ParseResult = ParseSuccess | ParseError;

// Custom evaluator error

class EvaluatorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EvaluatorError';
  }
}

// Evaluator

/**
 * Evaluate an AST node and return its value.
 * - Arithmetic nodes return numbers.
 * - Comparison nodes return booleans.
 */
function evaluate(node: ASTNode): number | boolean {
  switch (node.type) {
    case 'number':
      return node.value;

    case 'binary':
    case 'comparison': {
      const left = evaluate(node.left) as number;
      const right = evaluate(node.right) as number;
      const op = getOperator(node.operator);
      if (!op) {
        throw new EvaluatorError(`Unknown operator: ${node.operator}`);
      }
      try {
        return op.eval(left, right);
      } catch (e: unknown) {
        throw new EvaluatorError((e as Error).message);
      }
    }

    default:
      throw new EvaluatorError(`Unknown AST node type: ${(node as ASTNode).type}`);
  }
}

// Parser

/**
 * Parse an input string and return the result.
 *
 * @param input - The expression to parse.
 */
export function parse(input: string): ParseResult {
  if (typeof input !== 'string') {
    return { success: false, error: 'Input must be a string', input };
  }

  // Early exit for empty input
  if (input.trim().length === 0) {
    return {
      success: false,
      error: 'Empty input, nothing to parse',
      input,
      suggestion: 'Enter a mathematical expression, e.g. `1 + 2 = 3`',
      category: 'lexer',
    };
  }

  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

  try {
    parser.feed(input);

    if (parser.results.length === 0) {
      return {
        success: false,
        error: 'Could not parse the input',
        input,
        suggestion: generateSuggestion(input),
      };
    }

    if (parser.results.length > 1) {
      return {
        success: false,
        error: 'Ambiguous grammar — multiple parses found',
        results: parser.results as ASTNode[],
        input,
      };
    }

    const ast = parser.results[0] as ASTNode;
    const result = evaluate(ast);

    return { success: true, ast, result };
  } catch (e: unknown) {
    const err = e as Record<string, unknown>;
    const errorObj = e as Error;

    let error: string = errorObj.message;
    let position: { line: number; col: number } | undefined;
    let expected: string[] | undefined;
    let category: ErrorCategory = 'parser';
    const suggestion: string | undefined = generateSuggestion(input);

    // Extract expected tokens from Nearley error
    if (Array.isArray(err.expected)) {
      expected = err.expected.map((exp: unknown) => {
        const e = exp as { type?: string; value?: unknown; symbol?: string };
        if (e.type === 'token') return `'${String(e.value ?? e.symbol ?? '?')}'`;
        return String(e.value ?? e.symbol ?? '?');
      });
    }

    if (errorObj instanceof EvaluatorError) {
      // Evaluator error — from our own evaluate() function
      category = 'evaluator';
      if (errorObj.message === 'Division by zero') {
        error = 'Division by zero';
      }
    } else if (err.token) {
      // Nearley parser error (unexpected token)
      const token = err.token as { line: number; col: number; value?: string };
      position = { line: token.line, col: token.col };
      category = 'parser';

      const tokenVal = (token as { value?: string }).value;
      const displayToken = tokenVal ? `'${tokenVal}'` : 'end of input';
      const expectedHint = expected && expected.length > 0
        ? `. Expected one of: ${expected.slice(0, 5).join(', ')}${expected.length > 5 ? ', …' : ''}`
        : '';
      error = `Unexpected ${displayToken} at line ${position.line}, column ${position.col}${expectedHint}`;
    } else if (typeof err.line === 'number' && typeof err.col === 'number' && typeof err.offset === 'number') {
      // Moo lexer error (invalid character) — Moo puts line/col/offset directly on Error
      category = 'lexer';
      position = { line: err.line as number, col: err.col as number };
      error = `Invalid character at line ${position.line}, column ${position.col}`;
    } else if (typeof err.offset === 'number') {
      const mooMatch = errorObj.message.match(/invalid syntax at line (\d+) col (\d+)/);
      if (mooMatch) {
        category = 'lexer';
        position = { line: parseInt(mooMatch[1], 10), col: parseInt(mooMatch[2], 10) };
        error = `Invalid character at line ${position.line}, column ${position.col}`;
      } else {
        error = errorObj.message;
      }
    }

    return {
      success: false,
      error,
      input,
      ...(position ? { position } : {}),
      ...(expected && expected.length > 0 ? { expected } : {}),
      ...(suggestion ? { suggestion } : {}),
      category,
    };
  }
}


