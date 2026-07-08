import { spawnSync } from "node:child_process";
import { constants as fsConstants } from "node:fs";
import { access, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const actionsRoot = path.join(repoRoot, ".github", "actions");
const mode = process.argv.includes("--write") ? "update" : "diff";
const ghExecutablePath = await findGhExecutablePath();

/**
 * Return fixed candidate paths for the GitHub CLI executable.
 *
 * @returns {string[]}
 */
function getGhExecutableCandidates() {
    if (process.env.GH_CLI_PATH) {
        return [process.env.GH_CLI_PATH];
    }

    if (process.platform === "win32") {
        return [
            "C:\\Program Files\\GitHub CLI\\gh.exe",
            "C:\\Program Files (x86)\\GitHub CLI\\gh.exe",
        ];
    }

    if (process.platform === "darwin") {
        return [
            "/opt/homebrew/bin/gh",
            "/usr/local/bin/gh",
            "/usr/bin/gh",
        ];
    }

    return ["/usr/bin/gh", "/usr/local/bin/gh"];
}

/**
 * Find the GitHub CLI executable without relying on PATH resolution.
 *
 * @returns {Promise<string>}
 */
async function findGhExecutablePath() {
    const candidates = getGhExecutableCandidates();

    for (const candidate of candidates) {
        try {
            await access(candidate, fsConstants.X_OK);
            return candidate;
        } catch {
            // Try the next fixed candidate path.
        }
    }

    throw new Error(
        `GitHub CLI executable not found. Set GH_CLI_PATH to one of: ${candidates.join(", ")}`
    );
}

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

    const result = spawnSync(ghExecutablePath, ["action-readme", mode], {
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
