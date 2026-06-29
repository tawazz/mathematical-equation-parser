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

type ASTNode = NumberNode | BinaryNode | ComparisonNode;

// ── Parse result types ────────────────────────────────────────────────────────

interface ParseSuccess {
  success: true;
  ast: ASTNode;
  result: number | boolean;
}

interface ParseError {
  success: false;
  ast?: undefined;
  result?: undefined;
  error: string;
  position?: { line: number; col: number };
  results?: ASTNode[];
}

type ParseResult = ParseSuccess | ParseError;

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
    return { success: false, error: 'Input must be a string' };
  }

  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

  try {
    parser.feed(input);

    if (parser.results.length === 0) {
      return { success: false, error: 'Could not parse the input' };
    }

    if (parser.results.length > 1) {
      return {
        success: false,
        error: 'Ambiguous grammar — multiple parses found',
        results: parser.results as ASTNode[],
      };
    }

    const ast = parser.results[0] as ASTNode;
    const result = evaluate(ast);

    return { success: true, ast, result };
  } catch (e: unknown) {
    const msg = (e as Error).message;
    let error = msg;
    let position: { line: number; col: number } | null = null;

    const err = e as Record<string, unknown>;

    if (err.token) {
      const token = err.token as { line: number; col: number };
      position = { line: token.line, col: token.col };

      // Nearley parse error — extract just the position for a concise message
      const lines = msg.split('\n');
      const firstLine = lines[0].replace(/^undefined\s*/, '').replace(/:$/, '');
      const posMatch = firstLine.match(/line (\d+) col (\d+)/);
      error = posMatch
        ? `Unexpected token at line ${posMatch[1]}, column ${posMatch[2]}`
        : firstLine;
    } else if (msg.startsWith('invalid syntax')) {
      // Moo lexer error — it includes line:col inline
      const match = msg.match(/line (\d+) col (\d+)/);
      if (match) {
        position = { line: Number(match[1]), col: Number(match[2]) };
      }
      error = `Invalid character at line ${position?.line ?? '?'}, column ${position?.col ?? '?'}`;
    } else if (err.offset !== undefined) {
      // Fallback: try to extract position from offset-based errors
      const inputStr = (parser as unknown as Record<string, unknown>).lexerState as string | undefined;
      if (inputStr && typeof err.offset === 'number') {
        const before = inputStr.slice(0, err.offset);
        const lines = before.split('\n');
        position = { line: lines.length, col: lines[lines.length - 1].length + 1 };
      }
      error = `Unexpected input at line ${position?.line ?? '?'}, column ${position?.col ?? '?'}`;
    }

    return { success: false, error, ...(position ? { position } : {}) };
  }
}
