// Flat ESLint config for the web app (ESLint v9)
// Uses FlatCompat to reuse Next.js recommended config
const { FlatCompat } = require('@eslint/eslintrc');
const compat = new FlatCompat({ baseDirectory: __dirname });

module.exports = [
  // Bring in Next.js core web vitals rules
  ...compat.config({ extends: ['next/core-web-vitals'] }),
  // Project ignores
  {
    ignores: ['.next/**', 'node_modules/**', 'dist/**']
  },
];

