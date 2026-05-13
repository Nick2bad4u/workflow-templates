import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import Ajv from "ajv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const schemaPath = path.join(
    repoRoot,
    "schemas",
    "github-workflow-template-properties.schema.json"
);
const fixturesRoot = path.join(
    repoRoot,
    "schemas",
    "fixtures",
    "workflow-template-properties"
);

/**
 * Read and parse a JSON file.
 *
 * @param {string} filePath
 *
 * @returns {Promise<unknown>}
 */
async function readJson(filePath) {
    return JSON.parse(await readFile(filePath, "utf8"));
}

/**
 * Return sorted JSON fixture file paths for a directory.
 *
 * @param {string} directoryPath
 *
 * @returns {Promise<string[]>}
 */
async function getFixturePaths(directoryPath) {
    const entries = await readdir(directoryPath, { withFileTypes: true });

    return entries
        .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
        .map((entry) => path.join(directoryPath, entry.name))
        .sort((a, b) => a.localeCompare(b));
}

/**
 * Format Ajv validation errors for terminal output.
 *
 * @param {import("ajv").ErrorObject[] | null | undefined} errors
 *
 * @returns {string}
 */
function formatErrors(errors) {
    if (!errors || errors.length === 0) {
        return "No validation details were provided.";
    }

    return errors
        .map((error) => {
            const instancePath = error.instancePath || "/";
            return `- ${instancePath} ${error.message ?? "validation error"}`;
        })
        .join("\n");
}

/**
 * Validate all schema fixtures.
 *
 * @returns {Promise<void>}
 */
async function main() {
    const schemaDocument = /** @type {Record<string, unknown>} */ (
        await readJson(schemaPath)
    );
    const { $schema: _metaSchema, ...schema } = schemaDocument;
    const ajv = new Ajv({
        allErrors: true,
        strict: false,
        validateFormats: false,
    });
    const validate = ajv.compile(schema);
    const validFixtures = await getFixturePaths(
        path.join(fixturesRoot, "valid")
    );
    const invalidFixtures = await getFixturePaths(
        path.join(fixturesRoot, "invalid")
    );
    const failures = [];

    for (const fixturePath of validFixtures) {
        const data = await readJson(fixturePath);
        const isValid = validate(data);

        if (!isValid) {
            failures.push(
                `Expected valid fixture to pass: ${path.relative(repoRoot, fixturePath)}\n${formatErrors(validate.errors)}`
            );
        }
    }

    for (const fixturePath of invalidFixtures) {
        const data = await readJson(fixturePath);
        const isValid = validate(data);

        if (isValid) {
            failures.push(
                `Expected invalid fixture to fail: ${path.relative(repoRoot, fixturePath)}`
            );
        }
    }

    if (failures.length > 0) {
        throw new Error(failures.join("\n\n"));
    }

    console.log(`Validated ${validFixtures.length} valid fixtures.`);
    console.log(`Validated ${invalidFixtures.length} invalid fixtures.`);
}

await main();
