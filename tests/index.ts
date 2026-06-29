import { describe, it, expect } from '@jest/globals';
import { parse } from '../src/lib/index';

function assertSuccess(result: ReturnType<typeof parse>, expected: number | boolean) {
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.result).toEqual(expected);
  }
}

function assertError(result: ReturnType<typeof parse>) {
  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result).toHaveProperty('error');
  }
}

// Given Examples

describe('Examples', () => {
  it('1 + 2 = 3  → true',           () => assertSuccess(parse('1 + 2 = 3'),           true));
  it('2 * 3 + 4 = 10  → true',      () => assertSuccess(parse('2 * 3 + 4 = 10'),      true));
  it('2 * (3 + 4) = 10  → false',   () => assertSuccess(parse('2 * (3 + 4) = 10'),    false));
  it('6 = 10 / 2 + 1  → true',      () => assertSuccess(parse('6 = 10 / 2 + 1'),      true));
  it('12 + 3 != 4 / 2 + 5  → true', () => assertSuccess(parse('12 + 3 != 4 / 2 + 5'), true));
  it('2 + 3 * 2 = 10  → false',     () => assertSuccess(parse('2 + 3 * 2 = 10'),      false));
  it('2 * 3 + 4 != 10  → false',    () => assertSuccess(parse('2 * 3 + 4 != 10'),     false));
  it('1 + (2 = 3  → error',         () => assertError(parse('1 + (2 = 3')));
});

// Arithmetic

describe('Arithmetic', () => {
  it('plain number',             () => assertSuccess(parse('42'),          42));
  it('addition',                 () => assertSuccess(parse('10 + 20'),     30));
  it('subtraction',              () => assertSuccess(parse('100 - 37'),    63));
  it('multiplication',           () => assertSuccess(parse('8 * 7'),       56));
  it('division',                 () => assertSuccess(parse('81 / 9'),      9));
  it('precedence: + before *',   () => assertSuccess(parse('1 + 2 * 3'),    7));
  it('precedence: - before /',   () => assertSuccess(parse('10 - 4 / 2'),   8));
  it('precedence: multi ops',    () => assertSuccess(parse('3 * 4 + 2 * 5'), 22));
  it('parentheses override',     () => assertSuccess(parse('(1 + 2) * 3'),  9));
  it('nested parentheses',       () => assertSuccess(parse('((2 + 3) * (4 - 1))'), 15));
});

// Comparison

describe('Comparison', () => {
  it('equality true',            () => assertSuccess(parse('5 = 5'),   true));
  it('equality false',           () => assertSuccess(parse('5 = 6'),   false));
  it('inequality true',          () => assertSuccess(parse('5 != 6'),  true));
  it('inequality false',         () => assertSuccess(parse('5 != 5'),  false));
});

// Mixed arithmetic & comparison

describe('Mixed arithmetic and comparison', () => {
  it('3 + 4 = 7',                () => assertSuccess(parse('3 + 4 = 7'),            true));
  it('3 + 4 = 8',                () => assertSuccess(parse('3 + 4 = 8'),            false));
  it('10 - 3 != 8  (7 != 8)',    () => assertSuccess(parse('10 - 3 != 8'),          true));
  it('10 - 3 != 6  (7 != 6)',    () => assertSuccess(parse('10 - 3 != 6'),          true));
  it('(1+2)*3 = 18/2',           () => assertSuccess(parse('(1 + 2) * 3 = 18 / 2'), true));
  it('(1+2)*3 = 18/3',           () => assertSuccess(parse('(1 + 2) * 3 = 18 / 3'), false));
});

// Decimals

describe('Decimals', () => {
  it('decimal addition',         () => assertSuccess(parse('2.5 + 3.5'),          6));
  it('decimal comparison true',  () => assertSuccess(parse('3.5 + 1.5 = 5'),      true));
  it('decimal comparison false', () => assertSuccess(parse('3.5 + 1.5 = 5.1'),    false));
});

// Whitespace

describe('Whitespace handling', () => {
  it('no spaces',                () => assertSuccess(parse('2+3*4=14'),          true));
  it('extra spaces',             () => assertSuccess(parse('  2  +  3  *  4  =  14  '), true));
  it('tabs and newlines',        () => assertSuccess(parse('2\t+\n3'),            5));
});

// Error handling

describe('Error handling', () => {
  it('trailing operator',        () => assertError(parse('2 +')));
  it('leading operator',         () => assertError(parse('* 5')));
  it('double operator',          () => assertError(parse('2 + * 3')));
  it('invalid character',        () => assertError(parse('2 + a')));
  it('unclosed paren',           () => assertError(parse('(2 + 3')));
  it('empty input',              () => assertError(parse('')));
});
