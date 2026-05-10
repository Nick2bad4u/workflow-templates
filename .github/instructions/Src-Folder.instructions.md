---
name: Source-Guidelines
description: Rules for reusable workflow templates
applyTo: ".github/workflow-templates/**"
---

# Template Guidelines (`.github/workflow-templates/`)

- Keep triggers and job names explicit and easy to customize.
- Default to least-privilege `permissions`.
- Prefer deterministic steps and pinned action versions when practical.
- Avoid adding opinionated project-specific logic in generic templates.
