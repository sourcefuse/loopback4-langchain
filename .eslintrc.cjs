module.exports = {
  extends: '@loopback/eslint-config',
  rules: {
    'no-extra-boolean-cast': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    'no-prototype-builtins': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/await-thenable': 'off',
  },
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ['dist/', 'node_modules/'],
};
