---
name: "Codex-Instructions-Workflow-Template-Tests"
description: "Testing guidance for workflow-template schema fixtures and repository validation."
applyTo: "test/**"
---

# Test Instructions

This repository is not an ESLint rule plugin. Do not use `RuleTester`, parser services, or ESLint rule fixture patterns here.

Use repository validation scripts and focused fixtures:

- Schema fixtures belong under `schemas/fixtures/workflow-template-properties/`.
- Valid fixtures should cover minimal and fully populated metadata files.
- Invalid fixtures should cover missing required fields, wrong types, empty strings, and unexpected properties.
- Prefer plain Node.js validation scripts for schema behavior unless the repository introduces a dedicated test runner.

Before finalizing fixture or validation changes, run:

```bash
npm run schema:test:workflow-template-properties
npm run typecheck
```
