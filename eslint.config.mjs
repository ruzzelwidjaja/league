import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
// import pluginPrettier from "eslint-plugin-prettier";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    languageOptions: { globals: globals.browser },
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    plugins: {
      // prettier: pluginPrettier,
    },
    rules: {
      // "prettier/prettier": "error",
      "space-before-blocks": "off",
      "space-before-function-paren": "off",
      "space-in-parens": "off",
      "space-infix-ops": "off",
      "space-unary-ops": "off",
      "space-after-keywords": "off",
      "space-after-parens": "off",
    },
  },
]);
