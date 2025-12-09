module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module',
	},
	extends: [
		'eslint:recommended',
		'@typescript-eslint/recommended',
	],
	plugins: [
		'@typescript-eslint',
		'n8n-nodes-base',
	],
	rules: {
		// Allow any type usage for n8n compatibility
		'@typescript-eslint/no-explicit-any': 'off',
		// Allow unused variables for n8n node parameters
		'@typescript-eslint/no-unused-vars': 'off',
		// Allow empty interfaces for type definitions
		'@typescript-eslint/no-empty-interface': 'off',
		// Allow require statements
		'@typescript-eslint/no-var-requires': 'off',
		// Allow non-null assertions
		'@typescript-eslint/no-non-null-assertion': 'off',
	},
	env: {
		node: true,
		es6: true,
	},
	ignorePatterns: [
		'dist/**/*',
		'node_modules/**/*',
		'*.js',
		'gulpfile.js',
	],
};
