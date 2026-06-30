// Mock window.matchMedia for next-themes / Chakra UI color mode
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// Polyfill structuredClone for jsdom (Chakra UI uses it internally)
if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = (value: unknown) => {
    if (value === undefined) return undefined
    return JSON.parse(JSON.stringify(value))
  }
}
