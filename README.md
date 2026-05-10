# workflow-templates

Repository template for reusable GitHub Actions workflows.

This repo is designed for personal project bootstrapping (not for publishing an npm package).

## What this repository contains

- Reusable starter workflows in `.github/workflow-templates/`
- Repository-level quality and security workflows in `.github/workflows/`
- Standard issue and PR templates for project setup consistency

## Included workflow templates

- **Node.js CI** (`node-ci.yml`): install, lint, typecheck, test
- **CodeQL Analysis** (`codeql-analysis.yml`): JavaScript/TypeScript security scanning
- **Gitleaks Scan** (`gitleaks-scan.yml`): secret leak detection

Each template has a paired `.properties.json` metadata file so it appears in GitHub's workflow template picker.

## Use this repository as a template

1. Click **Use this template** on GitHub.
2. Create a new repository from this template.
3. In the new repository, choose workflows from the **Actions** tab or copy files from `.github/workflow-templates/`.
4. Adjust Node version, scripts, triggers, and permissions as needed.

## Local checks

```bash
npm install
npm run lint
```

## Notes

- Keep workflow permissions least-privilege.
- Keep action versions pinned where practical.
- Prefer simple, deterministic workflow behavior for easier maintenance.
