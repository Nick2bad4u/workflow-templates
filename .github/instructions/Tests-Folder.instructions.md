---
name: Test-Guidelines
description: Rules for repository workflow validation files
applyTo: ".github/workflows/**"
---

# Workflow Validation Guidelines (`.github/workflows/`)

- Keep CI checks deterministic and focused on repository quality gates.
- Validate workflow files and template metadata relationships.
- Keep permissions least-privilege and avoid unnecessary write scopes.
- Add or update validation steps when introducing new templates.
