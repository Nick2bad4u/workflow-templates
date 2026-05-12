# Workflow Usage Guide

Detailed setup, configuration, and best practices for each workflow template.

## Table of Contents

1. [Node.js Test & Coverage](#nodejs-test--coverage)
2. [npm Release](#npm-release--github-release)
3. [CodeQL Analysis](#codeql-analysis)
4. [Auto-Label Pull Requests](#auto-label-pull-requests)
5. [Stale Issues & PRs](#mark-stale-issues--prs)
6. [Gitleaks Secret Scan](#gitleaks-secret-scan)
7. [Dependency Review](#dependency-review)
8. [Trufflehog Secret Scan](#trufflehog-secret-scan)
9. [OpenSSF Scorecard](#openssf-scorecard)
10. [Deploy Docusaurus](#deploy-docusaurus-to-github-pages)
11. [IndexNow Notifications](#submit-indexnow-notification)

---

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

---

## npm Release & GitHub Release

**File:** `npm-release.yml`
**Purpose:** Publish to npm and create GitHub release on version tags.

### npm Release Getting Started

1. Create npm token:
   - Visit <https://npmjs.com/settings/~/tokens>
   - Create "Automation" token (no expiration if possible)

2. Store in GitHub Secrets:
   - Settings → Secrets and variables → Actions
   - Create `NPM_TOKEN` with your token value

3. Configure `package.json`:

   ```json
   {
     "name": "@your-org/your-package",
     "version": "1.0.0",
     "repository": "https://github.com/your-org/your-repo"
   }
   ```

4. Create and push a version tag:

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

**Scan additional languages:**

```yaml
env:
  CODEQL_LANGUAGES: 'javascript,typescript,github-actions'
```

**Customize timeouts:**

```yaml
- name: Create CodeQL database
  uses: github/codeql-action/database-create@v3
  with:
    db-location: ${{ runner.temp }}/codeql_databases
    source-root: src/
```

**Schedule weekly scans:**

```yaml
on:
  schedule:
    - cron: '0 2 * * 0'
```

### CodeQL Analysis Best Practices

---

## Auto-Label Pull Requests

**File:** `labeler.yml`
**Purpose:** Automatically apply labels to PRs based on changed files.

### Auto-Label Pull Requests Getting Started

1. Create `.github/labeler.yml`:

   ```yaml
   documentation:
     - changed-files:
         - any-glob-to-any-file: 'docs/**'

   ci:
     - changed-files:
         - any-glob-to-any-file:
             - '.github/**'
             - '.eslintrc*'
             - 'package.json'

   backend:
     - changed-files:
         - any-glob-to-any-file: 'src/api/**'

   frontend:
     - changed-files:
         - any-glob-to-any-file: 'src/components/**'
   ```

2. Create labels in your repo:
   - Issues → Labels
   - Add labels: documentation, ci, backend, frontend, etc.

### Auto-Label Pull Requests Configuration Options

**Multiple conditions (AND logic):**

```yaml
bug-fix:
  - changed-files:
      - any-glob-to-any-file: 'src/**'
  - changed-files:
      - all-globs-to-any-file:
          - '**/bug-fix-*.md'
```

**Exclude certain paths:**

```yaml
tests-only:
  - changed-files:
      - any-glob-to-any-file: 'test/**'
      - all-globs-to-any-file:
          - '!README.md'
```

### Auto-Label Pull Requests Best Practices

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
    stale-issue-label: 'stale'
    close-issue-label: 'closed'
```

**Exempt certain labels:**

```yaml
- uses: actions/stale@v9
  with:
    exempt-issue-labels: 'pinned,security'
    exempt-pr-labels: 'pinned,critical'
```

**Custom messages:**

```yaml
- uses: actions/stale@v9
  with:
    stale-issue-message: 'This issue is stale; closing soon.'
    close-issue-message: 'Closed due to inactivity.'
    stale-pr-message: 'This PR is stale; closing soon.'
    close-pr-message: 'Closed due to inactivity.'
```

### Stale Issues & PRs Best Practices

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
    allow-licenses: 'Apache-2.0,MIT,ISC,BSD-2-Clause,BSD-3-Clause'
    deny-licenses: 'GPL-3.0-only,AGPL-3.0-only'
```

**Custom severity threshold:**

```yaml
- name: Dependency Review
  uses: actions/dependency-review-action@v4
  with:
    fail-on-severity: 'high'
```

### Dependency Review Best Practices and Recommendations

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
    - cron: '0 0 * * 0'
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
   - Source: Deploy from a branch
   - Branch: `gh-pages` / Folder: `/ (root)`

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
      - 'docs/**'
      - 'docusaurus.config.js'
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

- [GitHub Actions Documentation](<https://docs.github.com/en/actions>)
- [Security Hardening for Actions](<https://docs.github.com/en/actions/security-guides>)
- [CodeQL](<https://codeql.github.com/>)
- [Gitleaks](<https://gitleaks.io/>)
- [Trufflehog](<https://github.com/trufflesecurity/trufflehog>)
- [OpenSSF Scorecard](<https://securityscorecards.dev/>)
- [Docusaurus](<https://docusaurus.io/>)
- [IndexNow](<https://www.indexnow.org/>)

---

**Questions?** Open an issue or start a discussion on GitHub.
