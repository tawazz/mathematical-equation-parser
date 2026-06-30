import '@testing-library/jest-dom/jest-globals'
import { type ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { Provider } from '../src/components/ui/provider'

/**
 * Custom render that wraps the UI in the Chakra UI Provider.
 * This mirrors how the app is wrapped in main.tsx.
 */
function AllTheProviders({ children }: { children: React.ReactNode }) {
  return <Provider>{children}</Provider>
}

function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllTheProviders, ...options })
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { customRender as render }
