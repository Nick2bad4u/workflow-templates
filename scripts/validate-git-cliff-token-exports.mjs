import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const currentFilePath = fileURLToPath(import.meta.url);
const repositoryRoot = path.resolve(path.dirname(currentFilePath), "..");
const automationRoots = [
    ".github/actions",
    ".github/workflows",
    ".github/workflow-templates",
    ".github/workflow-templates-staging",
];
const releaseCommand = "changelog:release-notes";
const releaseCommandVariable = "RELEASE_NOTES_COMMAND";
const stepStartPattern = /^(\s*)-\s+(?:name|run|uses)\s*:/u;
const builtInTokenPattern =
    /^\s*GITHUB_TOKEN\s*:\s*["']?\$\{\{\s*(?:github\.token|secrets\.GITHUB_TOKEN)\s*\}\}/u;
const offlinePattern =
    /(?:--offline\b|GIT_CLIFF_OFFLINE\s*:\s*["']?(?:1|true)\b)/iu;

/**
 * Determine whether a step has a built-in token in its env mapping.
 *
 * @param {string[]} lines
 * @param {number} stepIndentation
 *
 * @returns {boolean}
 */
function hasBuiltInTokenEnvironment(lines, stepIndentation) {
    for (const [lineIndex, line] of lines.entries()) {
        const environmentMatch = /^(\s*)env\s*:\s*(?:#.*)?$/u.exec(line);

        if (!environmentMatch) {
            continue;
        }

        const environmentIndentation = environmentMatch[1]?.length ?? 0;

        if (environmentIndentation <= stepIndentation) {
            continue;
        }

        for (
            let candidateIndex = lineIndex + 1;
            candidateIndex < lines.length;
            candidateIndex += 1
        ) {
            const candidate = lines[candidateIndex] ?? "";

            if (
                candidate.trim() === "" ||
                candidate.trimStart().startsWith("#")
            ) {
                continue;
            }

            const candidateIndentation =
                /^\s*/u.exec(candidate)?.[0].length ?? 0;

            if (candidateIndentation <= environmentIndentation) {
                break;
            }

            if (builtInTokenPattern.test(candidate)) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Find the enclosing GitHub Actions step for a source line.
 *
 * @param {string[]} lines
 * @param {number} lineIndex
 *
 * @returns {{ endIndex: number; startIndex: number } | undefined}
 */
function findEnclosingStep(lines, lineIndex) {
    for (let index = lineIndex; index >= 0; index -= 1) {
        const match = stepStartPattern.exec(lines[index] ?? "");

        if (!match) {
            continue;
        }

        const indentation = match[1]?.length ?? 0;
        let endIndex = lines.length;

        for (
            let candidate = index + 1;
            candidate < lines.length;
            candidate += 1
        ) {
            const candidateMatch = /^(\s*)-\s+/u.exec(lines[candidate] ?? "");

            if ((candidateMatch?.[1]?.length ?? -1) === indentation) {
                endIndex = candidate;
                break;
            }
        }

        return { endIndex, startIndex: index };
    }

    return undefined;
}

/**
 * Find steps that invoke the release-note command directly or through the
 * shared composite action's command variable.
 *
 * @param {string[]} lines
 *
 * @returns {{ endIndex: number; lineIndex: number; startIndex: number }[]}
 */
function findReleaseNoteSteps(lines) {
    const steps = new Map();

    for (const [lineIndex, line] of lines.entries()) {
        if (
            (!line.includes(releaseCommand) &&
                !line.includes(releaseCommandVariable)) ||
            line.trimStart().startsWith("#")
        ) {
            continue;
        }

        const step = findEnclosingStep(lines, lineIndex);

        if (step && !steps.has(step.startIndex)) {
            steps.set(step.startIndex, { ...step, lineIndex });
        }
    }

    return [...steps.values()];
}

/**
 * Find online git-cliff release-note steps that do not export GitHub's built-in
 * workflow token in the same step.
 *
 * @param {string} source
 * @param {string} [filePath]
 *
 * @returns {{ filePath: string; line: number; message: string }[]}
 */
export function findGitCliffTokenExportFailures(
    source,
    filePath = "workflow.yml"
) {
    const lines = source.split(/\r?\n/u);
    const failures = [];

    for (const step of findReleaseNoteSteps(lines)) {
        const stepLines = lines.slice(step.startIndex, step.endIndex);
        const stepSource = stepLines.join("\n");
        const stepIndentation =
            stepStartPattern.exec(lines[step.startIndex] ?? "")?.[1]?.length ??
            0;

        if (
            offlinePattern.test(stepSource) ||
            hasBuiltInTokenEnvironment(stepLines, stepIndentation)
        ) {
            continue;
        }

        failures.push({
            filePath,
            line: step.lineIndex + 1,
            message:
                "Online git-cliff release notes must export GITHUB_TOKEN from github.token or secrets.GITHUB_TOKEN in the same step.",
        });
    }

    return failures;
}

/**
 * Return YAML workflow files below a directory.
 *
 * @param {string} directoryPath
 *
 * @returns {Promise<string[]>}
 */
async function getWorkflowFiles(directoryPath) {
    const entries = await readdir(directoryPath, { withFileTypes: true });
    const paths = [];

    for (const entry of entries) {
        const entryPath = path.join(directoryPath, entry.name);

        if (entry.isDirectory()) {
            paths.push(...(await getWorkflowFiles(entryPath)));
        } else if (/\.ya?ml$/iu.test(entry.name)) {
            paths.push(entryPath);
        }
    }

    return paths.sort((left, right) => left.localeCompare(right));
}

/**
 * Validate all consumer-facing and repository workflow YAML.
 *
 * @param {string} [rootPath]
 *
 * @returns {Promise<{ checkedFiles: number; checkedSteps: number }>}
 */
export async function validateGitCliffTokenExports(rootPath = repositoryRoot) {
    const workflowFiles = (
        await Promise.all(
            automationRoots.map((relativePath) =>
                getWorkflowFiles(path.join(rootPath, relativePath))
            )
        )
    ).flat();
    const failures = [];
    let checkedSteps = 0;

    for (const workflowFile of workflowFiles) {
        const source = await readFile(workflowFile, "utf8");
        const relativePath = path.relative(rootPath, workflowFile);
        const fileFailures = findGitCliffTokenExportFailures(
            source,
            relativePath
        );
        failures.push(...fileFailures);
        checkedSteps += findReleaseNoteSteps(source.split(/\r?\n/u)).length;
    }

    if (failures.length > 0) {
        throw new Error(
            failures
                .map(
                    (failure) =>
                        `${failure.filePath}:${failure.line} ${failure.message}`
                )
                .join("\n")
        );
    }

    return { checkedFiles: workflowFiles.length, checkedSteps };
}

async function main() {
    const result = await validateGitCliffTokenExports();
    console.log(
        `Validated ${result.checkedSteps} git-cliff release-note step(s) across ${result.checkedFiles} workflow file(s).`
    );
}

if (
    process.argv[1] &&
    import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
    await main();
}
