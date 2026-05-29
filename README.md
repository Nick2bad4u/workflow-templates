# 🚀 GitHub Actions Workflow Templates

[![latest GitHub release.](https://flat.badgen.net/github/release/Nick2bad4u/workflow-templates?color=cyan)](https://github.com/Nick2bad4u/workflow-templates/releases) [![GitHub stars.](https://flat.badgen.net/github/stars/Nick2bad4u/workflow-templates?color=yellow)](https://github.com/Nick2bad4u/workflow-templates/stargazers) [![GitHub forks.](https://flat.badgen.net/github/forks/Nick2bad4u/workflow-templates?color=green)](https://github.com/Nick2bad4u/workflow-templates/forks) [![GitHub open issues.](https://flat.badgen.net/github/open-issues/Nick2bad4u/workflow-templates?color=red)](https://github.com/Nick2bad4u/workflow-templates/issues)

Production-ready, security-hardened GitHub Actions workflow templates for common CI/CD, testing, security, and deployment tasks.

> **For end-users:** Browse workflows in **Actions → Explore** in your GitHub repository, or see [**USAGE.md**](./USAGE.md) for detailed documentation on each workflow.
>
> **For maintainers:** See [**Maintaining Workflow Templates**](./docs/guides/maintaining-workflow-templates.md) before adding or changing templates.

---

## 📋 Available Workflows

All workflows include hardened runners, least-privilege permissions, concurrency control, and pinned action versions.

| Workflow | Purpose | Triggers | Languages |
|----------|---------|----------|-----------|
| **Node.js Test & Coverage** | Multi-OS tests + Codecov upload | Push, PR, merge_group | JavaScript, TypeScript |
| **npm Release** | Publish to npm + create GitHub release | Git tag, manual dispatch | JavaScript, TypeScript |
| **CodeQL Analysis** | Security scanning (JS/TS + workflows) | Push, PR, schedule | JavaScript, TypeScript, YAML |
| **Auto-Label PRs** | Automatic PR labeling by config | PR events | YAML |
| **Mark Stale Issues** | Close stale issues/PRs after inactivity | Schedule, manual | YAML |
| **Gitleaks Scan** | Detect leaked secrets (with config support) | Push, PR, schedule | YAML, Shell |
| **Dependency Review** | Scan PR dependencies + license check | PR, merge_group | Multiple languages |
| **Trufflehog Scan** | Alt secret scanner (verified secrets only) | Multiple events | YAML, Shell |
| **OpenSSF Scorecard** | Supply chain security audit | Multiple events | YAML |
| **Deploy Docusaurus** | Build & deploy docs to GitHub Pages | Push (docs path), manual | JavaScript, TypeScript, Markdown |
| **Submit IndexNow** | Notify search engines of URL changes | Manual dispatch | JavaScript, TypeScript, YAML |
| **Git-Cliff Release Notes Validation** | Check published release notes match the tag | Release published/edited, manual | YAML |

---

## 🎯 Quick Start

### Using a Workflow Template

1. Go to your repository
2. Click **Actions → Explore**
3. Search for or browse the workflow (e.g., "Node.js", "CodeQL")
4. Click **Use this template**
5. Review the generated workflow and customize (branch names, Node version, secrets, etc.)
6. Commit and enable

### Copying Directly

```bash
# Clone this repo (or download specific files)
cp .github/workflow-templates/node-test-matrix.yml YOUR_REPO/.github/workflows/

# Customize as needed
```

Only copy `.properties.json` files when you are publishing your own workflow-template repository. Normal consuming repositories only need the generated workflow YAML under `.github/workflows/`.

---

## 🔧 Customization

### Common Configuration

Most workflows support:

- **Node version**: Set in `~/.node-version` or `package.json` `engines` field
- **Permissions**: Already set to least-privilege; reduce further if needed
- **Triggers**: Adjust `on` section (branches, paths, schedules)
- **Secrets**: Configure via repository settings (e.g., `NPM_TOKEN`, `CODECOV_TOKEN`)
- **Matrix strategies**: Customize OS/Node version combinations

### Example: Add a Custom Node Version

```yaml
strategy:
  matrix:
    include:
      - os: ubuntu-latest
        node-version: 20
      - os: ubuntu-latest
        node-version: 22
      - os: windows-latest
        node-version: 22
```

---

## 📝 Configuration Files

Each workflow may require additional configuration:

| Workflow | Config File | Purpose |
|----------|-------------|---------|
| **Auto-Label PRs** | `.github/labeler.yml` | Define PR label rules |
| **Gitleaks Scan** | `.gitleaks.toml` (optional) | Custom secret patterns |
| **Mark Stale Issues** | Built-in params | Days before stale/close |
| **Deploy Docusaurus** | `docusaurus.config.js` | Docs site config |
| **Submit IndexNow** | Repository secret: `INDEXNOW_KEY` | SEO notification key |
| **Git-Cliff Release Notes Validation** | `cliff.toml` | Git-cliff release-note heading convention |

See [USAGE.md](./USAGE.md) for per-workflow setup details.

---

## 🔒 Security Features

All workflows include:

- ✅ **Harden-runner** for egress policy audit
- ✅ **Least-privilege permissions** blocks
- ✅ **Concurrency control** to prevent race conditions
- ✅ **Pinned action versions** (SHA or specific tag)
- ✅ **Timeouts** for all jobs
- ✅ **Only GITHUB_TOKEN** when possible; other secrets required explicitly

---

## 🏗️ Repository Structure

```folder
.github/
├── workflow-templates/          # Reusable workflow templates
│   ├── *.yml                    # Workflow definitions
│   ├── *.properties.json        # Metadata for GitHub UI
│   ├── *.svg                    # Optional custom icons
│   └── SCHEMA.md                # Schema documentation
├── workflows/                   # Your repository's own workflows
└── ...

schemas/
└── github-workflow-template-properties.schema.json  # JSON schema for validation

USAGE.md                         # Detailed per-workflow guide
```

---

## 🧪 Local Validation

### Lint Workflows

```bash
npm install
npm run typecheck
npm run lint
```

### Check Schema

```bash
npm run schema:check:workflow-template-properties
```

### Update Schema (from upstream)

```bash
npm run schema:update:workflow-template-properties
```

---

## 📚 Resources

- **[USAGE.md](./USAGE.md)** — Detailed guide for each workflow
- **[Using Workflow Templates](./docs/guides/using-workflow-templates.md)** — Consumer setup checklist
- **[Maintaining Workflow Templates](./docs/guides/maintaining-workflow-templates.md)** — Maintainer workflow and validation gates
- **[GitHub Docs: Creating Workflow Templates](https://docs.github.com/en/actions/using-workflows/creating-starter-workflows-for-your-organization)**
- **[GitHub Docs: Security Hardening](https://docs.github.com/en/actions/security-guides)**
- **[OpenSSF Best Practices Badge](https://bestpractices.coreinfrastructure.org/)**

---

## 🤝 Contributing

This repository contains reusable templates for personal projects. For suggestions or issues:

1. File an issue describing the problem
2. Reference the workflow name and minimal reproduction steps
3. Include the error output and your repository setup

---

## 📄 License

[MIT](./LICENSE)

---

## 💡 Best Practices Used

1. **Explicit permissions** — Every job declares `permissions` instead of relying on defaults
2. **Pinned action versions** — Actions reference SHAs or specific tags, never `@latest` or `@main`
3. **Concurrency control** — Workflows cancel previous runs on the same ref to avoid resource waste
4. **Timeout limits** — Jobs have explicit timeout-minutes to catch hangs
5. **Harden runner** — Step-security/harden-runner protects egress
6. **Configuration files** — Complex workflows document required setup files
7. **Job naming** — Clear job/step names aid debugging in logs
8. **Error handling** — `if: !cancelled()` and similar prevent silent failures

---

## 🚀 Next Steps

1. **Browse workflows** in Actions → Explore
2. **Read [USAGE.md](./USAGE.md)** for your chosen workflow
3. **Customize** for your project (Node version, branches, secrets)
4. **Test** in a feature branch before merging to main
5. **Monitor** workflow runs in the Actions tab

---

**Questions or feedback?** Open an issue or discussion on GitHub.
