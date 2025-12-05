const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  jest: {
    configure: {
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
        '^axios$': require.resolve('axios'),
      },
      transformIgnorePatterns: [
        '/node_modules/(?!axios)',
      ],
      collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!src/**/*.d.ts',
        '!src/index.tsx',
        '!src/reportWebVitals.ts',
        '!src/setupTests.ts',
        '!src/**/*.test.{ts,tsx}',
        '!src/services/**', // Exclude API services (no REST tests)
        '!src/types/**',    // Exclude type definitions
      ],
      coverageThreshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
      coverageReporters: ['text', 'lcov', 'html'],
    },
  },
};
