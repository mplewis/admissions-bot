const eslint = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');
const prettier = require('eslint-plugin-prettier');
const eslintConfigPrettier = require('eslint-config-prettier');
const globals = require('globals');

module.exports = [
	eslint.configs.recommended,
	{
		files: ['**/*.ts'],
		languageOptions: {
			parser: tsparser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
			},
			globals: { ...globals.node },
		},
		plugins: {
			'@typescript-eslint': tseslint,
			prettier: prettier,
		},
		rules: {
			...tseslint.configs.recommended.rules,
			'prettier/prettier': ['error', { useTabs: true }],
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			indent: ['error', 'tab'],
		},
	},
	{
		files: ['**/*.js'],
		languageOptions: {
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
			},
			globals: { ...globals.node },
		},
		rules: {
			'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			indent: ['error', 'tab'],
		},
	},
	eslintConfigPrettier,
];
