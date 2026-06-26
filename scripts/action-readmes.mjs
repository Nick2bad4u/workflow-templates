import { readdir } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const actionsRoot = path.join(repoRoot, ".github", "actions");
const mode = process.argv.includes("--write") ? "update" : "diff";

/**
 * Return sorted composite action directory paths.
 *
 * @returns {Promise<string[]>}
 */
async function getActionDirectories() {
    const entries = await readdir(actionsRoot, { withFileTypes: true });

    return entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => path.join(actionsRoot, entry.name))
        .sort((a, b) => a.localeCompare(b));
}

/**
 * Run gh-action-readme in one action directory.
 *
 * @param {string} actionDirectory
 *
 * @returns {boolean}
 */
function runActionReadme(actionDirectory) {
    const relativeDirectory = path.relative(repoRoot, actionDirectory);
    console.log(`gh action-readme ${mode}: ${relativeDirectory}`);

    const result = spawnSync("gh", ["action-readme", mode], {
        cwd: actionDirectory,
        stdio: "inherit",
    });

    return result.status === 0;
}

const failures = [];

for (const actionDirectory of await getActionDirectories()) {
    if (!runActionReadme(actionDirectory)) {
        failures.push(path.relative(repoRoot, actionDirectory));
    }
}

if (failures.length > 0) {
    throw new Error(
        `Composite action README ${mode} failed for:\n${failures
            .map((failure) => `- ${failure}`)
            .join("\n")}`
    );
}
