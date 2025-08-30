/// <reference types="vitest/globals" />
import 'reflect-metadata';

// Global test setup
beforeEach(() => {
  // Clear any global state if needed
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};
