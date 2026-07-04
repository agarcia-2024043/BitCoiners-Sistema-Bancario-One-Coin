// eslint.config.js
export default [
  {
    ignores: [
      "node_modules/**",
      ".expo/**",
      "web-build/**",
      "dist/**"
    ]
  },
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error"
    }
  }
];
