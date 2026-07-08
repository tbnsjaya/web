import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Konsistensi import
      "import/order": "off",
      // Hindari any yang tidak diperlukan
      "@typescript-eslint/no-explicit-any": "warn",
      // Pastikan tidak ada unused variables
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // React tidak perlu diimport di Next.js 16
      "react/react-in-jsx-scope": "off",
      // Konsistensi tipe
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports" },
      ],
    },
  },
];

export default eslintConfig;
