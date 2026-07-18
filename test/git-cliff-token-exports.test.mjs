import assert from "node:assert/strict";
import test from "node:test";

import { findGitCliffTokenExportFailures } from "../scripts/validate-git-cliff-token-exports.mjs";

const releaseCommand =
    'npm run --silent changelog:release-notes -- --output "${RELEASE_NOTES_PATH}"';

/**
 * @typedef {object} WorkflowStepOptions
 *
 * @property {string[]} [after]
 * @property {string[]} [before]
 * @property {string} [command]
 */

/**
 * @param {WorkflowStepOptions} [options]
 *
 * @returns {string}
 */
function createWorkflowStep({
    after = [],
    before = [],
    command = releaseCommand,
} = {}) {
    return [
        "jobs:",
        "  release:",
        "    steps:",
        '      - name: "Generate release notes"',
        ...before.map((line) => `        ${line}`),
        "        run: |",
        `          ${command}`,
        ...after,
    ].join("\n");
}

test("accepts github.token exported in the release-note step", () => {
    const source = createWorkflowStep({
        before: ["env:", '  GITHUB_TOKEN: "${{ github.token }}"'],
    });

    assert.deepEqual(findGitCliffTokenExportFailures(source), []);
});

test("accepts secrets.GITHUB_TOKEN exported in the release-note step", () => {
    const source = createWorkflowStep({
        before: ["env:", '  GITHUB_TOKEN: "${{ secrets.GITHUB_TOKEN }}"'],
    });

    assert.deepEqual(findGitCliffTokenExportFailures(source), []);
});

test("rejects an online release-note step without a token export", () => {
    const failures = findGitCliffTokenExportFailures(createWorkflowStep());

    assert.equal(failures.length, 1);
    assert.match(failures[0]?.message ?? "", /must export GITHUB_TOKEN/v);
});

test("does not accept a token exported only by another step", () => {
    const source = createWorkflowStep({
        after: [
            '      - name: "Create release"',
            "        env:",
            '          GITHUB_TOKEN: "${{ github.token }}"',
            '        run: echo "release"',
        ],
    });

    assert.equal(findGitCliffTokenExportFailures(source).length, 1);
});

test("does not accept a token mentioned in the release command", () => {
    const source = createWorkflowStep({
        command: [
            releaseCommand,
            "echo 'GITHUB_TOKEN: \"${{ github.token }}\"'",
        ].join("\n"),
    });

    assert.equal(findGitCliffTokenExportFailures(source).length, 1);
});

test("allows an explicitly offline release-note step without a token", () => {
    const source = createWorkflowStep({
        command: `${releaseCommand} --offline`,
    });

    assert.deepEqual(findGitCliffTokenExportFailures(source), []);
});

test("ignores workflows without a release-note command", () => {
    const source = createWorkflowStep({ command: "npm run lint" });

    assert.deepEqual(findGitCliffTokenExportFailures(source), []);
});
