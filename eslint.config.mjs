import nickTwoBadFourU from "eslint-config-nick2bad4u";

/** @type {import("eslint").Linter.Config[]} */
const config = [
    ...nickTwoBadFourU.configs.all,
    {
        files: [
            "*.mjs",
            ".*.mjs",
            "test/*.mjs",
        ],
        languageOptions: {
            parserOptions: {
                projectService: {
                    allowDefaultProject: [
                        "*.mjs",
                        ".*.mjs",
                        "test/*.mjs",
                    ],
                    defaultProject: "tsconfig.js.json",
                },
            },
        },
        name: "🧰 JavaScript config and test files: TypeScript project service",
    },
    {
        files: ["test/*.test.mjs"],
        name: "⛔ Node.js built-in test runner compatibility: Disables",
        rules: {
            "no-template-curly-in-string": "off",
            "test-signal/require-assertions": "off",
            "vitest/no-import-node-test": "off",
            "vitest/prefer-importing-vitest-globals": "off",
        },
    },
    {
        files: [
            ".github/**/*.yml",
            ".github/**/*.yaml",
            "docs/examples/composite-actions/**/*.yml",
            "docs/examples/composite-actions/**/*.yaml",
            "docs/examples/reusable-workflows/**/*.yml",
            "docs/examples/reusable-workflows/**/*.yaml",
            "docs/examples/workflows/**/*.yml",
            "docs/examples/workflows/**/*.yaml",
        ],
        name: "⛔ GitHub Workflow YAML: Disables",
        rules: {
            "yml/no-empty-mapping-value": "off",
            "yml/sort-keys": "off",
        },
    },
    {
        files: [".github/workflows/reusable-*.yml"],
        name: "⛔ Reusable workflow trigger-shape rules: Disables",
        rules: {
            "github-actions/action-name-casing": "off",
            "github-actions/pin-action-shas": "off",
            "github-actions/require-action-run-name": "off",
            "github-actions/require-codeql-actions-read": "off",
            "github-actions/require-codeql-pull-request-trigger": "off",
            "github-actions/require-codeql-schedule": "off",
            "github-actions/require-dependabot-automation-pull-request-trigger":
                "off",
            "github-actions/require-dependency-review-pull-request-trigger":
                "off",
            "github-actions/require-secret-scan-schedule": "off",
        },
    },
    {
        files: [
            ".github/workflows/*-caller.yml",
            "docs/examples/reusable-workflows/*-caller.yml",
        ],
        name: "⛔ Reusable workflow caller rules: Disables",
        rules: {
            "github-actions/no-external-job": "off",
        },
    },
    {
        files: ["package.json"],
        name: "⛔ Package metadata: repository utility manifest",
        rules: {
            "package-json/require-contributors": "off",
            "package-json/require-dependencies": "off",
            "package-json/require-devEngines": "off",
            "package-json/require-main": "off",
            "package-json/require-peerDependencies": "off",
        },
    },
];

export default config;
