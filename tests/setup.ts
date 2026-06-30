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
  globalThis.structuredClone = function structuredClone<T>(value: T): T {
    // Handle primitives directly — avoids lossy JSON round-trip for these cases
    if (value === undefined || value === null) return value;
    if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
      return value;
    }
    return JSON.parse(JSON.stringify(value));
  } as typeof globalThis.structuredClone;
}
