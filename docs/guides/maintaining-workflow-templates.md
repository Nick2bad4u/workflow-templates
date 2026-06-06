# Maintaining Workflow Templates

This guide is for maintainers of this template repository.

## Repository Layout

```text
.github/workflow-templates/
  <template>.yml
  <template>.properties.json
  SCHEMA.md

.github/workflows/
  reusable-<template>.yml

schemas/
  github-workflow-template-properties.schema.json
  fixtures/workflow-template-properties/

scripts/
  update-workflow-template-properties-schema.mjs
  validate-workflow-template-properties-schema-fixtures.mjs
```

The `.github/workflow-templates/*.yml` files are the templates consumers receive. The `.properties.json` files control how GitHub presents those templates in the Actions UI.

The `.github/workflows/reusable-*.yml` files are reusable workflow variants that consumers can call with `jobs.<job_id>.uses`. They must stay directly under `.github/workflows/`; GitHub does not support reusable workflow subdirectories.

## Add A Template

1. Add `.github/workflow-templates/<template>.yml`.
2. Add `.github/workflow-templates/<template>.properties.json` with the same basename.
3. Use `$default-branch` when the template should target the consumer repository default branch.
4. Set explicit `permissions`.
5. Set `timeout-minutes` on every job.
6. Add `concurrency` when repeated runs can race or waste compute.
7. Pin actions consistently with the existing templates.
8. Document setup requirements in `USAGE.md`.
9. If the template should also be centrally callable, add or update `.github/workflows/reusable-<template>.yml`.

## Metadata Checklist

Each `.properties.json` file must include:

```json
{
    "name": "Display name",
    "description": "Short UI description"
}
```

Use optional fields when they improve GitHub's template matching:

```json
{
    "iconName": "workflow-template-security",
    "categories": ["JavaScript", "TypeScript", "YAML"],
    "filePatterns": ["package.json$", "package-lock.json$"]
}
```

Do not add arbitrary keys. The schema intentionally rejects unexpected properties.

## Schema Workflow

The schema is generated from upstream category and icon sources:

```bash
npm run schema:update:workflow-template-properties
```

Validate fixtures with:

```bash
npm run schema:test:workflow-template-properties
```

Check that the generated file is already committed and up to date:

```bash
npm run schema:check:workflow-template-properties
```

The update and check commands require network access because they fetch upstream data. If the network is unavailable, run fixture validation and typecheck locally, then rerun the schema update in a connected environment.

## Release Readiness

Before merging template changes:

```bash
npm run typecheck
npm run schema:test:workflow-template-properties
npm run lint
```

Also verify:

- Every template YAML has matching metadata.
- Matching reusable workflows still pass `actionlint`.
- `README.md` and `USAGE.md` mention any new template.
- Required secrets and repository settings are documented.
- CI-only workflows under `.github/workflows/` still validate this repository rather than consumer projects.
- Reusable workflows under `.github/workflows/reusable-*.yml` still expose `workflow_call`.

## Common Mistakes

- Copying `.properties.json` files into a normal consumer repository. Those files are only for template publishers.
- Replacing `$default-branch` with this repository's default branch inside starter templates.
- Placing reusable workflows in a subdirectory. GitHub only supports reusable workflows directly under `.github/workflows/`.
- Granting `contents: write` at workflow level when only one job needs it.
- Adding new generated schema values manually instead of updating the generator or rerunning the schema update.
- Documenting GitHub Pages deployment as branch-based when the workflow uses `actions/deploy-pages`.
