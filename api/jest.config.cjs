// Root Jest config to enable running unit and e2e tests from one entrypoint
/** @type {import('jest').Config} */
module.exports = {
  projects: [
    '<rootDir>/jest.unit.config.cjs',
    '<rootDir>/jest.e2e.config.cjs',
  ],
};
