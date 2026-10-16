/* O ESLint (VP-70, 16/out/2026): as regras recomendadas do JavaScript e do
   TypeScript, sem as de estilo (o desenho das linhas é do código, não do
   linter). Roda com `npm run lint` e no GitHub a cada envio. */
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
  { ignores: ["dist", "node_modules", "public"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser }, ecmaVersion: 2022, sourceType: "module" },
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-empty": ["error", { allowEmptyCatch: true }],
    },
  },
  { files: ["scripts/**", "*.config.*"], languageOptions: { globals: { ...globals.node } } },
);
