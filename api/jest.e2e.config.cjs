module.exports = {
  displayName: 'e2e',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.e2e-spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      { tsconfig: '<rootDir>/test/tsconfig.json' },
    ],
  },
  testEnvironment: 'node',
};
