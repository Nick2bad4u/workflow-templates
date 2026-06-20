# Dependabot Auto-Merge

Use `auto-merge-dependabot.yml` when a repository already uses Dependabot and you want GitHub auto-merge enabled for selected semantic-version update levels.

Consumers copy only the workflow YAML into `.github/workflows/`. Do not copy the `.properties.json` metadata file into ordinary repositories.

Workflow templates are not reusable workflows. A consumer workflow does not call this repository with `uses:`. The GitHub UI or a manual copy creates a normal workflow file in the consumer repository.

If you want to call the central reusable workflow instead of copying the template, use `.github/workflows/reusable-auto-merge-dependabot.yml`. See [Reusable Workflows](./reusable-workflows.md).

## Setup

1. Copy `.github/workflow-templates/auto-merge-dependabot.yml` to `.github/workflows/auto-merge-dependabot.yml` in the consumer repository.
2. Enable repository auto-merge in **Settings -> General -> Pull Requests -> Allow auto-merge**.
3. Configure Dependabot in `.github/dependabot.yml`.
4. Require the CI, test, and security checks that must pass before auto-merge completes.
5. Set `DEPENDABOT_AUTO_MERGE_SEMVER` as a repository or organization Actions variable when the default policy is not right for the repo.

## Example Workflow File

See [auto-merge-dependabot.yml](../examples/workflows/auto-merge-dependabot.yml) for a complete consumer workflow file after the template has been selected or copied.

That example shows what a generated `.github/workflows/auto-merge-dependabot.yml` can look like in a normal repository after the template-only `$default-branch` placeholder has been replaced with `main`.

## Semver Policy

The workflow reads `DEPENDABOT_AUTO_MERGE_SEMVER` from GitHub Actions variables.

If the variable is unset, the default is:

```text
patch,minor
```

Accepted entries are:

```text
patch
minor
major
```

Use comma-separated combinations:

```text
patch,minor
patch,minor,major
patch
minor
major
```

The workflow also accepts full Dependabot update-type values for compatibility:

```text
version-update:semver-patch,version-update:semver-minor
```

Invalid values fail the workflow with an explicit error instead of silently changing merge behavior.

## Dependabot Branch Updates

The workflow runs for pull requests authored by `dependabot[bot]`, even when a maintainer updates the Dependabot branch from the base branch. Before enabling auto-merge, it verifies that the pull request comes from the same repository, uses a `dependabot/*` branch, and contains only Dependabot commits or branch-update merge commits into the Dependabot branch.

## Examples

### Patch and Minor Updates

Use this for most repositories. Patch and minor dependency updates can auto-merge after required checks pass, while major updates stay manual.

```text
DEPENDABOT_AUTO_MERGE_SEMVER=patch,minor
```

### Patch Updates Only

Use this for libraries, CLIs, or shared config packages where even minor dependency updates can affect consumers.

```text
DEPENDABOT_AUTO_MERGE_SEMVER=patch
```

### Minor Updates Only

This is unusual, but supported. Patch updates stay manual and minor updates can auto-merge.

```text
DEPENDABOT_AUTO_MERGE_SEMVER=minor
```

### Patch, Minor, and Major Updates

Use this only when branch protection or repository rules require the review and checks you trust for major dependency updates.

```text
DEPENDABOT_AUTO_MERGE_SEMVER=patch,minor,major
```

### Major Updates Only

This is usually not the right default. It is supported for repositories that handle patch and minor updates manually but want major updates queued behind strict required checks.

```text
DEPENDABOT_AUTO_MERGE_SEMVER=major
```

## Variable Scope

Use a repository variable when one repository needs its own policy:

```text
DEPENDABOT_AUTO_MERGE_SEMVER=patch
```

Use an organization variable when multiple repositories should share one policy. Repositories can override the organization variable with a repository variable of the same name.

## Required Protection

Auto-merge is not a substitute for branch protection. Before allowing `major`, make sure the target branch requires:

- CI and test checks.
- Dependency review or equivalent security checks.
- Code owner review when the repository needs human approval.
- A merge method supported by the workflow command.

The template uses squash auto-merge by default:

```bash
gh pr merge --auto --squash "${PR_URL}"
```

Change that command in the copied consumer workflow if the repository uses merge commits or rebase merges.

## Related Files

- [README.md](../../README.md)
- [USAGE.md](../../USAGE.md#dependabot-auto-merge)
- [Example consumer workflow](../examples/workflows/auto-merge-dependabot.yml)
- [Reusable workflow caller example](../examples/reusable-workflows/auto-merge-dependabot-caller.yml)
- [.github/workflow-templates/auto-merge-dependabot.yml](../../.github/workflow-templates/auto-merge-dependabot.yml)
- [.github/workflow-templates/SCHEMA.md](../../.github/workflow-templates/SCHEMA.md)
