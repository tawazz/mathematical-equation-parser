/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { render, screen } from './test-utils'
import userEvent from '@testing-library/user-event'
import { App } from '../src/App'

// Mock the parse function so we don't depend on the grammar build in tests
import * as lib from '../src/lib'

const mockParse = jest.spyOn(lib, 'parse')

beforeEach(() => {
  mockParse.mockReset()
})

describe('App', () => {
  it('renders the welcome heading', () => {
    render(<App />)

    expect(
      screen.getByText('Welcome to the Mathematical Equation Parser'),
    ).toBeInTheDocument()
  })

  it('shows example prompt buttons initially', () => {
    render(<App />)

    expect(screen.getByText('1 + 2 = 3')).toBeInTheDocument()
    expect(screen.getByText('Try these')).toBeInTheDocument()
  })

  it('has an empty textarea initially', () => {
    render(<App />)

    const textarea = screen.getByPlaceholderText(
      /Enter your expression here/,
    )
    expect(textarea).toHaveValue('')
  })

  it('allows typing in the textarea', async () => {
    const user = userEvent.setup()
    render(<App />)

    const textarea = screen.getByPlaceholderText(/Enter your expression here/)
    await user.type(textarea, '2 + 2 = 4')

    expect(textarea).toHaveValue('2 + 2 = 4')
  })

  it('fills the textarea when a prompt button is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByText('1 + 2 = 3'))

    const textarea = screen.getByPlaceholderText(/Enter your expression here/)
    expect(textarea).toHaveValue('1 + 2 = 3')
  })

  it('calls parse and shows success result on valid input', async () => {
    mockParse.mockReturnValue({
      success: true,
      ast: {
        type: 'comparison',
        operator: '=',
        left: { type: 'binary', operator: '+', left: { type: 'number', value: 1 }, right: { type: 'number', value: 2 } },
        right: { type: 'number', value: 3 },
      },
      result: true,
    })

    const user = userEvent.setup()
    render(<App />)

    const textarea = screen.getByPlaceholderText(/Enter your expression here/)
    await user.type(textarea, '1 + 2 = 3')
    await user.click(screen.getByText('Parse expression'))

    expect(mockParse).toHaveBeenCalledWith('1 + 2 = 3')
    expect(screen.getByText('Valid Expression')).toBeInTheDocument()
    expect(screen.getByText('true')).toBeInTheDocument()
  })

  it('shows error result on invalid input', async () => {
    mockParse.mockReturnValue({
      success: false,
      error: 'Unexpected token at line 1, column 3',
      position: { line: 1, col: 3 },
    })

    const user = userEvent.setup()
    render(<App />)

    const textarea = screen.getByPlaceholderText(/Enter your expression here/)
    await user.type(textarea, '2 +')
    await user.click(screen.getByText('Parse expression'))

    expect(screen.getByText('Invalid Expression')).toBeInTheDocument()
    expect(screen.getByText(/Unexpected token/)).toBeInTheDocument()
  })

  it('disables the textarea after a successful parse', async () => {
    mockParse.mockReturnValue({
      success: true,
      ast: { type: 'number', value: 42 },
      result: 42,
    })

    const user = userEvent.setup()
    render(<App />)

    const textarea = screen.getByPlaceholderText(/Enter your expression here/)
    await user.type(textarea, '42')
    await user.click(screen.getByText('Parse expression'))

    expect(textarea).toBeDisabled()
  })

  it('shows "Try another expression" button after success', async () => {
    mockParse.mockReturnValue({
      success: true,
      ast: { type: 'number', value: 42 },
      result: 42,
    })

    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText(/Enter your expression here/), '42')
    await user.click(screen.getByText('Parse expression'))

    expect(screen.getByText('Try another expression')).toBeInTheDocument()
  })

  it('resets state when "Try another expression" is clicked', async () => {
    mockParse.mockReturnValue({
      success: true,
      ast: { type: 'number', value: 42 },
      result: 42,
    })

    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText(/Enter your expression here/), '42')
    await user.click(screen.getByText('Parse expression'))

    await user.click(screen.getByText('Try another expression'))

    const textarea = screen.getByPlaceholderText(/Enter your expression here/)
    expect(textarea).toHaveValue('')
    expect(textarea).toBeEnabled()
    expect(screen.queryByText('Valid Expression')).not.toBeInTheDocument()
    // Prompt buttons should be visible again
    expect(screen.getByText('1 + 2 = 3')).toBeInTheDocument()
  })

  it('resets, then clicking a prompt fills the textarea', async () => {
    mockParse.mockReturnValue({
      success: true,
      ast: { type: 'number', value: 42 },
      result: 42,
    })

    const user = userEvent.setup()
    render(<App />)

    // First parse something
    await user.type(screen.getByPlaceholderText(/Enter your expression here/), '42')
    await user.click(screen.getByText('Parse expression'))

    // Click "Try another expression" to reset
    await user.click(screen.getByText('Try another expression'))

    // Prompts are visible again
    expect(screen.getByText('2 * 3 + 4 = 10')).toBeInTheDocument()

    // Click a prompt — fills textarea, still no result shown
    await user.click(screen.getByText('2 * 3 + 4 = 10'))

    const textarea = screen.getByPlaceholderText(/Enter your expression here/)
    expect(textarea).toHaveValue('2 * 3 + 4 = 10')
    expect(textarea).toBeEnabled()
    expect(screen.queryByText('Valid Expression')).not.toBeInTheDocument()
  })
})
