# Composite Actions

This repository publishes composite actions under `.github/actions/` for
step-level reuse in workflows. Use them when a consumer repository needs a
shared sequence of steps but still owns the workflow trigger, job permissions,
runner, matrix, checkout, and setup.

Use reusable workflows instead when you want this repository to own the whole
job contract. See [Reusable Workflows](./reusable-workflows.md) for
`jobs.<job_id>.uses` examples.

## Available Examples

| Example | Purpose |
| --- | --- |
| [`npm-release-steps.yml`](../examples/composite-actions/npm-release-steps.yml) | Builds an npm release workflow from the release composite actions. |
| [`node-test-codecov.yml`](../examples/composite-actions/node-test-codecov.yml) | Runs Vitest coverage, verifies artifacts, and uploads Codecov reports. |

## Calling Actions

Consumer workflows call composite actions from normal steps:

```yaml
steps:
    - name: "Resolve target ref"
      id: "target_ref"
      uses: "Nick2bad4u/workflow-templates/.github/actions/resolve-target-ref@main"
      with:
          ref: "${{ inputs.ref || '' }}"
          default-branch: "main"
```

The examples use `@main` because these actions are maintained from this
repository. Use a pinned tag or commit SHA for repositories you do not control
or for release workflows that need a fixed automation contract.

## Action Inventory

| Action | Purpose |
| --- | --- |
| `resolve-target-ref` | Resolves the branch or ref for tag and `workflow_dispatch` release flows. |
| `configure-release-git` | Configures release automation Git identity and optional tag fetches. |
| `validate-npm-release-input` | Validates explicit release versions and release bump types. |
| `validate-package-tag` | Confirms a `v*` tag matches `package.json` version. |
| `warn-skip-verify` | Emits a standard warning when manual verification is skipped. |
| `ensure-clean-worktree` | Fails when verification changes tracked files. |
| `determine-npm-release-version` | Resolves npm package version, tag, package name, and release URLs. |
| `check-npm-version-published` | Checks whether `package@version` already exists on npm. |
| `prevent-duplicate-npm-release` | Fails manual releases for already-published versions. |
| `commit-release-version` | Commits version changes, creates an annotated tag, and pushes both. |
| `generate-git-cliff-release-notes` | Runs a configurable git-cliff release-notes command. |
| `publish-npm-package` | Runs `npm publish` with configurable access, provenance, registry, and dry-run flags. |
| `create-npm-release-archives` | Creates npm tarball and zip release assets. |
| `create-github-release` | Creates a GitHub release through pinned `softprops/action-gh-release`. |
| `write-release-summary` | Writes a standardized release summary to `GITHUB_STEP_SUMMARY`. |
| `run-vitest-coverage-junit` | Runs Vitest with coverage and JUnit output. |
| `verify-path-exists` | Verifies generated artifacts such as LCOV or JUnit files. |
| `upload-codecov-report` | Uploads coverage or test-result reports through pinned Codecov. |
| `upload-codecov-bundle-analysis` | Uploads Codecov bundle analysis for a built `dist` directory. |

## Inputs And Types

Composite action inputs are not typed like reusable workflow inputs. GitHub
action metadata supports input descriptions, `required`, `default`, and
`deprecationMessage`, but it does not support an input `type` property.

Practically, that means callers pass strings through `with`, and each composite
action must validate booleans, choices, versions, paths, and numeric values
itself. Keep validation close to the action so bad caller input fails before a
publish, tag, release, or upload step runs.

Reusable workflows are different: `on.workflow_call.inputs` requires a `type`
of `boolean`, `number`, or `string`. Manual workflows also support
`workflow_dispatch` input types such as `choice`, `boolean`, `number`,
`environment`, and `string`.

See GitHub's
[action metadata syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/metadata-syntax)
and
[workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax)
references for the current input metadata fields.

## Testing

Composite actions do not have native line coverage. Use these layers instead:

- Static validation with ESLint, Prettier, yamllint, actionlint, and gitleaks.
- Fixture workflows or fixture repositories that call the composite actions
  with `dry-run` inputs.
- Shell tests for extracted scripts when an action grows complex enough that
  Bash logic needs branch coverage.

Keep destructive behavior behind explicit inputs such as `dry-run`, and test
release actions against fixture packages instead of production packages.
