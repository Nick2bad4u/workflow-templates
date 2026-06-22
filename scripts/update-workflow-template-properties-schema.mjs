import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * @typedef {Record<string, JsonValue>} JsonObject
 */

/**
 * @typedef {JsonValue[]} JsonArray
 */

/**
 * @typedef {string | number | boolean | null | JsonObject | JsonArray} JsonValue
 */

/**
 * @typedef {object} GeneratedSchemaSummaryAnyOfEntry
 *
 * @property {string[]} [enum] Category enum values from the first generated
 *   anyOf entry.
 */

/**
 * @typedef {object} GeneratedSchemaSummaryItems
 *
 * @property {GeneratedSchemaSummaryAnyOfEntry[]} [anyOf] Generated variants for
 *   the category item schema.
 */

/**
 * @typedef {object} GeneratedSchemaSummaryCategories
 *
 * @property {GeneratedSchemaSummaryItems} [items] Array item schema for
 *   categories.
 */

/**
 * @typedef {object} GeneratedSchemaSummaryProperties
 *
 * @property {GeneratedSchemaSummaryCategories} [categories] Generated
 *   categories property summary.
 */

/**
 * @typedef {object} GeneratedSchemaSummary
 *
 * @property {GeneratedSchemaSummaryProperties} [properties] Top-level generated
 *   schema properties.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const OCTICONS_REACT_VERSION = process.env.OCTICONS_REACT_VERSION || "19.25.0";
const schemaOutputPath = path.join(
    repoRoot,
    "schemas",
    "github-workflow-template-properties.schema.json"
);

const SOURCES = {
    starterWorkflowsReadme:
        "https://raw.githubusercontent.com/actions/starter-workflows/main/README.md",
    linguistLanguages:
        "https://raw.githubusercontent.com/github-linguist/linguist/main/lib/linguist/languages.yml",
    techStacks:
        "https://raw.githubusercontent.com/github-starter-workflows/repo-analysis-partner/main/tech_stacks.yml",
    octiconsReactEsm: `https://unpkg.com/@primer/octicons-react@${OCTICONS_REACT_VERSION}/dist/index.esm.mjs`,
};

/**
 * Fetch a UTF-8 text resource.
 *
 * @param {string} url
 *
 * @returns {Promise<string>}
 */
async function fetchText(url) {
    const response = await fetch(url, {
        headers: {
            "user-agent": "workflow-templates-schema-updater",
            accept: "text/plain, text/markdown, application/yaml, text/yaml, */*",
        },
    });

    if (!response.ok) {
        throw new Error(
            `Failed to fetch ${url}: ${response.status} ${response.statusText}`
        );
    }

    return response.text();
}

/**
 * Parse starter workflow categories from the upstream README.
 *
 * @param {string} markdown
 *
 * @returns {string[]}
 */
function parseStarterWorkflowCategories(markdown) {
    const lines = markdown.split(/\r?\n/u);
    const categories = [];
    let inCategoriesSection = false;

    for (const line of lines) {
        if (!inCategoriesSection) {
            if (/^###\s+Categories\s*$/u.test(line.trim())) {
                inCategoriesSection = true;
            }
            continue;
        }

        if (/^###\s+/u.test(line.trim())) {
            break;
        }

        const match = /^\*\s+(.+?)\s*$/u.exec(line);
        if (match?.[1]) {
            categories.push(match[1].trim());
            continue;
        }

        if (categories.length > 0 && line.trim() === "") {
            break;
        }
    }

    return categories;
}

/**
 * Parse top-level Linguist language names from languages.yml.
 *
 * @param {string} yaml
 *
 * @returns {string[]}
 */
function parseLinguistLanguages(yaml) {
    const lines = yaml.split(/\r?\n/u);
    const languages = [];

    for (const line of lines) {
        if (
            line.startsWith("#") ||
            line.trim() === "" ||
            line.trim() === "---"
        ) {
            continue;
        }

        if (/^[^\s#][^:]*:\s*$/u.test(line)) {
            const name = line.replace(/:\s*$/u, "").trim();
            languages.push(name);
        }
    }

    return languages;
}

/**
 * Parse supported tech stacks from tech_stacks.yml.
 *
 * @param {string} yaml
 *
 * @returns {string[]}
 */
function parseTechStacks(yaml) {
    const lines = yaml.split(/\r?\n/u);
    const techStacks = [];
    let inTechStackList = false;

    for (const line of lines) {
        if (!inTechStackList) {
            if (/^supported_tech_stacks:\s*$/u.test(line.trim())) {
                inTechStackList = true;
            }
            continue;
        }

        const match = /^\s*-\s+(.+?)\s*$/u.exec(line);
        if (match?.[1]) {
            techStacks.push(match[1].trim());
            continue;
        }

        if (techStacks.length > 0 && line.trim() !== "") {
            break;
        }
    }

    return techStacks;
}

/**
 * Return sorted unique values.
 *
 * @param {string[]} values
 *
 * @returns {string[]}
 */
function uniqueSorted(values) {
    return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

/**
 * Convert a PascalCase icon component name (e.g. "ShieldCheckIcon") to
 * kebab-case Octicon name (e.g. "shield-check").
 *
 * @param {string} componentName
 *
 * @returns {string}
 */
function iconComponentToOcticonName(componentName) {
    const base = componentName.replace(/Icon$/u, "");

    return base
        .replace(/([A-Z]+)([A-Z][a-z])/gu, "$1-$2")
        .replace(/([a-z0-9])([A-Z])/gu, "$1-$2")
        .toLowerCase();
}

/**
 * Parse exported icon component names from @primer/octicons-react ESM bundle.
 *
 * @param {string} esmCode
 *
 * @returns {string[]}
 */
function parseOcticonNamesFromEsm(esmCode) {
    const componentMatches = [
        ...esmCode.matchAll(/\b([A-Z][A-Za-z0-9]*Icon)\b/gu),
    ];
    const componentNames = uniqueSorted(
        componentMatches.map((match) => match[1]).filter(Boolean)
    );

    return uniqueSorted(
        componentNames
            .filter((name) => name.endsWith("Icon"))
            .map((name) => iconComponentToOcticonName(name))
            .filter((name) => name.length > 0)
            .map((name) => `octicon ${name}`)
    );
}

/**
 * Build the schema document.
 *
 * @param {{
 *     starterWorkflowCategories: string[];
 *     linguistLanguages: string[];
 *     techStacks: string[];
 *     octiconValues: string[];
 * }} sources
 *
 * @returns {Record<string, unknown>}
 */
function buildSchema({
    starterWorkflowCategories,
    linguistLanguages,
    techStacks,
    octiconValues,
}) {
    const allCategoryValues = uniqueSorted([
        ...starterWorkflowCategories,
        ...linguistLanguages,
        ...techStacks,
    ]);

    return {
        $schema: "https://json-schema.org/draft-07/schema#",
        $id: "https://raw.githubusercontent.com/Nick2bad4u/workflow-templates/main/schemas/github-workflow-template-properties.schema.json",
        title: "GitHub Actions Workflow Template Properties",
        description:
            "Schema for .properties.json metadata files paired with .github/workflow-templates/*.yml GitHub Actions workflow templates.",
        type: "object",
        additionalProperties: false,
        properties: {
            $schema: {
                type: "string",
                description:
                    "Optional JSON Schema reference for editor tooling. When submitted to SchemaStore, use the SchemaStore URL.",
                format: "uri-reference",
            },
            name: {
                type: "string",
                description:
                    "Required. The name of the workflow. This is displayed in the list of available workflows.",
                examples: ["Node.js CI", "Deploy Docusaurus to GitHub Pages"],
            },
            description: {
                type: "string",
                minLength: 1,
                description:
                    "Required. The description of the workflow. This is displayed in the list of available workflows.",
                examples: [
                    "Run tests with coverage across multiple platforms.",
                    "Scan pull requests for vulnerable dependencies.",
                ],
            },
            iconName: {
                description:
                    "Optional. Either a local SVG file name without extension from the workflow-templates directory, or an Octicon reference in the form 'octicon <icon-name>'.",
                anyOf: [
                    {
                        type: "string",
                        enum: octiconValues,
                        examples: [
                            "octicon shield-check",
                            "octicon tag",
                            "octicon globe",
                        ],
                    },
                    {
                        type: "string",
                        pattern: "^octicon [a-z0-9-]+$",
                        description:
                            "Forward-compatible Octicon fallback. Prefer values from the generated enum above for best editor autocomplete.",
                    },
                    {
                        type: "string",
                        pattern: "^(?!octicon )[A-Za-z0-9][A-Za-z0-9._-]*$",
                        examples: [
                            "example-icon",
                            "workflow-template-security",
                            "workflow-template-node",
                        ],
                    },
                ],
            },
            categories: {
                type: "array",
                description:
                    "Optional. Categories used by GitHub when presenting workflow templates. Valid values are sourced from actions/starter-workflows general categories, github-linguist language names, and github-starter-workflows supported tech stacks.",
                uniqueItems: true,
                minItems: 1,
                items: {
                    anyOf: [
                        {
                            type: "string",
                            enum: allCategoryValues,
                        },
                        {
                            type: "string",
                            minLength: 1,
                            description:
                                "Forward-compatible category fallback in case upstream sources add new values before this schema is regenerated.",
                        },
                    ],
                },
                examples: [
                    ["JavaScript", "TypeScript"],
                    ["deployment", "Markdown"],
                    ["YAML", "npm"],
                ],
            },
            filePatterns: {
                type: "array",
                description:
                    "Optional. Root-level regular expression patterns used by GitHub to determine when a template should be suggested for a repository.",
                uniqueItems: true,
                minItems: 1,
                items: {
                    type: "string",
                    minLength: 1,
                    examples: [
                        "package.json$",
                        "^Dockerfile",
                        String.raw`.*\.md$`,
                        "docusaurus.config.ts$",
                    ],
                },
            },
        },
        required: ["name", "description"],
        examples: [
            {
                name: "Node.js CI",
                description:
                    "Run install, lint, typecheck, and tests for a Node.js project.",
                iconName: "workflow-template-node",
                categories: [
                    "JavaScript",
                    "TypeScript",
                    "npm",
                ],
                filePatterns: ["package.json$", "package-lock.json$"],
            },
            {
                name: "CodeQL Analysis",
                description:
                    "Run CodeQL security analysis for JavaScript, TypeScript, and GitHub Actions workflows.",
                iconName: "octicon shield-check",
                categories: [
                    "JavaScript",
                    "TypeScript",
                    "YAML",
                ],
            },
        ],
        definitions: {
            sourceMetadata: {
                type: "object",
                additionalProperties: false,
                properties: {
                    starterWorkflowCategories: {
                        type: "array",
                        items: { type: "string" },
                    },
                    linguistLanguages: {
                        type: "array",
                        items: { type: "string" },
                    },
                    techStacks: {
                        type: "array",
                        items: { type: "string" },
                    },
                },
            },
        },
        "x-generated-from": {
            starterWorkflowCategoriesSource: SOURCES.starterWorkflowsReadme,
            linguistLanguagesSource: SOURCES.linguistLanguages,
            techStacksSource: SOURCES.techStacks,
            octiconsSource: SOURCES.octiconsReactEsm,
            octiconsVersion: OCTICONS_REACT_VERSION,
        },
    };
}

/**
 * Regenerate the workflow template properties schema from upstream sources.
 *
 * @returns {Promise<void>}
 */
async function main() {
    const [
        starterReadme,
        linguistYaml,
        techStacksYaml,
        octiconsReactEsm,
    ] = await Promise.all([
        fetchText(SOURCES.starterWorkflowsReadme),
        fetchText(SOURCES.linguistLanguages),
        fetchText(SOURCES.techStacks),
        fetchText(SOURCES.octiconsReactEsm),
    ]);

    const starterWorkflowCategories =
        parseStarterWorkflowCategories(starterReadme);
    const linguistLanguages = parseLinguistLanguages(linguistYaml);
    const techStacks = parseTechStacks(techStacksYaml);
    const octiconValues = parseOcticonNamesFromEsm(octiconsReactEsm);

    if (starterWorkflowCategories.length === 0) {
        throw new Error(
            "No starter workflow categories were parsed from actions/starter-workflows README.md"
        );
    }

    if (linguistLanguages.length === 0) {
        throw new Error(
            "No Linguist language names were parsed from languages.yml"
        );
    }

    if (techStacks.length === 0) {
        throw new Error(
            "No supported tech stacks were parsed from tech_stacks.yml"
        );
    }

    if (octiconValues.length === 0) {
        throw new Error(
            "No Octicon names were parsed from @primer/octicons-react ESM bundle"
        );
    }

    const schema = buildSchema({
        starterWorkflowCategories,
        linguistLanguages,
        techStacks,
        octiconValues,
    });

    await mkdir(path.dirname(schemaOutputPath), { recursive: true });

    /**
     * Recursively sort all object keys to match Prettier's alphabetical format.
     *
     * @param {JsonObject | JsonArray} obj
     *
     * @returns {JsonObject | JsonArray}
     */
    function sortKeys(obj) {
        if (Array.isArray(obj)) {
            return obj.map(sortKeys);
        }

        if (obj !== null && typeof obj === "object") {
            return Object.keys(obj)
                .sort((a, b) => a.localeCompare(b))
                .reduce(
                    /** @returns {JsonObject} */ (result, key) => {
                        result[key] = sortKeys(obj[key]);
                        return result;
                    },
                    {}
                );
        }

        return obj;
    }

    const sortedSchema = sortKeys(schema);
    await writeFile(
        schemaOutputPath,
        `${JSON.stringify(sortedSchema, null, 4)}\n`,
        "utf8"
    );

    console.log(`Generated schema at: ${schemaOutputPath}`);
    console.log(
        `Starter workflow categories: ${starterWorkflowCategories.length}`
    );
    console.log(`Linguist languages: ${linguistLanguages.length}`);
    console.log(`Supported tech stacks: ${techStacks.length}`);
    console.log(`Octicons extracted: ${octiconValues.length}`);
    console.log(`Octicons version: ${OCTICONS_REACT_VERSION}`);
    console.log(
        `Combined category enum values: ${allCategoryValuesCount(schema)}`
    );
}

/**
 * Get category enum count from generated schema.
 *
 * @param {GeneratedSchemaSummary} schema
 *
 * @returns {number}
 */
function allCategoryValuesCount(schema) {
    return schema?.properties?.categories?.items?.anyOf?.[0]?.enum?.length || 0;
}

await main();
