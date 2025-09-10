import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: ["dist/**", "node_modules/**"],
    rules: {
      "@typescript-eslint/typedef": [
        "error",
        {
          "arrayDestructuring": false,
          "arrowParameter": true,
          "memberVariableDeclaration": true,
          "objectDestructuring": false,
          "parameter": true,
          "propertyDeclaration": true,
          "variableDeclaration": true,
          "variableDeclarationIgnoreFunction": false
        }
      ]
    },
  },
  { 
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], 
    plugins: { js }, 
    extends: ["js/recommended"], 
    languageOptions: { globals: globals.browser } 
  },
  tseslint.configs.recommended,
]);
