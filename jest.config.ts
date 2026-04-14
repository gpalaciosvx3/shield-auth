import type { Config } from 'jest';

export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.steps.ts'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/auth/domain/**/*.ts',
    'src/auth/application/**/*.ts',
    'src/authorizer/domain/**/*.ts',
    'src/authorizer/application/**/*.ts',
  ],
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
  },
} satisfies Config;
