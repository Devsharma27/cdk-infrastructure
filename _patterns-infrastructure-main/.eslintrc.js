module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'filename-rules',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    "semi": "off",
    "@typescript-eslint/semi": ["error"],
    "function-paren-newline": ["error", "never"],
    "quotes": ["error", "double"],
    'filename-rules/match': [2, 'snake_case'],
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ]
};
