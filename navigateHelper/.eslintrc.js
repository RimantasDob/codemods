module.exports = {
    parser: 'babel-eslint',
    extends: ['eslint:recommended'],
    env: {
        node: true,
        es6: true,
    },
    parserOptions: {
        ecmaVersion: 2017,
        sourceType: 'module',
    },
    rules: {
        'no-unused-vars': 'warn',
        indent: [4, 8],
        quotes: ['error', 'single', { avoidEscape: true }],
    },
};
