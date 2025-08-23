import globals from "globals"
import tseslint from "typescript-eslint"
import { defineConfig } from "eslint/config"

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,d.ts}"],
    languageOptions: { globals: {...globals.browser, ...globals.node} },
  },
  tseslint.configs.recommended,
  {
    rules: {
    "no-unused-vars": "warn",
    "no-undef": "warn",
    semi: ["error", "never"],
    "prefer-const": "error",
    "import/no-unresolved": "off",
    "@typescript-eslint/no-empty-object-type": "off"
    },
  }
])
