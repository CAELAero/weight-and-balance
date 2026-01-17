import { defineConfig, globalIgnores } from "eslint/config";
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import typescriptEslintEslintPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default defineConfig([
    globalIgnores(["**/*.spec.ts", "**/build/*", "**/node_modules", "**/node_modules"]),
    {
        files: [ "**/*.ts"],
        // extends: fixupConfigRules(compat.extends(
        //     "eslint:recommended",
        //     "plugin:@typescript-eslint/recommended",
        //     "plugin:@typescript-eslint/recommended-type-checked",
        //     "plugin:import/errors",
        //     "plugin:import/warnings",
        //     "plugin:prettier/recommended",
        // )),

        plugins: {
            "@typescript-eslint": fixupPluginRules(typescriptEslintEslintPlugin),
        },

        languageOptions: {
            parser: tsParser,
            ecmaVersion: 5,
            sourceType: "module",

            parserOptions: {
                project: "./tsconfig.apps.json",
                createDefaultProgram: true,
            },
        },

        rules: {
            "import/no-unresolved": "off",
            "import/named": "off",
            "prefer-const": "warn",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-inferrable-types": "off",
            "@typescript-eslint/require-await": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-empty-function": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-empty-interface": "warn",
            "@typescript-eslint/consistent-type-assertions": "error",
            "@typescript-eslint/dot-notation": "error",
            "@typescript-eslint/no-misused-new": "error",
            "@typescript-eslint/no-namespace": "error",
            "@typescript-eslint/no-invalid-this": "error"
        },
    },
]);