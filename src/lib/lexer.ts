import moo from 'moo';

const rawLexer = moo.compile({
  number: { match: /[0-9]+(?:\.[0-9]+)?/, value: (s: string) => Number(s) as unknown as string },
  ws:      { match: /\s+/, lineBreaks: true },
  plus:    '+',
  minus:   '-',
  times:   '*',
  divide:  '/',
  eq:      '=',
  neq:     '!=',
  lparen:  '(',
  rparen:  ')',
});

/**
 * Wrap the raw moo lexer so that Nearley never sees whitespace tokens.
 * Moo and Nearley both use .next() — we simply skip any ws tokens here.
 */
function createLexerWrapper(raw: moo.Lexer): moo.Lexer {
  const wrapper: moo.Lexer = {
    ...raw,
    reset(chunk?: string) {
      raw.reset(chunk);
      return wrapper;
    },
    next() {
      let tok = raw.next();
      while (tok && tok.type === 'ws') {
        tok = raw.next();
      }
      return tok;
    },
    save: () => raw.save(),
    formatError: (tok) => raw.formatError(tok),
    has: (tokenType) => raw.has(tokenType),
  };
  return wrapper;
}

const lexer = createLexerWrapper(rawLexer);

export = lexer;
