---
name: "Codex-Instructions-Workflow-Template-Docs"
description: "Documentation guidance for workflow-template usage and maintenance guides."
applyTo: "docs/**"
---

# Documentation Instructions

Docs in this repository should help two audiences:

- Consumers who want to copy or select a workflow template.
- Maintainers who add, validate, and release templates from this repository.

Write docs in direct, operational language. Prefer exact file names, commands, required secrets, permissions, and validation steps over generic CI/CD advice.

## Required Accuracy

- Distinguish template files from repository workflows:
  - `.github/workflow-templates/*.yml` are consumer-facing templates.
  - `.github/workflows/*.yml` are this repository's own automation.
- Distinguish consumer usage from template-repository maintenance:
  - Consumers copy generated workflow YAML to `.github/workflows/`.
  - Maintainers pair template YAML with `.properties.json` metadata in `.github/workflow-templates/`.
- Do not imply that `.properties.json` files are needed in ordinary consumer repositories.
- If a guide mentions GitHub Pages with `actions/deploy-pages`, say the Pages source must be "GitHub Actions".
- If a guide mentions npm provenance, explain the difference between trusted publishing and token-based publishing.

## Style

- Keep headings short and task-oriented.
- Use fenced code blocks with language tags.
- Prefer checklists for setup and release gates.
- Keep examples minimal but runnable.
- Link back to `README.md`, `USAGE.md`, and `.github/workflow-templates/SCHEMA.md` where appropriate.
