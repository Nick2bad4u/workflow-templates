---
name: "Codex-Instructions-Repository-Workflows"
description: "Guidance for this repository's own GitHub Actions workflows."
applyTo: ".github/workflows/*.yml"
---

# Repository Workflow Instructions

Files in `.github/workflows/` include two different surfaces:

- Repository automation such as `ci.yml`, `codeql.yml`, `dependency-review.yml`, and `gitleaks.yml`, which validate and protect this repository.
- Reusable workflows named `reusable-*.yml`, which consumers call with `jobs.<job_id>.uses`.

They are still separate from `.github/workflow-templates/*.yml`, which consumers select from the GitHub Actions UI and copy into their own repositories.

## Standards

- Keep `permissions` explicit and least-privilege.
- Keep `timeout-minutes` on each job.
- Use `concurrency` where repeated runs can waste resources or race.
- Pin marketplace actions to immutable commit SHAs where practical and keep the upstream version in a comment.
- Use `.node-version` with `actions/setup-node` for Node jobs.
- Prefer `npm ci` for CI installs.
- Keep generated schema validation in CI:
  - `npm run schema:check:workflow-template-properties`
  - `npm run schema:test:workflow-template-properties`
- Keep workflow template metadata presence checks in CI so every `.github/workflow-templates/*.yml` has a paired `.properties.json`.
- Keep reusable workflows directly under `.github/workflows/`; GitHub does not support reusable workflow subdirectories.
- Reusable workflows must include `on: workflow_call`.
- Define explicit `inputs` and `secrets` for `workflow_call` when the caller must provide data.
- In caller examples, invoke reusable workflows at the job level with `jobs.<job_id>.uses`, not from steps.
- Prefer SHA pinning for cross-repository reusable workflow callers.
- Assume `GITHUB_TOKEN` permissions can only be maintained or reduced by called workflows; never rely on a called workflow to elevate caller permissions.
- Prefer explicit workflow outputs for data flow between caller and called workflows; do not rely on `env` propagation across workflow boundaries.
- Avoid deep reusable workflow chains; keep nesting shallow and below GitHub platform limits.

## Validation

After workflow edits, run local checks when available:

```bash
npm run lint
npm run typecheck
```

If actionlint is available locally, run it against `.github/workflows/*.yml` and `.github/workflow-templates/*.yml`.
