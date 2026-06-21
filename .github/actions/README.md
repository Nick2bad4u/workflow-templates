# Composite Actions

This directory contains reusable composite actions for release automation, npm package publishing, release assets, Codecov uploads, and test report verification.

Call these actions from this repository or downstream repositories with a pinned ref:

```yaml
- uses: "Nick2bad4u/workflow-templates/.github/actions/resolve-target-ref@main"
  with:
   ref: "${{ inputs.ref }}"
   default-branch: "main"
```

Use a commit SHA or tag outside repositories you control. `@main` is only appropriate for trusted callers that intentionally track this repository.

## Release Actions

| Action                             | Purpose                                                                     |
| ---------------------------------- | --------------------------------------------------------------------------- |
| `resolve-target-ref`               | Resolves the branch/ref for tag and `workflow_dispatch` release flows.      |
| `configure-release-git`            | Configures Git identity and refreshes tags.                                 |
| `validate-npm-release-input`       | Validates explicit versions and release types.                              |
| `validate-package-tag`             | Confirms a tag matches `package.json` version.                              |
| `warn-skip-verify`                 | Emits a standardized warning for skipped package verification.              |
| `ensure-clean-worktree`            | Fails when verification modifies tracked files.                             |
| `determine-npm-release-version`    | Resolves package version, tag, package name, and release URLs.              |
| `check-npm-version-published`      | Checks whether `package@version` is already published.                      |
| `prevent-duplicate-npm-release`    | Fails duplicate manual npm releases.                                        |
| `commit-release-version`           | Commits version changes, creates an annotated tag, and pushes both.         |
| `generate-git-cliff-release-notes` | Runs a configurable git-cliff release-notes command.                        |
| `publish-npm-package`              | Publishes an npm package with configurable provenance and dry-run behavior. |
| `create-npm-release-archives`      | Creates npm tarball and zip release assets.                                 |
| `create-github-release`            | Creates a GitHub release through pinned `softprops/action-gh-release`.      |
| `write-release-summary`            | Writes a standardized release summary.                                      |

## Test And Codecov Actions

| Action                           | Purpose                                                                               |
| -------------------------------- | ------------------------------------------------------------------------------------- |
| `upload-codecov-bundle-analysis` | Runs Codecov bundle analysis for a built `dist` directory.                            |
| `run-vitest-coverage-junit`      | Runs Vitest with coverage and JUnit output.                                           |
| `verify-path-exists`             | Verifies generated artifacts such as `coverage/lcov.info` or `test-report.junit.xml`. |
| `upload-codecov-report`          | Uploads coverage or test-results reports through pinned `codecov/codecov-action`.     |

## Testing Strategy

Composite actions do not have line coverage in the same way JavaScript actions do. The practical coverage model is:

- Static validation with ESLint, Prettier, yamllint, actionlint workflows, and gitleaks.
- Smoke workflows or fixture repositories that call composite actions with safe `dry-run` inputs.
- Fixture repositories for release actions that would otherwise publish, tag, or create releases.

For this repository, a fixture repository is the cleanest end-to-end route because the shared workflow lint rules intentionally disallow repository-local `uses` references. In-repository smoke tests are still possible, but they need a narrowly scoped lint override for the smoke workflow.
