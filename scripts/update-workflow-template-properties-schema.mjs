import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { fileURLToPath } from "node:url";

/**
 * @typedef {Record<string, unknown>} JsonObject
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
const FETCH_MAX_ATTEMPTS = 4;
const FETCH_RETRY_STATUS_CODES = new Set([
    408,
    429,
    500,
    502,
    503,
    504,
]);
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

class FetchTextError extends Error {
    /**
     * @param {string} url
     * @param {Response} response
     */
    constructor(url, response) {
        super(
            `Failed to fetch ${url}: ${response.status} ${response.statusText}`
        );
        this.name = "FetchTextError";
        this.status = response.status;
    }
}

/**
 * Return the available GitHub API token.
 *
 * @returns {string}
 */
function getGitHubToken() {
    return process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
}

/**
 * Return request headers for a text fetch.
 *
 * @param {string} url
 * @param {string} accept
 *
 * @returns {Record<string, string>}
 */
function getFetchHeaders(url, accept) {
    const headers = {
        "user-agent": "workflow-templates-schema-updater",
        accept,
    };
    const token = getGitHubToken();

    if (token && new URL(url).hostname === "api.github.com") {
        headers.authorization = `Bearer ${token}`;
    }

    return headers;
}

/**
 * Convert a raw.githubusercontent.com URL to a GitHub API raw-content URL.
 *
 * @param {string} url
 *
 * @returns {string | null}
 */
function getGitHubApiRawContentUrl(url) {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname !== "raw.githubusercontent.com") {
        return null;
    }

    const [
        owner,
        repo,
        ref,
        ...pathParts
    ] = parsedUrl.pathname.split("/").filter(Boolean);

    if (!owner || !repo || !ref || pathParts.length === 0) {
        return null;
    }

    const contentPath = pathParts.map(encodeURIComponent).join("/");
    const apiUrl = new URL(
        `/repos/${owner}/${repo}/contents/${contentPath}`,
        "https://api.github.com"
    );
    apiUrl.searchParams.set("ref", ref);

    return apiUrl.href;
}

/**
 * Fetch a UTF-8 text resource once.
 *
 * @param {string} url
 * @param {string} accept
 *
 * @returns {Promise<string>}
 */
async function fetchTextOnce(url, accept) {
    const response = await fetch(url, {
        headers: getFetchHeaders(url, accept),
    });

    if (!response.ok) {
        throw new FetchTextError(url, response);
    }

    return response.text();
}

/**
 * Return whether a fetch error should be retried.
 *
 * @param {unknown} error
 *
 * @returns {boolean}
 */
function shouldRetryFetch(error) {
    return (
        error instanceof FetchTextError &&
        FETCH_RETRY_STATUS_CODES.has(error.status)
    );
}

/**
 * Return the retry delay for a fetch attempt.
 *
 * @param {number} attemptIndex
 *
 * @returns {number}
 */
function getFetchRetryDelayMs(attemptIndex) {
    return Math.min(1000 * 2 ** attemptIndex, 8000);
}

/**
 * Fetch a UTF-8 text resource.
 *
 * @param {string} url
 *
 * @returns {Promise<string>}
 */
async function fetchText(url) {
    const githubApiUrl = getGitHubApiRawContentUrl(url);
    const textAccept =
        "text/plain, text/markdown, application/yaml, text/yaml, */*";
    const githubRawAccept = "application/vnd.github.raw, text/plain, */*";
    const urls =
        githubApiUrl && getGitHubToken()
            ? [
                  [githubApiUrl, githubRawAccept],
                  [url, textAccept],
              ]
            : [
                  [url, textAccept],
                  ...(githubApiUrl ? [[githubApiUrl, githubRawAccept]] : []),
              ];
    let lastError;

    for (
        let attemptIndex = 0;
        attemptIndex < FETCH_MAX_ATTEMPTS;
        attemptIndex += 1
    ) {
        for (const [candidateUrl, accept] of urls) {
            try {
                return await fetchTextOnce(candidateUrl, accept);
            } catch (error) {
                lastError = error;

                if (!shouldRetryFetch(error)) {
                    break;
                }
            }
        }

        if (
            !shouldRetryFetch(lastError) ||
            attemptIndex === FETCH_MAX_ATTEMPTS - 1
        ) {
            break;
        }

        await sleep(getFetchRetryDelayMs(attemptIndex));
    }

    throw lastError;
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

        const trimmedLine = line.trim();
        if (trimmedLine.startsWith("* ")) {
            categories.push(trimmedLine.slice(2).trim());
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

        const trimmedLine = line.trimStart();
        if (trimmedLine.startsWith("- ")) {
            techStacks.push(trimmedLine.slice(2).trim());
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
    const base = componentName.endsWith("Icon")
        ? componentName.slice(0, -4)
        : componentName;
    const parts = [];
    let currentPart = "";

    for (let index = 0; index < base.length; index += 1) {
        const character = base[index];
        const previousCharacter = base[index - 1] ?? "";
        const nextCharacter = base[index + 1] ?? "";
        const startsWord =
            index > 0 &&
            isUppercaseLetter(character) &&
            (isLowercaseLetterOrDigit(previousCharacter) ||
                (isUppercaseLetter(previousCharacter) &&
                    isLowercaseLetter(nextCharacter)));

        if (startsWord) {
            parts.push(currentPart);
            currentPart = character;
            continue;
        }

        currentPart += character;
    }

    if (currentPart) {
        parts.push(currentPart);
    }

    return parts.join("-").toLowerCase();
}

/**
 * Check whether a character is an uppercase ASCII letter.
 *
 * @param {string} character
 *
 * @returns {boolean}
 */
function isUppercaseLetter(character) {
    return character >= "A" && character <= "Z";
}

/**
 * Check whether a character is a lowercase ASCII letter.
 *
 * @param {string} character
 *
 * @returns {boolean}
 */
function isLowercaseLetter(character) {
    return character >= "a" && character <= "z";
}

/**
 * Check whether a character is a lowercase ASCII letter or digit.
 *
 * @param {string} character
 *
 * @returns {boolean}
 */
function isLowercaseLetterOrDigit(character) {
    return (
        isLowercaseLetter(character) || (character >= "0" && character <= "9")
    );
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
     * @param {unknown} obj
     *
     * @returns {unknown}
     */
    function sortKeys(obj) {
        if (Array.isArray(obj)) {
            return obj.map(sortKeys);
        }

        if (obj !== null && typeof obj === "object") {
            const object = /** @type {JsonObject} */ (obj);

            return Object.keys(obj)
                .sort((a, b) => a.localeCompare(b))
                .reduce(
                    /** @returns {JsonObject} */ (result, key) => {
                        result[key] = sortKeys(object[key]);
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
