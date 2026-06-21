# Reusable Workflows

This repository also publishes reusable workflow variants for the workflow templates.

Reusable workflows are different from workflow templates:

- Workflow templates live in `.github/workflow-templates/` and are copied into a consumer repository by the GitHub Actions UI.
- Reusable workflows live directly in `.github/workflows/` and are called from a consumer workflow with `jobs.<job_id>.uses`.

GitHub does not support reusable workflows from subdirectories under `.github/workflows/`, so the reusable workflow files use the `reusable-` filename prefix instead of a separate folder inside `.github/workflows/`.

The caller examples keep top-level `permissions: {}` and grant only the called workflow's required scopes on the `jobs.<job_id>.permissions` block. The caller workflow owns the `on:` trigger, so examples with default-branch filters include both `main` and `master` for compatibility.

## Available Workflows

| Template                                 | Reusable workflow                                                   | Caller example                                                                                                                  |
| ---------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `auto-merge-dependabot.yml`              | `.github/workflows/reusable-auto-merge-dependabot.yml`              | [`auto-merge-dependabot-caller.yml`](../examples/reusable-workflows/auto-merge-dependabot-caller.yml)                           |
| `codeql-analysis-advanced.yml`           | `.github/workflows/reusable-codeql-analysis-advanced.yml`           | [`codeql-analysis-advanced-caller.yml`](../examples/reusable-workflows/codeql-analysis-advanced-caller.yml)                     |
| Manual-build CodeQL variant              | `.github/workflows/reusable-codeql-analysis-build.yml`              | [`codeql-analysis-build-caller.yml`](../examples/reusable-workflows/codeql-analysis-build-caller.yml)                           |
| `dependency-review-enhanced.yml`         | `.github/workflows/reusable-dependency-review-enhanced.yml`         | [`dependency-review-enhanced-caller.yml`](../examples/reusable-workflows/dependency-review-enhanced-caller.yml)                 |
| `docusaurus-deploy.yml`                  | `.github/workflows/reusable-docusaurus-deploy.yml`                  | [`docusaurus-deploy-caller.yml`](../examples/reusable-workflows/docusaurus-deploy-caller.yml)                                   |
| `git-cliff-release-notes-validation.yml` | `.github/workflows/reusable-git-cliff-release-notes-validation.yml` | [`git-cliff-release-notes-validation-caller.yml`](../examples/reusable-workflows/git-cliff-release-notes-validation-caller.yml) |
| `gitleaks-scan-enhanced.yml`             | `.github/workflows/reusable-gitleaks-scan-enhanced.yml`             | [`gitleaks-scan-enhanced-caller.yml`](../examples/reusable-workflows/gitleaks-scan-enhanced-caller.yml)                         |
| `indexnow-submit.yml`                    | `.github/workflows/reusable-indexnow-submit.yml`                    | [`indexnow-submit-caller.yml`](../examples/reusable-workflows/indexnow-submit-caller.yml)                                       |
| `labeler.yml`                            | `.github/workflows/reusable-labeler.yml`                            | [`labeler-caller.yml`](../examples/reusable-workflows/labeler-caller.yml)                                                       |
| `node-test-matrix.yml`                   | `.github/workflows/reusable-node-test-matrix.yml`                   | [`node-test-matrix-caller.yml`](../examples/reusable-workflows/node-test-matrix-caller.yml)                                     |
| `npm-release.yml`                        | `.github/workflows/reusable-npm-release.yml`                        | [`npm-release-caller.yml`](../examples/reusable-workflows/npm-release-caller.yml)                                               |
| `ossf-scorecard.yml`                     | `.github/workflows/reusable-ossf-scorecard.yml`                     | [`ossf-scorecard-caller.yml`](../examples/reusable-workflows/ossf-scorecard-caller.yml)                                         |
| `stale-management.yml`                   | `.github/workflows/reusable-stale-management.yml`                   | [`stale-management-caller.yml`](../examples/reusable-workflows/stale-management-caller.yml)                                     |
| `trufflehog-scan.yml`                    | `.github/workflows/reusable-trufflehog-scan.yml`                    | [`trufflehog-scan-caller.yml`](../examples/reusable-workflows/trufflehog-scan-caller.yml)                                       |
| `automatic-rebase.yml` | `.github/workflows/reusable-automatic-rebase.yml` | [`automatic-rebase-caller.yml`](../examples/reusable-workflows/automatic-rebase-caller.yml) |
| `pssecret-scanner.yml` | `.github/workflows/reusable-pssecret-scanner.yml` | [`pssecret-scanner-caller.yml`](../examples/reusable-workflows/pssecret-scanner-caller.yml) |
| `ai-issue-pr-summary.yml` | `.github/workflows/reusable-ai-issue-pr-summary.yml` | [`ai-issue-pr-summary-caller.yml`](../examples/reusable-workflows/ai-issue-pr-summary-caller.yml) |
| `first-interaction-greeting.yml` | `.github/workflows/reusable-first-interaction-greeting.yml` | [`first-interaction-greeting-caller.yml`](../examples/reusable-workflows/first-interaction-greeting-caller.yml) |
| `release-cleanup.yml` | `.github/workflows/reusable-release-cleanup.yml` | [`release-cleanup-caller.yml`](../examples/reusable-workflows/release-cleanup-caller.yml) |
| `dependency-validation.yml` | `.github/workflows/reusable-dependency-validation.yml` | [`dependency-validation-caller.yml`](../examples/reusable-workflows/dependency-validation-caller.yml) |
| `virustotal-release-scan.yml` | `.github/workflows/reusable-virustotal-release-scan.yml` | [`virustotal-release-scan-caller.yml`](../examples/reusable-workflows/virustotal-release-scan-caller.yml) |
| `internet-archive-upload.yml` | `.github/workflows/reusable-internet-archive-upload.yml` | [`internet-archive-upload-caller.yml`](../examples/reusable-workflows/internet-archive-upload-caller.yml) |
| `codacy-coverage.yml` | `.github/workflows/reusable-codacy-coverage.yml` | [`codacy-coverage-caller.yml`](../examples/reusable-workflows/codacy-coverage-caller.yml) |
| `mega-linter.yml` | `.github/workflows/reusable-mega-linter.yml` | [`mega-linter-caller.yml`](../examples/reusable-workflows/mega-linter-caller.yml) |
| `playwright-e2e.yml` | `.github/workflows/reusable-playwright-e2e.yml` | [`playwright-e2e-caller.yml`](../examples/reusable-workflows/playwright-e2e-caller.yml) |
| `release-stats.yml` | `.github/workflows/reusable-release-stats.yml` | [`release-stats-caller.yml`](../examples/reusable-workflows/release-stats-caller.yml) |
| `sonarcloud-analysis.yml` | `.github/workflows/reusable-sonarcloud-analysis.yml` | [`sonarcloud-analysis-caller.yml`](../examples/reusable-workflows/sonarcloud-analysis-caller.yml) |
| `changelog-update.yml` | `.github/workflows/reusable-changelog-update.yml` | [`changelog-update-caller.yml`](../examples/reusable-workflows/changelog-update-caller.yml) |
| `jekyll-pages-deploy.yml` | `.github/workflows/reusable-jekyll-pages-deploy.yml` | [`jekyll-pages-deploy-caller.yml`](../examples/reusable-workflows/jekyll-pages-deploy-caller.yml) |
| `actionlint.yml` | `.github/workflows/reusable-actionlint.yml` | [`actionlint-caller.yml`](../examples/reusable-workflows/actionlint-caller.yml) |
| `devskim-analysis.yml` | `.github/workflows/reusable-devskim-analysis.yml` | [`devskim-analysis-caller.yml`](../examples/reusable-workflows/devskim-analysis-caller.yml) |
| `ossar-analysis.yml` | `.github/workflows/reusable-ossar-analysis.yml` | [`ossar-analysis-caller.yml`](../examples/reusable-workflows/ossar-analysis-caller.yml) |
| `prettier-check.yml` | `.github/workflows/reusable-prettier-check.yml` | [`prettier-check-caller.yml`](../examples/reusable-workflows/prettier-check-caller.yml) |
| `repository-metrics.yml` | `.github/workflows/reusable-repository-metrics.yml` | [`repository-metrics-caller.yml`](../examples/reusable-workflows/repository-metrics-caller.yml) |
| `microsoft-security-devops.yml` | `.github/workflows/reusable-microsoft-security-devops.yml` | [`microsoft-security-devops-caller.yml`](../examples/reusable-workflows/microsoft-security-devops-caller.yml) |
| `sitemap-generator.yml` | `.github/workflows/reusable-sitemap-generator.yml` | [`sitemap-generator-caller.yml`](../examples/reusable-workflows/sitemap-generator-caller.yml) |
| `spellcheck.yml` | `.github/workflows/reusable-spellcheck.yml` | [`spellcheck-caller.yml`](../examples/reusable-workflows/spellcheck-caller.yml) |
| `static-pages-deploy.yml` | `.github/workflows/reusable-static-pages-deploy.yml` | [`static-pages-deploy-caller.yml`](../examples/reusable-workflows/static-pages-deploy-caller.yml) |
| `stylelint-check.yml` | `.github/workflows/reusable-stylelint-check.yml` | [`stylelint-check-caller.yml`](../examples/reusable-workflows/stylelint-check-caller.yml) |
| `super-linter.yml` | `.github/workflows/reusable-super-linter.yml` | [`super-linter-caller.yml`](../examples/reusable-workflows/super-linter-caller.yml) |
| `typos-spellcheck.yml` | `.github/workflows/reusable-typos-spellcheck.yml` | [`typos-spellcheck-caller.yml`](../examples/reusable-workflows/typos-spellcheck-caller.yml) |

## Caller Example

A consumer repository calls a reusable workflow from a job:

```yaml
jobs:
  dependabot-auto-merge:
    permissions:
      contents: write
      pull-requests: write
    uses: Nick2bad4u/workflow-templates/.github/workflows/reusable-auto-merge-dependabot.yml@main
    with:
      semver-policy: patch,minor
```

See the caller examples in the table above for complete consumer workflows.

## Inputs And Secrets

Reusable workflows can accept `with` inputs and `secrets` from the caller. Caller jobs must grant any permissions the called workflow needs.

Examples:

```yaml
jobs:
  release:
    permissions:
      contents: write
      id-token: write
    uses: Nick2bad4u/workflow-templates/.github/workflows/reusable-npm-release.yml@main
    with:
      release_type: patch
    secrets:
      NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

```yaml
jobs:
  validate-release-notes:
    permissions:
      contents: read
    uses: Nick2bad4u/workflow-templates/.github/workflows/reusable-git-cliff-release-notes-validation.yml@main
    with:
      tag: v1.2.3
```

Use a pinned tag or commit SHA instead of `@main` when stability matters.

## Maintenance

Keep reusable workflows behaviorally aligned with their template counterparts. When a template changes, review the matching `reusable-*.yml` file and update both docs surfaces if the consumer contract changes.
