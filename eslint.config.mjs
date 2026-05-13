import nickTwoBadFourU from "eslint-config-nick2bad4u";

/** @type {import("eslint").Linter.Config[]} */
const config = [
    ...nickTwoBadFourU.configs.all,
    {
        files: [".github/**/*.yml", ".github/**/*.yaml"],
        name: "⛔ GitHub Workflow YAML: Disables",
        rules: {
            "yml/no-empty-mapping-value": "off",
            "yml/sort-keys": "off",
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
