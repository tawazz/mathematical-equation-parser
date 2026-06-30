# Mathematical Equation Parser

[![CI](https://github.com/tawazz/mathematical-equation-parser/actions/workflows/ci.yml/badge.svg)](https://github.com/tawazz/mathematical-equation-parser/actions/workflows/ci.yml)
[![Deploy](https://github.com/tawazz/mathematical-equation-parser/actions/workflows/deploy.yml/badge.svg)](https://github.com/tawazz/mathematical-equation-parser/actions/workflows/deploy.yml)

A web-based mathematical equation parser built with **React**, **TypeScript**, and **Vite**. It uses [Nearley](https://nearley.js.org/) for parser generation and [Moo](https://github.com/no-context/moo) for lexing/tokenization, and renders the UI with **Chakra UI v3**.

Enter an arithmetic or comparison expression, and the app will parse it into an AST (Abstract Syntax Tree), evaluate it, and display the result - along with an interactive tree viewer.

---

## Features

- **Arithmetic operations**: addition (`+`), subtraction (`-`), multiplication (`*`), division (`/`)
- **Comparison operators**: equality (`=`) and inequality (`!=`)
- **Full operator precedence**: multiplication/division before addition/subtraction
- **Parentheses support**: override precedence with `( )`
- **Decimal number support**: e.g., `2.5 + 3.5 = 6`
- **Flexible whitespace**: spaces, tabs, and newlines are ignored
- **Interactive AST viewer**: visual tree of the parsed expression
- **Error reporting**: clear error messages with line/column position and suggestions
- **Example prompts**: one-click expression buttons to get started

---

## Tech Stack

| Category      | Technology                                    |
|---------------|-----------------------------------------------|
| Language      | TypeScript 6                                  |
| Framework     | React 19                                      |
| Build         | Vite 8                                        |
| UI Library    | Chakra UI v3                                  |
| Parser        | Nearley 2 + Moo 0.5                           |
| Testing       | Jest 30 + React Testing Library               |
| Linting       | ESLint 10 + typescript-eslint                 |

---

## Prerequisites

- **Node.js** >= 20 (LTS recommended)
- **npm** >= 9

---

## Installation

```bash
# Clone the repository
git clone https://github.com/tawazz/mathematical-equation-parser.git math-eq-parser
cd math-eq-parser

# Install dependencies
npm install
```

---

## Development

Start the development server with hot module replacement:

```bash
npm run dev
```

This runs two steps automatically:
1. **Build the grammar** - compiles `src/lib/grammar.ne` → `src/lib/grammar.js` via Nearley
2. **Start Vite dev server** - serves the app on `http://localhost:5173`

---

## Build

Create a production build:

```bash
npm run build
```

This runs:
1. `build:grammar` - compile the Nearley grammar
2. `tsc -b` - TypeScript type-checking
3. `vite build` - production bundle to the `dist/` directory

The output is a fully static site ready for deployment.

---

## Testing

### Run all tests

```bash
npm test
```

This compiles the grammar first, then runs the Jest test suite.

### Run only parser tests

```bash
npm run test:parser
```

Runs the core parsing and evaluation tests in `tests/index.ts` - does not require a DOM environment.

### Run only component tests

```bash
npm run test:components
```

Runs React component tests in `tests/components/` and `tests/App.test.tsx` using JSDOM.

### Test structure

```
tests/
├── index.ts                           # Parser & evaluator tests
├── setup.ts                           # JSDOM setup (matchMedia mock)
├── test-utils.tsx                     # Custom render with Chakra Provider
├── App.test.tsx                       # Integration tests for the App component
└── components/
    ├── AstViewer.test.tsx             # AST viewer component tests
    ├── ErrorDisplay.test.tsx          # Error display component tests
    ├── ResultDisplay.test.tsx         # Result display component tests
    └── SuccessDisplay.test.tsx        # Success display component tests
```

---

## Project Structure

```
math-eq-parser/
├── index.html                         # HTML entry point
├── package.json                       # Dependencies and scripts
├── tsconfig.json                      # TypeScript root config
├── tsconfig.app.json                  # TypeScript app config
├── tsconfig.node.json                 # TypeScript Node config
├── tsconfig.test.json                 # TypeScript test config
├── vite.config.ts                     # Vite configuration
├── eslint.config.js                   # ESLint configuration
├── public/
│   └── favicon.svg                    # Favicon
├── src/
│   ├── main.tsx                       # App entry point
│   ├── App.tsx                        # Root component
│   ├── index.css                      # Global styles
│   ├── lib/
│   │   ├── index.ts                   # Parser logic, AST types, evaluator
│   │   ├── lexer.ts                   # Moo lexer configuration
│   │   ├── grammar.ne                 # Nearley grammar definition
│   │   ├── grammar.js                 # Compiled grammar (generated)
│   │   └── grammar.d.ts              # Grammar type declarations
│   ├── components/
│   │   ├── result/
│   │   │   ├── ResultDisplay.tsx      # Result dispatcher (success/error)
│   │   │   ├── SuccessDisplay.tsx     # Valid expression result + AST viewer
│   │   │   ├── ErrorDisplay.tsx       # Error display with position details
│   │   │   └── AstViewer.tsx          # Recursive AST tree viewer
│   │   └── ui/
│   │       ├── provider.tsx           # Chakra UI provider (color mode)
│   │       ├── color-mode.tsx         # Color mode logic
│   │       ├── toaster.tsx            # Toast component
│   │       └── tooltip.tsx            # Tooltip component
│   └── assets/                        # Static assets
└── tests/                             # Test files (mirrors src structure)
```

---

## Grammar & Parser Details

The parser is defined in `src/lib/grammar.ne` using Nearley's DSL and follows standard operator precedence:

| Level | Rule              | Associativity | Operators          |
|-------|-------------------|---------------|--------------------|
| 1     | `comparison`      | left          | `=`, `!=`          |
| 2     | `addition`        | left          | `+`, `-`           |
| 3     | `multiplication`  | left          | `*`, `/`           |
| 4     | `primary`         | -             | numbers, `(expr)`  |

The lexer (`src/lib/lexer.ts`) uses Moo and wraps the raw lexer to skip whitespace tokens so Nearley never sees them.

### Expression examples

| Input                       | Result |
|-----------------------------|--------|
| `1 + 2 = 3`                | `true` |
| `2 * 3 + 4 = 10`           | `true` |
| `2 * (3 + 4) = 10`         | `false` |
| `6 = 10 / 2 + 1`           | `true` |
| `12 + 3 != 4 / 2 + 5`     | `true` |
| `(1 + 2) * 3 = 18 / 2`    | `true` |

---

## Linting

```bash
npm run lint
```

Runs ESLint across the project with TypeScript-aware lint rules (recommended config from `typescript-eslint`, plus `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh`).

---

## Deployment

This project is set up for continuous deployment via GitHub Actions. See the `.github/workflows/` directory for CI and deploy pipeline definitions.

The production build outputs a static site to the `dist/` folder, which can be deployed to any static hosting provider (GitHub Pages, Netlify, Vercel, etc.).

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Install dependencies: `npm install`
4. Make your changes
5. Add or update tests as needed
6. Run the test suite: `npm test`
7. Run the linter: `npm run lint`
8. Commit and push, then open a Pull Request

---

## License

[MIT](LICENSE)
