# Workflow Template Schema & Categories Reference

## Official Schema (properties.json)

Every workflow template (`.yml`) must have a corresponding `.properties.json` metadata file.

### Required Fields

```json
{
    "name": "Required: Display name (shown in GitHub Actions UI)",
    "description": "Required: Short description of what the workflow does"
}
```

### Optional Fields

```json
{
    "iconName": "Optional: Icon name (local SVG or 'octicon <name>')",
    "categories": ["Optional: Array of category names (see below)"],
    "filePatterns": ["Optional: Regex patterns for file matching"]
}
```

### Complete Example

```json
{
    "name": "Node.js Test & Coverage",
    "description": "Run tests with coverage across multiple platforms.",
    "iconName": "workflow-template-node.svg",
    "categories": ["JavaScript", "TypeScript"],
    "filePatterns": ["package.json$", "package-lock.json$"]
}
```

---

## Valid Category Values

### Source 1: Linguist Languages
Use language/technology identifiers from GitHub's [Linguist](https://github.com/github/linguist) project.

**Recommended for these templates:**

| Category | Use For |
|----------|---------|
| **JavaScript** | Node.js, npm, frontend, TypeScript projects |
| **TypeScript** | TypeScript-specific workflows |
| **YAML** | Generic GitHub Actions workflows, CI/CD |
| **Python** | Python-based projects, scripts |
| **Bash** / **Shell** | Shell script workflows |
| **Dockerfile** | Container/deployment workflows |
| **Markdown** | Documentation-related workflows |
| **JSON** | Config-based workflows |
| **Ruby** | Ruby/Rails projects |
| **Go** | Go projects |
| **Rust** | Rust projects |
| **Java** | Java/Kotlin/JVM projects |
| **C** / **C++** | C/C++ projects |

### Source 2: General Category Names (from starter-workflows)
- "CI/CD"
- "Continuous Integration"
- "Continuous Deployment"
- "Security"
- "Testing"
- "Deployment"
- "Publishing"
- "Code Quality"
- "Dependency Management"
- "Monitoring"
- "Release"

### Source 3: Supported Tech Stacks (from starter-workflows)
Check the official starter-workflows repository for tech stack category names.

---

## filePatterns Reference

Regular expressions (without delimiters) to match root-level files in the user's repo.

### Common Patterns

```json
"filePatterns": [
    "package.json$",              // Node.js projects
    "package-lock.json$",         // npm lockfile
    "yarn.lock$",                 // Yarn lockfile
    "pnpm-lock.yaml$",            // pnpm lockfile
    "^Dockerfile",                // Docker files (start with)
    "*.md$",                       // Markdown files (end with)
    "requirements.txt$",          // Python projects
    "Gemfile$",                   // Ruby projects
    "go.mod$",                    // Go projects
    "Cargo.toml$",                // Rust projects
    "pom.xml$",                   // Maven/Java projects
    "docusaurus.config.js$",      // Docusaurus sites
    "^.gitlab",                   // GitLab CI files
    "^.eslintrc",                 // ESLint configs
    ".properties.json$"           // This file
]
```

### Pattern Tips
- Use `$` for end-of-filename
- Use `^` for start-of-filename
- Use `.*` for any characters
- Multiple patterns work with AND logic (all must match)

---

## GitHub Actions Workflow Template Files

### Directory Structure
```folder
.github/
├── workflow-templates/
│   ├── my-workflow.yml                    # Workflow YAML
│   ├── my-workflow.properties.json        # Metadata (MUST match filename)
│   ├── workflow-template-node.svg         # Optional: Custom icon
│   └── workflow-template-security.svg     # Optional: Custom icon
└── workflows/
    └── (your repo's own workflows)
```

### Icons
- Built-in: `"iconName": "octicon check"` or other octicons
- Custom SVG: `"iconName": "workflow-template-node.svg"` (file must exist in templates dir)

---

## References

- [Creating starter workflows for your organization](https://docs.github.com/en/actions/using-workflows/creating-starter-workflows-for-your-organization)
- [GitHub Linguist Languages](https://github.com/github/linguist/blob/main/lib/linguist/languages.yml)
- [Starter Workflows Repository](https://github.com/actions/starter-workflows)

---

## SchemaStore Submission Snippet

Use the generated schema at:

```text
schemas/github-workflow-template-properties.schema.json
```

### Suggested SchemaStore Catalog Entry

```json
{
    "name": "GitHub Actions Workflow Template Properties",
    "description": "Schema for GitHub Actions workflow template metadata files (*.properties.json) in .github/workflow-templates/.",
    "fileMatch": [
        ".github/workflow-templates/*.properties.json",
        "**/.github/workflow-templates/*.properties.json"
    ],
    "url": "https://raw.githubusercontent.com/Nick2bad4u/workflow-templates/main/schemas/github-workflow-template-properties.schema.json"
}
```

### Suggested Pull Request Summary

````md
## Summary

Adds a JSON schema for GitHub Actions workflow template metadata files (`.github/workflow-templates/*.properties.json`).

The schema validates:

- `name` (required)
- `description` (required)
- `iconName` (optional: local SVG stem or `octicon <name>`)
- `categories` (optional; values generated from starter-workflows categories, GitHub Linguist languages, and supported tech stacks)
- `filePatterns` (optional regex string array)

## Why

GitHub documents workflow template metadata files, but there is currently no dedicated SchemaStore entry for them. This schema improves editor autocomplete and catches common template metadata mistakes.

## fileMatch

The `fileMatch` patterns are intentionally narrow so they only target workflow template metadata files and do not collide with unrelated `*.properties.json` files.

## Maintenance

This schema is generated from upstream sources with:

```bash
npm run schema:update:workflow-template-properties
```

Fixture validation is available with:

```bash
npm run schema:test:workflow-template-properties
```
````

### Maintainer Checklist

- Run `npm run schema:update:workflow-template-properties`
- Run `npm run schema:test:workflow-template-properties`
- Run `npm run lint`
- Confirm `.github/workflow-templates/*.properties.json` files still validate against the generated schema

---

## Validation Notes

⚠️ **Important:**
- `categories` values **must** be from valid Linguist language names OR general category names
- `filePatterns` values **must** be valid regex (without delimiters)
- The `.properties.json` filename **must** exactly match the `.yml` filename
- Both files **must** be in `.github/workflow-templates/` (no subdirectories)
