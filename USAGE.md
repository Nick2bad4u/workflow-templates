# Workflow Usage Guide

Detailed setup, configuration, and best practices for each workflow template.

For centrally maintained callable workflows, see [Reusable Workflows](./docs/guides/reusable-workflows.md).

## Table of Contents

- [Node.js Test & Coverage](#nodejs-test--coverage)
- [npm Release & GitHub Release](#npm-release--github-release)
- [CodeQL Analysis](#codeql-analysis)
- [Auto-Label Pull Requests](#auto-label-pull-requests)
- [Mark Stale Issues & PRs](#mark-stale-issues--prs)
- [Gitleaks Secret Scan](#gitleaks-secret-scan)
- [Dependency Review](#dependency-review)
- [Dependabot Auto-Merge](#dependabot-auto-merge)
- [Trufflehog Secret Scan](#trufflehog-secret-scan)
- [OpenSSF Scorecard](#openssf-scorecard)
- [Deploy Docusaurus to GitHub Pages](#deploy-docusaurus-to-github-pages)
- [Submit IndexNow Notification](#submit-indexnow-notification)
- [Git-Cliff Release Notes Validation](#git-cliff-release-notes-validation)
- [Automatic Pull Request Rebase](#automatic-pull-request-rebase)
- [Ps Secret Scanner Secret Scan](#ps-secret-scanner-secret-scan)
- [Ai Issue And Pull Request Summary](#ai-issue-and-pull-request-summary)
- [First Interaction Greeting](#first-interaction-greeting)
- [Clean Old GitHub Releases](#clean-old-github-releases)
- [Node Dependency Validation](#node-dependency-validation)
- [Virus Total Release Asset Scan](#virus-total-release-asset-scan)
- [Upload Release Assets To Internet Archive](#upload-release-assets-to-internet-archive)
- [Codacy Coverage Upload](#codacy-coverage-upload)
- [Mega Linter](#mega-linter)
- [Playwright End To End Tests](#playwright-end-to-end-tests)
- [GitHub Release Stats](#github-release-stats)
- [Sonar Cloud Analysis](#sonar-cloud-analysis)
- [Update Changelogs](#update-changelogs)
- [Deploy Jekyll To GitHub Pages](#deploy-jekyll-to-github-pages)
- [Actionlint](#actionlint)
- [Dev Skim Security Analysis](#dev-skim-security-analysis)
- [Ossar Security Analysis](#ossar-security-analysis)
- [Prettier Check](#prettier-check)
- [Repository Metrics](#repository-metrics)
- [Microsoft Security DevOps](#microsoft-security-devops)
- [Generate XML Sitemap](#generate-xml-sitemap)
- [Spellcheck](#spellcheck)
- [Deploy Static Content To GitHub Pages](#deploy-static-content-to-github-pages)
- [Stylelint Check](#stylelint-check)
- [Super Linter](#super-linter)
- [Typos Spell Check](#typos-spell-check)
- [General Troubleshooting](#general-troubleshooting)
- [Resources](#resources)

## Node.js Test & Coverage

**File:** `node-test-matrix.yml`
**Purpose:** Run tests across Linux, Windows, and macOS with coverage upload to Codecov.

### Node.js Test & Coverage Getting Started

1. Ensure your project has:
   - `package.json` with test script
   - Test framework (Vitest, Jest, Mocha, etc.)
   - `.node-version` file (optional; workflow auto-detects)

2. (Optional) Add Codecov:

   ```bash
   npm install --save-dev @vitest/coverage-v8
   ```

3. (Optional) Enable Codecov:
   - Visit <https://codecov.io> and sign in with GitHub
   - Activate your repository
   - For private repos, add secret: `CODECOV_TOKEN`

### Node.js Test & Coverage Configuration Options

**Adjust Node versions:**

```yaml
strategy:
 matrix:
  node-version: [20.x, 21.x, 22.x]
  os: [ubuntu-latest, windows-latest, macos-latest]
```

**Reduce test matrix (save costs):**

```yaml
strategy:
 fail-fast: false
 matrix:
  include:
   - os: ubuntu-latest
     node-version: 20.x
   - os: ubuntu-latest
     node-version: 22.x
```

**Custom test script:**

```yaml
- name: Run tests
  run: npm run test:ci
```

### Node.js Test & Coverage Best Practices

- Keep `npm test` deterministic and CI-safe; put coverage flags in the test script if your runner needs them.
- Reduce the OS matrix before removing checks entirely if hosted-runner cost becomes an issue.
- Keep Codecov upload on one OS unless you intentionally need per-OS coverage flags.
- Use `.node-version` as the source of truth for the Node runtime used by `actions/setup-node`.

---

## npm Release & GitHub Release

**File:** `npm-release.yml`
**Purpose:** Publish to npm and create GitHub release on version tags.

### npm Release Getting Started

1. Choose a publishing model:
   - **Trusted publishing:** preferred after npm trusted publishing is configured for the repository.
   - **Token-based publishing:** supported by the template through `NPM_TOKEN`.

2. For token-based publishing, create npm token:
   - Visit <https://npmjs.com/settings/~/tokens>
   - Create "Automation" token (no expiration if possible)

3. Store in GitHub Secrets:
   - Settings → Secrets and variables → Actions
   - Create `NPM_TOKEN` with your token value

4. Configure `package.json`:

   ```json
   {
    "name": "@your-org/your-package",
    "version": "1.0.0",
    "repository": "https://github.com/your-org/your-repo"
   }
   ```

5. Create and push a version tag:

   ```bash
   npm version minor
   git push origin main --tags
   ```

### npm Release Configuration Options

**Custom release notes:**

```yaml
- name: Create GitHub Release
  uses: actions/create-release@v1
  with:
   tag_name: ${{ github.ref }}
   release_name: Release ${{ github.ref }}
   body: My custom release notes
```

**Pre-publish checks:**

```yaml
- name: Lint and test
  run: npm run lint && npm run test
```

### npm Release Best Practices

- Run package validation before publishing. If your repository has scripts such as `release:check`, `publint`, or `attw`, keep them in the release workflow.
- Prefer npm trusted publishing with provenance for long-term maintenance.
- If you are bootstrapping trusted publishing for the first time, npm may require an initial manual publish outside the normal provenance flow.
- Keep `contents: write` and `id-token: write` scoped to the release workflow, not general CI.

---

## CodeQL Analysis

**File:** `codeql-analysis-advanced.yml`
**Purpose:** Security scanning for JavaScript/TypeScript code and GitHub Actions workflows.

### CodeQL Analysis Getting Started

CodeQL runs automatically on push/PR. No special setup required!

1. (Optional) Create custom config:

   ```bash
   # .github/codeql-config.yml
   name: "CodeQL config"
   queries:
     - uses: security-and-quality
   paths:
     - src
   paths-ignore:
     - test
   ```

2. Review alerts:
   - Go to Settings → Code security and analysis
   - Check "Code scanning" is enabled

### CodeQL Analysis Configuration Options

**Set no-build CodeQL languages when using the reusable workflow:**

```yaml
jobs:
 codeql:
  uses: Nick2bad4u/workflow-templates/.github/workflows/reusable-codeql-analysis-advanced.yml@main
  with:
   languages: '["javascript-typescript","actions"]'
```

**Use the manual-build reusable workflow for compiled or custom-build repositories:**

```yaml
jobs:
 codeql:
  uses: Nick2bad4u/workflow-templates/.github/workflows/reusable-codeql-analysis-build.yml@main
  with:
   languages: '["java-kotlin"]'
   build-command: "./gradlew clean build"
```

**Schedule weekly scans:**

```yaml
on:
 schedule:
  - cron: "0 2 * * 0"
```

### CodeQL Analysis Best Practices

- Keep the default scheduled scan; PR-only CodeQL misses issues introduced by dependency or query updates.
- Use a CodeQL config file only when you need path filtering or custom query suites.
- Avoid excluding tests unless CodeQL noise is proven; tests often contain workflow and helper patterns worth scanning.

---

## Auto-Label Pull Requests

**File:** `labeler.yml`
**Purpose:** Automatically apply labels to PRs based on changed files.

### Auto-Label Pull Requests Getting Started

1. Create `.github/labeler.yml`:

   ```yaml
   documentation:
    - changed-files:
       - any-glob-to-any-file: "docs/**"

   ci:
    - changed-files:
       - any-glob-to-any-file:
          - ".github/**"
          - ".eslintrc*"
          - "package.json"

   backend:
    - changed-files:
       - any-glob-to-any-file: "src/api/**"

   frontend:
    - changed-files:
       - any-glob-to-any-file: "src/components/**"
   ```

2. Create labels in your repo:
   - Issues → Labels
   - Add labels: documentation, ci, backend, frontend, etc.

### Auto-Label Pull Requests Configuration Options

**Multiple conditions (AND logic):**

```yaml
bug-fix:
 - changed-files:
    - any-glob-to-any-file: "src/**"
 - changed-files:
    - all-globs-to-any-file:
       - "**/bug-fix-*.md"
```

**Exclude certain paths:**

```yaml
tests-only:
 - changed-files:
    - any-glob-to-any-file: "test/**"
    - all-globs-to-any-file:
       - "!README.md"
```

### Auto-Label Pull Requests Best Practices

- Create labels before enabling the workflow so early PRs do not fail or silently skip expected labels.
- Keep label rules path-based and predictable; avoid labels that imply review status or merge approval.
- Review the labeler config when directories are renamed.

---

## Mark Stale Issues & PRs

**File:** `stale-management.yml`
**Purpose:** Automatically label and close stale issues/PRs after inactivity.

### Stale Issues & PRs Getting Started

No setup required! Workflow runs on a daily schedule by default.

### Stale Issues & PRs Configuration Options

**Adjust inactivity thresholds:**

```yaml
- uses: actions/stale@v9
  with:
   days-before-stale: 30
   days-before-close: 14
   stale-issue-label: "stale"
   close-issue-label: "closed"
```

**Exempt certain labels:**

```yaml
- uses: actions/stale@v9
  with:
   exempt-issue-labels: "pinned,security"
   exempt-pr-labels: "pinned,critical"
```

**Custom messages:**

```yaml
- uses: actions/stale@v9
  with:
   stale-issue-message: "This issue is stale; closing soon."
   close-issue-message: "Closed due to inactivity."
   stale-pr-message: "This PR is stale; closing soon."
   close-pr-message: "Closed due to inactivity."
```

### Stale Issues & PRs Best Practices

- Exempt security, pinned, roadmap, and actively maintained labels.
- Start with conservative close windows; aggressive stale automation creates maintenance noise.
- Use `workflow_dispatch` for manual dry runs after changing thresholds.

---

## Gitleaks Secret Scan

**File:** `gitleaks-scan-enhanced.yml`
**Purpose:** Detect leaked secrets (API keys, passwords, tokens) in code.

### Gitleaks Secret Scan Getting Started

Gitleaks runs automatically on every push/PR. No setup required!

1. (Optional) Create custom rules:

   ```toml
   # .gitleaks.toml
   [allowlist]
   regexes = [
     '''test-pattern'''
   ]
   paths = [
     '''test/fixtures/.*'''
   ]
   ```

### Gitleaks Secret Scan Configuration Options

**Use custom config:**

```yaml
- name: Run Gitleaks
  uses: gitleaks/gitleaks-action@v2.2.0
  with:
   config-path: .gitleaks.toml
   report-path: gitleaks-report.json
```

**Only fail on main branch:**

```yaml
- name: Run Gitleaks
  uses: gitleaks/gitleaks-action@v2.2.0
  with:
   fail: ${{ github.ref == 'refs/heads/main' }}
```

### Gitleaks Secret Scan Best Practices

- Keep test fixtures and fake credentials in `.gitleaksignore` or a narrow allowlist.
- Review every allowlist entry during code review; broad regex allowlists defeat the scanner.
- Use Gitleaks alongside GitHub secret scanning rather than treating it as a replacement.

---

## Dependency Review

**File:** `dependency-review-enhanced.yml`
**Purpose:** Scan PR dependencies for vulnerabilities and license compliance.

### Dependency Review Getting Started

Dependency Review runs automatically on every PR. No setup required!

### Dependency Review Configuration Options

**Set allowed licenses:**

```yaml
- name: Dependency Review
  uses: actions/dependency-review-action@v4
  with:
   allow-licenses: "Apache-2.0,MIT,ISC,BSD-2-Clause,BSD-3-Clause"
   deny-licenses: "GPL-3.0-only,AGPL-3.0-only"
```

**Custom severity threshold:**

```yaml
- name: Dependency Review
  uses: actions/dependency-review-action@v4
  with:
   fail-on-severity: "high"
```

### Dependency Review Best Practices and Recommendations

- Keep license policy explicit if the organization has approved and denied license lists.
- Set the severity threshold to match the repository's risk tolerance; most projects use `high` or stricter.
- Keep Dependabot or another dependency-update workflow enabled so findings have a repair path.

---

## Dependabot Auto-Merge

**File:** `auto-merge-dependabot.yml`
**Purpose:** Enable GitHub auto-merge for Dependabot patch and minor pull requests after required checks pass.

This workflow is intended for repositories that already use Dependabot and have branch protection or rulesets that
require the checks you trust before merging. It defaults to patch and minor updates, and repositories can opt into
major updates with the `DEPENDABOT_AUTO_MERGE_SEMVER` Actions variable.

### Dependabot Auto-Merge Getting Started

1. Enable repository auto-merge in **Settings → General → Pull Requests → Allow auto-merge**.
2. Add or confirm `.github/dependabot.yml` is configured for the ecosystems you want Dependabot to update.
3. Add the workflow to `.github/workflows/auto-merge-dependabot.yml`.
4. Confirm branch protection or repository rulesets require the checks that must pass before auto-merge completes.

### Dependabot Auto-Merge Configuration Options

**Configure allowed update levels with a repository or organization Actions variable:**

```text
DEPENDABOT_AUTO_MERGE_SEMVER=patch,minor
```

**Allow major updates only after you are comfortable with the repository's required checks and review policy:**

```text
DEPENDABOT_AUTO_MERGE_SEMVER=patch,minor,major
```

**Change the merge method if your repository does not use squash merges:**

```yaml
gh pr merge --auto --merge "${PR_URL}"
```

### Dependabot Auto-Merge Best Practices

- Keep semver-major updates out of the default auto-merge path unless human review is required by branch protection.
- Require the same CI and security checks that a maintainer would wait for before merging manually.
- Keep repository auto-merge enabled; the workflow fails early with the evaluated GitHub API value when it is disabled.
- Use merge queue support only as a status path. Auto-merge enablement happens on Dependabot pull request events.
- See [Dependabot Auto-Merge](./docs/guides/dependabot-auto-merge.md) for setup examples.

---

## Trufflehog Secret Scan

**File:** `trufflehog-scan.yml`
**Purpose:** Alternative secret scanner (verified credentials, fewer false positives).

### Trufflehog Secret Scan Getting Started

Trufflehog runs automatically on every push/PR. No setup required!

### Trufflehog Secret Scan Configuration Options

**Use verification (reduce noise):**

```yaml
- name: Run Trufflehog
  uses: trufflesecurity/trufflehog@v3.63.0
  with:
   extra_args: --verify
```

**Scan specific files:**

```yaml
- name: Run Trufflehog
  uses: trufflesecurity/trufflehog@v3.63.0
  with:
   extra_args: --only-verified src/ app/
```

### Trufflehog Secret Scan Best Practices

- Use Trufflehog as a second scanner when verified-secret checks are useful.
- Keep scan scope broad for scheduled runs and narrower for PR-only performance if needed.
- Treat verified findings as incidents, not routine lint failures.

---

## OpenSSF Scorecard

**File:** `ossf-scorecard.yml`
**Purpose:** Audit your repository's supply chain security posture.

### OpenSSF Scorecard Getting Started

Scorecard runs on a schedule and can be triggered manually. No setup required!

1. (Optional) Review results:
   - Go to Security → Code scanning
   - View detailed scorecard recommendations

### OpenSSF Scorecard Configuration Options

**Change scan schedule:**

```yaml
on:
 schedule:
  - cron: "0 0 * * 0"
```

**Publish results:**

```yaml
- name: Publish Scorecard Results
  uses: ossf/scorecard-action@v2.3.0
  with:
   results-file: results.sarif
   results-format: sarif
   publish-results: true
```

### Scorecard Checks

The workflow evaluates:

- **Branch Protection** — Require reviews/status checks?
- **Code Review** — Are changes reviewed before merge?
- **CII Best Practices** — Follow CII guidelines?
- **Dependency Updates** — Dependencies kept up-to-date?
- **Code Signing** — Commits/releases signed?
- **CODEOWNERS** — Define codeowners?
- **Security Policy** — Have SECURITY.md?
- **Vulnerability Disclosure** — Report vulnerabilities?

### OpenSSF Scorecard Best Practices

- Upload SARIF results to code scanning so findings are visible in the Security tab.
- Fix low-effort repository hygiene findings first: branch protection, pinned actions, `SECURITY.md`, and Dependabot.
- Review score changes after workflow or release-process changes.

---

## Deploy Docusaurus to GitHub Pages

**File:** `docusaurus-deploy.yml`
**Purpose:** Build and deploy Docusaurus documentation to GitHub Pages.

### Deploy Docusaurus Getting Started

1. Ensure your project has:
   - `docusaurus.config.js` or `docusaurus.config.ts`
   - `docs/` folder with Markdown files

2. Enable GitHub Pages:
   - Settings → Pages
   - Source: **GitHub Actions**

3. Initialize Docusaurus (if needed):

   ```bash
   npx create-docusaurus@latest my-website
   npm run build
   ```

### Deploy Docusaurus Configuration Options

**Deploy on specific paths:**

```yaml
on:
 push:
  branches: [main]
  paths:
   - "docs/**"
   - "docusaurus.config.js"
```

**Deploy to custom domain:**

```yaml
- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
   github_token: ${{ secrets.GITHUB_TOKEN }}
   publish_dir: ./build
   cname: docs.example.com
```

**Custom build parameters:**

```yaml
- name: Build site
  run: npm run build
  env:
   BASE_URL: /my-site/
```

### Directory Structure

```text
docs/
├── intro.md
├── guides/
│   ├── getting-started.md
│   └── advanced.md
└── api/
    └── reference.md
docusaurus.config.js
```

### Deploy Docusaurus Best Practices

- Use the GitHub Actions Pages source, not branch deployment, when using `actions/deploy-pages`.
- Keep docs build scripts deterministic and avoid writing generated docs output back to the repository from this workflow.
- Add path filters for docs, Docusaurus config, package manifests, and any shared theme files that affect the build.

---

## Submit IndexNow Notification

**File:** `indexnow-submit.yml`
**Purpose:** Notify search engines when you update your website (SEO boost).

### IndexNow Notifications Getting Started

1. Get your IndexNow API key:
   - Sign in at <https://www.indexnow.org/>
   - Generate API key for your domain

2. Store in GitHub Secrets:
   - Settings → Secrets and variables → Actions
   - Create `INDEXNOW_KEY`

3. (Optional) Create sitemap:

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>https://example.com/page1</loc>
       <lastmod>2025-01-15</lastmod>
     </url>
   </urlset>
   ```

### IndexNow Notifications Configuration Options

**Submit changed URLs (delta):**

```yaml
env:
 INDEXNOW_MODE: delta
 INDEXNOW_URLS: |
  https://example.com/page1
  https://example.com/page2
```

**Submit full sitemap:**

```yaml
env:
 INDEXNOW_MODE: sitemap
 INDEXNOW_SITEMAP: https://example.com/sitemap.xml
```

### IndexNow Notifications Best Practices

- Store the key in `INDEXNOW_KEY` and do not hardcode it in workflow YAML.
- Prefer delta submissions for routine content updates and sitemap submissions for large rebuilds.
- Keep submitted URLs canonical and public; IndexNow should not receive preview or localhost URLs.

---

## Git-Cliff Release Notes Validation

**File:** `git-cliff-release-notes-validation.yml`
**Purpose:** Validate that a published GitHub release body starts with git-cliff notes for the same release tag.

This workflow is intended for repositories whose release notes use headings like `## [1.2.3] - 2026-05-29`.
It flags release bodies that are empty, contain placeholder text, start with `## [Unreleased]`, or start with a
different version heading than the published tag.

### Git-Cliff Release Notes Validation Getting Started

1. Add the workflow to `.github/workflows/validate-release-notes.yml`.
2. Confirm the repository uses git-cliff-style release notes with version headings.
3. Publish or edit a release to run the validator.

If your release is created by a workflow using the default `GITHUB_TOKEN`, GitHub does not normally trigger another
workflow from that release event. In that setup, keep this validator's `workflow_dispatch` trigger and call it after
the release step. The release workflow needs `actions: write` permission for the dispatch call:

```yaml
permissions:
 actions: write
 contents: write

jobs:
 publish:
  steps:
   - name: Validate published release notes
     env:
      GH_TOKEN: ${{ github.token }}
      TAG: ${{ steps.version.outputs.tag }}
     run: gh workflow run validate-release-notes.yml -f tag="$TAG"
```

### Git-Cliff Release Notes Validation Configuration Options

```yaml
on:
 release:
  types:
   - published
   - edited
 workflow_dispatch:
  inputs:
   tag:
    required: true
    type: string
```

Use the `release` trigger for releases created manually, by a personal access token, or by a GitHub App token. Use
`workflow_dispatch` as the fallback when another workflow creates the release with `GITHUB_TOKEN`.

### Git-Cliff Release Notes Validation Best Practices

- Use it only on repositories where release notes are expected to start with `## [version]`.
- Keep it non-blocking by running it after the release is already published.
- Pair it with a `changelog:release-notes` script that uses `git-cliff --current --strip all` for tag releases.
- Leave custom GitHub-generated notes such as `## What's Changed` on repos that do not use git-cliff.

---

## Automatic Pull Request Rebase

**File:** `automatic-rebase.yml`
**Purpose:** Allow trusted collaborators to request a pull request rebase from an issue comment.

Use the workflow template for a copied starter workflow, or call `.github/workflows/reusable-automatic-rebase.yml` from a consumer workflow. The reusable caller example is `docs/examples/reusable-workflows/automatic-rebase-caller.yml`.

Review the template inputs, required secrets, and permissions before enabling it in a consumer repository.

---

## Ps Secret Scanner Secret Scan

**File:** `pssecret-scanner.yml`
**Purpose:** Scan a repository with the PowerShell PSSecretScanner module.

Use the workflow template for a copied starter workflow, or call `.github/workflows/reusable-pssecret-scanner.yml` from a consumer workflow. The reusable caller example is `docs/examples/reusable-workflows/pssecret-scanner-caller.yml`.

Review the template inputs, required secrets, and permissions before enabling it in a consumer repository.

---

## Ai Issue And Pull Request Summary

**File:** `ai-issue-pr-summary.yml`
**Purpose:** Summarize newly opened or edited issues and pull requests with GitHub Models.

Use the workflow template for a copied starter workflow, or call `.github/workflows/reusable-ai-issue-pr-summary.yml` from a consumer workflow. The reusable caller example is `docs/examples/reusable-workflows/ai-issue-pr-summary-caller.yml`.

Review the template inputs, required secrets, and permissions before enabling it in a consumer repository.

---

## First Interaction Greeting

**File:** `first-interaction-greeting.yml`
**Purpose:** Welcome first-time issue and pull request authors.

Use the workflow template for a copied starter workflow, or call `.github/workflows/reusable-first-interaction-greeting.yml` from a consumer workflow. The reusable caller example is `docs/examples/reusable-workflows/first-interaction-greeting-caller.yml`.

Review the template inputs, required secrets, and permissions before enabling it in a consumer repository.

---

## Clean Old GitHub Releases

**File:** `release-cleanup.yml`
**Purpose:** Delete older GitHub releases and optionally their matching tags.

Use the workflow template for a copied starter workflow, or call `.github/workflows/reusable-release-cleanup.yml` from a consumer workflow. The reusable caller example is `docs/examples/reusable-workflows/release-cleanup-caller.yml`.

Review the template inputs, required secrets, and permissions before enabling it in a consumer repository.

---

## Node Dependency Validation

**File:** `dependency-validation.yml`
**Purpose:** Install dependencies, run a validation command, and upload diagnostics on failure.

Use the workflow template for a copied starter workflow, or call `.github/workflows/reusable-dependency-validation.yml` from a consumer workflow. The reusable caller example is `docs/examples/reusable-workflows/dependency-validation-caller.yml`.

Review the template inputs, required secrets, and permissions before enabling it in a consumer repository.

---

## Virus Total Release Asset Scan

**File:** `virustotal-release-scan.yml`
**Purpose:** Download release assets and scan them with VirusTotal.

Use the workflow template for a copied starter workflow, or call `.github/workflows/reusable-virustotal-release-scan.yml` from a consumer workflow. The reusable caller example is `docs/examples/reusable-workflows/virustotal-release-scan-caller.yml`.

Review the template inputs, required secrets, and permissions before enabling it in a consumer repository.

---

## Upload Release Assets To Internet Archive

**File:** `internet-archive-upload.yml`
**Purpose:** Download matching GitHub release assets and upload them to archive.org.

Use the workflow template for a copied starter workflow, or call `.github/workflows/reusable-internet-archive-upload.yml` from a consumer workflow. The reusable caller example is `docs/examples/reusable-workflows/internet-archive-upload-caller.yml`.

Review the template inputs, required secrets, and permissions before enabling it in a consumer repository.

---

## Codacy Coverage Upload

**File:** `codacy-coverage.yml`
**Purpose:** Run Node.js coverage and upload LCOV reports to Codacy.

Use the workflow template for a copied starter workflow, or call `.github/workflows/reusable-codacy-coverage.yml` from a consumer workflow. The reusable caller example is `docs/examples/reusable-workflows/codacy-coverage-caller.yml`.

Review the template inputs, required secrets, and permissions before enabling it in a consumer repository.

---

## Mega Linter

**File:** `mega-linter.yml`
**Purpose:** Run Mega Linter and upload lint reports.

Use the workflow template for a copied starter workflow, or call `.github/workflows/reusable-mega-linter.yml` from a consumer workflow. The reusable caller example is `docs/examples/reusable-workflows/mega-linter-caller.yml`.

Review the template inputs, required secrets, and permissions before enabling it in a consumer repository.

---

## Playwright End To End Tests

**File:** `playwright-e2e.yml`
**Purpose:** Install Node dependencies and run Playwright end-to-end tests.

Use the workflow template for a copied starter workflow, or call `.github/workflows/reusable-playwright-e2e.yml` from a consumer workflow. The reusable caller example is `docs/examples/reusable-workflows/playwright-e2e-caller.yml`.

Review the template inputs, required secrets, and permissions before enabling it in a consumer repository.

---

## GitHub Release Stats

**File:** `release-stats.yml`
**Purpose:** Summarize latest and aggregate GitHub release asset statistics.

Use the workflow template for a copied starter workflow, or call `.github/workflows/reusable-release-stats.yml` from a consumer workflow. The reusable caller example is `docs/examples/reusable-workflows/release-stats-caller.yml`.

Review the template inputs, required secrets, and permissions before enabling it in a consumer repository.

---

## Sonar Cloud Analysis

**File:** `sonarcloud-analysis.yml`
**Purpose:** Build, test, and run SonarCloud analysis for a Node.js project.

Use the workflow template for a copied starter workflow, or call `.github/workflows/reusable-sonarcloud-analysis.yml` from a consumer workflow. The reusable caller example is `docs/examples/reusable-workflows/sonarcloud-analysis-caller.yml`.

Review the template inputs, required secrets, and permissions before enabling it in a consumer repository.

---

## Update Changelogs

**File:** `changelog-update.yml`
**Purpose:** Generate changelogs with git-cliff and open a pull request.

Use the workflow template for a copied starter workflow, or call `.github/workflows/reusable-changelog-update.yml` from a consumer workflow. The reusable caller example is `docs/examples/reusable-workflows/changelog-update-caller.yml`.

Review the template inputs, required secrets, and permissions before enabling it in a consumer repository.

---

## Deploy Jekyll To GitHub Pages

**File:** `jekyll-pages-deploy.yml`
**Purpose:** Build a Jekyll site and deploy it to GitHub Pages.

Use the workflow template for a copied starter workflow, or call `.github/workflows/reusable-jekyll-pages-deploy.yml` from a consumer workflow. The reusable caller example is `docs/examples/reusable-workflows/jekyll-pages-deploy-caller.yml`.

Review the template inputs, required secrets, and permissions before enabling it in a consumer repository.

---

## Actionlint

**File:** `actionlint.yml`
**Purpose:** Lint GitHub Actions workflows with actionlint.

Use the workflow template for a copied starter workflow, or call `.github/workflows/reusable-actionlint.yml` from a consumer workflow. The reusable caller example is `docs/examples/reusable-workflows/actionlint-caller.yml`.

Review the template inputs, required secrets, and permissions before enabling it in a consumer repository.

---

## Dev Skim Security Analysis

**File:** `devskim-analysis.yml`
**Purpose:** Run Microsoft DevSkim and upload SARIF results.

Use the workflow template for a copied starter workflow, or call `.github/workflows/reusable-devskim-analysis.yml` from a consumer workflow. The reusable caller example is `docs/examples/reusable-workflows/devskim-analysis-caller.yml`.

Review the template inputs, required secrets, and permissions before enabling it in a consumer repository.

---

## Ossar Security Analysis

**File:** `ossar-analysis.yml`
**Purpose:** Run OSSAR and upload SARIF results.

Use the workflow template for a copied starter workflow, or call `.github/workflows/reusable-ossar-analysis.yml` from a consumer workflow. The reusable caller example is `docs/examples/reusable-workflows/ossar-analysis-caller.yml`.

Review the template inputs, required secrets, and permissions before enabling it in a consumer repository.

---

## Prettier Check

**File:** `prettier-check.yml`
**Purpose:** Run Prettier in check mode for common web project files.

Use the workflow template for a copied starter workflow, or call `.github/workflows/reusable-prettier-check.yml` from a consumer workflow. The reusable caller example is `docs/examples/reusable-workflows/prettier-check-caller.yml`.

Review the template inputs, required secrets, and permissions before enabling it in a consumer repository.

---

## Repository Metrics

**File:** `repository-metrics.yml`
**Purpose:** Generate repository metrics SVG output with lowlighter/metrics.

Use the workflow template for a copied starter workflow, or call `.github/workflows/reusable-repository-metrics.yml` from a consumer workflow. The reusable caller example is `docs/examples/reusable-workflows/repository-metrics-caller.yml`.

Review the template inputs, required secrets, and permissions before enabling it in a consumer repository.

---

## Microsoft Security DevOps

**File:** `microsoft-security-devops.yml`
**Purpose:** Run Microsoft Security DevOps scanning and upload SARIF results.

Use the workflow template for a copied starter workflow, or call `.github/workflows/reusable-microsoft-security-devops.yml` from a consumer workflow. The reusable caller example is `docs/examples/reusable-workflows/microsoft-security-devops-caller.yml`.

Review the template inputs, required secrets, and permissions before enabling it in a consumer repository.

---

## Generate XML Sitemap

**File:** `sitemap-generator.yml`
**Purpose:** Generate an XML sitemap and open a pull request with updates.

Use the workflow template for a copied starter workflow, or call `.github/workflows/reusable-sitemap-generator.yml` from a consumer workflow. The reusable caller example is `docs/examples/reusable-workflows/sitemap-generator-caller.yml`.

Review the template inputs, required secrets, and permissions before enabling it in a consumer repository.

---

## Spellcheck

**File:** `spellcheck.yml`
**Purpose:** Run spellcheck-github-actions and upload the spellcheck output.

Use the workflow template for a copied starter workflow, or call `.github/workflows/reusable-spellcheck.yml` from a consumer workflow. The reusable caller example is `docs/examples/reusable-workflows/spellcheck-caller.yml`.

Review the template inputs, required secrets, and permissions before enabling it in a consumer repository.

---

## Deploy Static Content To GitHub Pages

**File:** `static-pages-deploy.yml`
**Purpose:** Upload static repository content and deploy it to GitHub Pages.

Use the workflow template for a copied starter workflow, or call `.github/workflows/reusable-static-pages-deploy.yml` from a consumer workflow. The reusable caller example is `docs/examples/reusable-workflows/static-pages-deploy-caller.yml`.

Review the template inputs, required secrets, and permissions before enabling it in a consumer repository.

---

## Stylelint Check

**File:** `stylelint-check.yml`
**Purpose:** Install dependencies and run Stylelint.

Use the workflow template for a copied starter workflow, or call `.github/workflows/reusable-stylelint-check.yml` from a consumer workflow. The reusable caller example is `docs/examples/reusable-workflows/stylelint-check-caller.yml`.

Review the template inputs, required secrets, and permissions before enabling it in a consumer repository.

---

## Super Linter

**File:** `super-linter.yml`
**Purpose:** Run GitHub Super Linter against the repository.

Use the workflow template for a copied starter workflow, or call `.github/workflows/reusable-super-linter.yml` from a consumer workflow. The reusable caller example is `docs/examples/reusable-workflows/super-linter-caller.yml`.

Review the template inputs, required secrets, and permissions before enabling it in a consumer repository.

---

## Typos Spell Check

**File:** `typos-spellcheck.yml`
**Purpose:** Run crate-ci typos spell checker.

Use the workflow template for a copied starter workflow, or call `.github/workflows/reusable-typos-spellcheck.yml` from a consumer workflow. The reusable caller example is `docs/examples/reusable-workflows/typos-spellcheck-caller.yml`.

Review the template inputs, required secrets, and permissions before enabling it in a consumer repository.

---

## General Troubleshooting

### Workflow Doesn't Trigger

- ✅ Check `on` section matches your trigger (push, PR, schedule, etc.)
- ✅ Verify branch/path conditions are met
- ✅ Check Actions tab for manual trigger options
- ✅ Ensure `.github/workflows/` folder exists

### Secret Not Available

- ✅ Verify secret exists in Settings → Secrets and variables → Actions
- ✅ Secret name must match exactly (case-sensitive)
- ✅ For org secrets, verify repo has access
- ✅ Check secret hasn't expired

### Action Version Issues

- ✅ Use `@v3`, `@v2.1.0`, or commit SHAs — avoid `@latest` or `@main`
- ✅ Pin to major version for stability with minor updates
- ✅ Pin to patch for complete reproducibility

### Permissions Denied

- ✅ Check `permissions` block in workflow
- ✅ Ensure `GITHUB_TOKEN` has needed scopes
- ✅ For private repos, verify token access
- ✅ Review GitHub Actions audit log

### Performance Issues

- ✅ Reduce matrix dimensions
- ✅ Cache dependencies (`.npm`, `.gradle`, etc.)
- ✅ Use `concurrency` to cancel older runs
- ✅ Split into smaller workflows

---

## Resources

- [Using Workflow Templates](./docs/guides/using-workflow-templates.md)
- [Maintaining Workflow Templates](./docs/guides/maintaining-workflow-templates.md)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Security Hardening for Actions](https://docs.github.com/en/actions/security-guides)
- [CodeQL](https://codeql.github.com/)
- [Gitleaks](https://gitleaks.io/)
- [Trufflehog](https://github.com/trufflesecurity/trufflehog)
- [OpenSSF Scorecard](https://securityscorecards.dev/)
- [Docusaurus](https://docusaurus.io/)
- [IndexNow](https://www.indexnow.org/)

---

**Questions?** Open an issue or start a discussion on GitHub.
