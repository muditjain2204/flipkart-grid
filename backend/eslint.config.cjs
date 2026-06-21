module.exports = [{
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
    parserOptions: {
      project: './tsconfig.json',
    },
  },
  plugins: {
    '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
  },
  rules: {},
  ignores: ['node_modules/', 'dist/'],
}];