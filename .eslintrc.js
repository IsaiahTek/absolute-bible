module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react", "react-hooks", "unused-imports"],
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  rules: {
    // React 17+ JSX transform
    "react/react-in-jsx-scope": "off",
    "react/jsx-uses-react": "off",

    // Keep your other rules
    "array-callback-return": "warn",
    "react-hooks/exhaustive-deps": "warn",

    // ❌ Disable the default rule (not auto-fixable)
    "@typescript-eslint/no-unused-vars": "off",

    // ✅ Auto-remove unused imports
    "unused-imports/no-unused-imports": "error",

    // ✅ Auto-remove unused vars (safe)
    "unused-imports/no-unused-vars": [
      "warn",
      {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_",
      },
    ],

    // Keep these as warnings (manual fix)
    eqeqeq: "warn",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
