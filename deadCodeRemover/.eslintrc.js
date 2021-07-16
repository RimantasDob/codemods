module.exports = {
  parserOptions: {
    sourceType: "module",
  },
  extends: ["eslint-env"],
  env: {
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: "module",
  },
  rules: {
    semi: ["error", "never"],
    indent: [2, 4],
    quotes: ["error", "single", { avoidEscape: true }],
  },
};
