# Copilot Instructions for workflow-templates

This repository hosts **GitHub Actions workflow templates** and related workflow guidance.

It is **not** an npm package and **not** a repository template product; the main artifact is workflow files that users can adopt/customize.

## Core principles

- Keep workflows minimal, purposeful, and easy to customize.
- Use least-privilege permissions by default.
- Keep behavior deterministic and easy to debug.
- Prefer pinned action versions (or pinned SHAs) for security and stability.
- Preserve backward-compatible template intent unless a breaking change is explicitly requested.

## Quality checks

Before finalizing changes, run:

1. `npm run lint`

Also verify:

- Every `.github/workflow-templates/*.yml` has a matching `.properties.json` file.
- Workflow syntax is valid and job/step names are clear.

## Architecture

- Workflow templates: `.github/workflow-templates/`
- Repository workflows: `.github/workflows/`
- Repository docs: root markdown files

## Workflow template requirements (GitHub docs aligned)

- Store templates in `.github/workflow-templates/`.
- For each template file (`name.yml`), include metadata file (`name.properties.json`).
- Metadata:
	- `name` (**required**)
	- `description` (**required**)
	- `iconName` (optional: local SVG name without extension, or `octicon <name>`)
	- `categories` (optional)
	- `filePatterns` (optional regex list for root-level file matching)
- Use `$default-branch` in template triggers when appropriate so the generated workflow maps to the target repository default branch.

## Reusable workflow guidance (GitHub docs aligned)

- Reusable workflows must be in `.github/workflows/` (no subdirectories).
- A reusable workflow must include `on: workflow_call`.
- Define explicit `inputs` and `secrets` for `workflow_call` when needed.
- In callers, invoke reusable workflows at the **job level** via `jobs.<id>.uses` (not in steps).
- Prefer SHA pinning when calling reusable workflows across repositories.
- `GITHUB_TOKEN` permissions can only be maintained or reduced through called workflows; never assume elevation.
- Prefer workflow outputs for data flow between caller/called workflows; do not rely on `env` propagation across workflow boundaries.
- Nesting constraints matter: avoid deep chains; keep well under GitHub limits.

## Behavioral expectations

- Maintain backward-compatible template intent when updating existing templates.
- Keep templates easy to customize for personal project repositories.
- Include clear, actionable workflow/job names.
- Keep template defaults safe for public repositories.
- Avoid organization-specific hardcoding (repo names, branch names, secret names) unless the template is explicitly org-scoped.

## Authoring style expectations

- Include explicit `permissions` blocks.
- Keep triggers intentional (`push`, `pull_request`, `workflow_dispatch`, `schedule`) and avoid unnecessary trigger noise.
- Use concise job names and step names that map to workflow logs clearly.
- Add comments only when they improve maintainability.

## Source references

- Creating workflow templates for your organization:
	- <https://docs.github.com/en/actions/how-tos/reuse-automations/create-workflow-templates>
- Reuse workflows:
	- <https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows>
- Quickstart for GitHub Actions:
	- <https://docs.github.com/en/actions/get-started/quickstart>
- Reusing workflow configurations (reference):
	- <https://docs.github.com/en/actions/reference/workflows-and-actions/reusing-workflow-configurations>
