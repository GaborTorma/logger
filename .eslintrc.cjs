module.exports = {
	root: true,
	env: {
		node: true,
		mocha: true,
	},
	parserOptions: {
		parser: '@babel/eslint-parser',
		sourceType: 'module',
		ecmaVersion: '2022',
		ecmaFeatures: {
			experimentalObjectRestSpread: true,
		},
	},
	extends: [
		'eslint:recommended',
		'plugin:prettier/recommended',
		'plugin:mocha/recommended',
		'plugin:chai-friendly/recommended',
	],
	globals: {
		Ł: 'readonly',
		$l: 'readonly',
	},
	rules: {
		'no-unused-expressions': 'off',
		curly: ['error', 'all'],
		'comma-dangle': [
			'error',
			{
				arrays: 'always-multiline',
				exports: 'always-multiline',
				imports: 'always-multiline',
				objects: 'always-multiline',
				functions: 'never',
			},
		],
		'max-len': [
			'error',
			{
				code: 80,
				tabWidth: 2,
				ignoreUrls: true,
				ignoreStrings: true,
				ignoreTemplateLiterals: true,
				ignoreRegExpLiterals: true,
				ignoreComments: true,
				ignoreTrailingComments: true,
			},
		],
	},
}
