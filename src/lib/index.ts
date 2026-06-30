import nearley from 'nearley';
import grammar from './grammar';

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

    case 'binary': {
      const left = evaluate(node.left);
      const right = evaluate(node.right);
      switch (node.operator) {
        case '+': return (left as number) + (right as number);
        case '-': return (left as number) - (right as number);
        case '*': return (left as number) * (right as number);
        case '/':
          if (right === 0) throw new Error('Division by zero');
          return (left as number) / (right as number);
        default:
          throw new Error(`Unknown arithmetic operator: ${node.operator}`);
      }
    }

    case 'comparison': {
      const left = evaluate(node.left);
      const right = evaluate(node.right);
      switch (node.operator) {
        case '=':  return left === right;
        case '!=': return left !== right;
        default:
          throw new Error(`Unknown comparison operator: ${node.operator}`);
      }
    }

    default:
      throw new Error(`Unknown AST node type: ${(node as ASTNode).type}`);
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
    const msg = (e as Error).message;
    const err = e as Record<string, unknown>;
    let error: string = msg;
    let position: { line: number; col: number } | undefined;
    let expected: string[] | undefined;
    let category: ErrorCategory = 'parser';
    let suggestion: string | undefined;

    // Extract expected tokens from Nearley error
    if (Array.isArray(err.expected)) {
      expected = err.expected.map((exp: unknown) => {
        const e = exp as { type?: string; value?: unknown; symbol?: string };
        if (e.type === 'token') return `'${String(e.value ?? e.symbol ?? '?')}'`;
        return String(e.value ?? e.symbol ?? '?');
      });
    }

    if (err.token) {
      // Nearley parser error (unexpected token)
      const token = err.token as { line: number; col: number; value?: string };
      position = { line: token.line, col: token.col };
      category = 'parser';

      // Build a concise but informative message
      const tokenVal = (token as { value?: string }).value;
      const displayToken = tokenVal ? `'${tokenVal}'` : 'end of input';
      const expectedHint = expected && expected.length > 0
        ? `. Expected one of: ${expected.slice(0, 5).join(', ')}${expected.length > 5 ? ', …' : ''}`
        : '';
      error = `Unexpected ${displayToken} at line ${position.line}, column ${position.col}${expectedHint}`;
    } else if (msg.startsWith('invalid syntax')) {
      // Moo lexer error (invalid character)
      category = 'lexer';
      const match = msg.match(/line (\d+) col (\d+)/);
      if (match) {
        position = { line: Number(match[1]), col: Number(match[2]) };
      }
      error = `Invalid character at line ${position?.line ?? '?'}, column ${position?.col ?? '?'}`;
    } else if (err.offset !== undefined) {
      // Fallback: offset-based error
      category = 'parser';
      const inputStr = (parser as unknown as Record<string, unknown>).lexerState as string | undefined;
      if (inputStr && typeof err.offset === 'number') {
        const before = inputStr.slice(0, err.offset);
        const lines = before.split('\n');
        position = { line: lines.length, col: lines[lines.length - 1].length + 1 };
      }
      error = `Unexpected input at line ${position?.line ?? '?'}, column ${position?.col ?? '?'}`;
    } else if (msg.startsWith('Division by zero')) {
      // Evaluator error
      category = 'evaluator';
      error = 'Division by zero';
    } else if (msg.startsWith('Unknown')) {
      category = 'evaluator';
    }

    // Generate suggestions for common mistakes
    suggestion = generateSuggestion(input);

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

// Error Suggestion engine

function generateSuggestion(input: string): string | undefined {
  if (!input || input.trim().length === 0) {
    return 'Enter a mathematical expression, e.g. `1 + 2 = 3`';
  }

  const trimmed = input.trim();

  if (/[x×]/.test(trimmed) && !trimmed.includes('*')) {
    return 'Use `*` for multiplication instead of `x` or `×`';
  }
  if (trimmed.includes('÷')) {
    return 'Use `/` for division instead of `÷`';
  }
  if (trimmed.includes('==')) {
    return 'Use a single `=` for equality comparison (our grammar uses `=` not `==`)';
  }
  if (/[\^]/.test(trimmed)) {
    return 'Exponentiation (`^`) is not currently supported';
  }
  if (trimmed.includes('**')) {
    return 'Exponentiation (`**`) is not currently supported';
  }

  // Check for letters (variables) — not supported
  if (/[a-zA-Z]/.test(trimmed)) {
    return 'Variables or letters are not supported. Only numbers, operators, and parentheses are allowed.';
  }

  // Check for unmatched parentheses
  let depth = 0;
  for (const ch of trimmed) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
  }
  if (depth > 0) return 'Missing closing parenthesis `)`';
  if (depth < 0) return 'Missing opening parenthesis `(`';

  // Decimal without leading digit
  if (/\.\d/.test(trimmed) && !/^\d/.test(trimmed)) {
    return 'Numbers must start with a digit. Use `0.5` instead of `.5`';
  }

  return undefined;
}
