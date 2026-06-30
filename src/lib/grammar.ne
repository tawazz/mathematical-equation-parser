@preprocessor esmodule
# JavaScript prelude: import the custom lexer
@{%
import lexer from './lexer';
%}

# Tell Nearley to use our custom lexer instead of the default
@lexer lexer

# Top-level rule: an expression is either an assertion (comparison) or a bare addition.
expression -> assertion {% id %}

# Assertion (equality / inequality) — top level only, NOT chainable.
# Matches `addition = addition` or `addition != addition`.
assertion -> addition (%eq | %neq) addition {%
  function(d) {
    // d[0] = left addition, d[1] = [token] (alternation wraps in array), d[2] = right addition
    return {
      type: 'comparison',
      operator: d[1][0].text,
      left: d[0],
      right: d[2],
    };
  }
%}
  | addition {% id %}

# Addition / subtraction — medium precedence 
# Matches a `multiplication` optionally followed by zero or more `(+ or -) multiplication`.
# Left-associative so `1 - 2 + 3` = `(1 - 2) + 3`.
addition -> multiplication ((%plus | %minus) multiplication):* {%
  function(d) {
    // No operators → return the multiplication node as-is
    if (d[1].length === 0) return d[0];
    let result = d[0];
    for (const item of d[1]) {
      const op   = item[0][0];
      const right = item[1];
      result = { type: 'binary', operator: op.text, left: result, right };
    }
    return result;
  }
%}

# Multiplication / division — higher precedence
# Matches a `primary` optionally followed by zero or more `(* or /) primary`.
# Left-associative so `4 / 2 * 3` = `(4 / 2) * 3`.
multiplication -> primary ((%times | %divide) primary):* {%
  function(d) {
    if (d[1].length === 0) return d[0];
    let result = d[0];
    for (const item of d[1]) {
      const op   = item[0][0];
      const right = item[1];
      result = { type: 'binary', operator: op.text, left: result, right };
    }
    return result;
  }
%}

# Primary (atoms) — highest precedence
# Two alternatives:
#   1. A literal number              →  { type: 'number', value: <the number> }
#   2. A parenthesised sub‑expression →  return the inner expression node
primary -> %number {% function(d) { return { type: 'number', value: d[0].value }; } %}
    | %lparen expression %rparen {% function(d) { return d[1]; } %}
