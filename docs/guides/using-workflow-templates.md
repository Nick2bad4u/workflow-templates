# Using Workflow Templates

This guide is for repositories that want to adopt one of these workflow templates.

## Choose A Template

Start from the workflow that matches the job you want to automate:

| Need | Template |
| --- | --- |
| Node.js CI across OSes | `node-test-matrix.yml` |
| npm package publishing | `npm-release.yml` |
| Code scanning | `codeql-analysis-advanced.yml` |
| Dependency and license review | `dependency-review-enhanced.yml` |
| Secret scanning | `gitleaks-scan-enhanced.yml` or `trufflehog-scan.yml` |
| PR labeling | `labeler.yml` |
| Stale issue management | `stale-management.yml` |
| OpenSSF Scorecard | `ossf-scorecard.yml` |
| Docusaurus deployment | `docusaurus-deploy.yml` |
| IndexNow notifications | `indexnow-submit.yml` |

## Install From GitHub UI

1. Open the consumer repository on GitHub.
2. Go to **Actions**.
3. Select **New workflow** or **Explore workflows**.
4. Pick the template.
5. Review the generated workflow before committing it.
6. Replace template placeholders such as `$default-branch` only if GitHub did not resolve them automatically.

## Copy Directly

Copy only the workflow YAML into the consumer repository:

```bash
mkdir -p .github/workflows
cp path/to/workflow-templates/.github/workflow-templates/node-test-matrix.yml .github/workflows/node-test-matrix.yml
```

Do not copy `.properties.json` files into ordinary consumer repositories. Those files are metadata for repositories that publish workflow templates.

## Minimum Repository Setup

Most Node-focused templates assume:

- A `package.json` file.
- A committed lockfile, usually `package-lock.json`.
- A `.node-version` file matching the Node version you support.
- Scripts such as `build`, `typecheck`, `test`, or `docs:build` when the selected template calls them.

Security templates usually run without project-specific setup, but they become more useful when the repository also has:

- `SECURITY.md`
- `CODEOWNERS`
- Dependabot configuration
- Branch protection rules

## Secrets And Permissions

Only add secrets that the selected workflow actually needs.

| Template | Secret | Required |
| --- | --- | --- |
| `node-test-matrix.yml` | `CODECOV_TOKEN` | Only for private Codecov uploads or token-required Codecov setup |
| `npm-release.yml` | `NPM_TOKEN` | Required for token-based npm publish; trusted publishing may remove this later |
| `indexnow-submit.yml` | `INDEXNOW_KEY` | Required |

Keep the workflow `permissions` block as narrow as possible. Add write permissions only when a job needs to publish, deploy, comment, label, or upload security results.

## First Run Checklist

- Commit the workflow on a feature branch first.
- Open the Actions run and confirm every required script exists.
- Check that cache keys are using the right lockfile.
- Confirm required repository settings are enabled, such as GitHub Pages source set to **GitHub Actions** for `docusaurus-deploy.yml`.
- Confirm required labels exist before enabling `labeler.yml` or `stale-management.yml`.
- Confirm secret-scanning allowlists are intentional before merging.

## Customization Rules

- Change branch and path filters to match your release flow.
- Reduce matrices before removing validation entirely.
- Prefer adding an explicit script in `package.json` over embedding long project-specific logic in workflow YAML.
- Keep action versions pinned and update them deliberately.
- Keep `timeout-minutes` on every job.

See the per-template details in [`USAGE.md`](../../USAGE.md).
