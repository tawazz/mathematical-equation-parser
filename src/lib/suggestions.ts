/**
 * Error suggestion engine for common mathematical expression mistakes.
 * Returns a human-readable suggestion when the input contains a detectable error pattern.
 */
export function generateSuggestion(input: string): string | undefined {
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
