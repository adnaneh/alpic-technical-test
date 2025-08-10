module.exports = [
  {
    files: ["**/*.ts"],
    ignores: ["dist/**"],
    languageOptions: {
      parser: require("@typescript-eslint/parser"),
      parserOptions: {
        project: "tsconfig.json",
        tsconfigRootDir: __dirname,
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
    },
    rules: {
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "error",
    },
  },

  {
    files: ["test/**/*.ts"],
    languageOptions: {
      parser: require("@typescript-eslint/parser"),
      parserOptions: {
        project: "test/tsconfig.json",
        tsconfigRootDir: __dirname,
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];
