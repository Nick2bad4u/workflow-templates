# Workflow Templates Staging Area

This folder is a **working directory** for converting your existing workflows into reusable GitHub Actions workflow templates.

## How to use it

1. **Copy your workflow files** into this folder
   - Just drop them here as-is (no need to modify yet)
   - Example: `my-release.yml`, `my-lint.yml`, etc.

2. **Tell me when you're ready** to convert them
   - I'll transform them into proper templates:
     - Replace hardcoded values with placeholders (`$default-branch`, `$owner/$repo`, etc.)
     - Add metadata `.properties.json` files
     - Move them to `.github/workflow-templates/`
     - Clean up opinionated/org-specific logic if needed

3. **I'll keep the originals** in this staging folder so you have a reference

## Examples of what goes here

- `release-by-tag.yml` → copy here first
- `pnpm-ci.yml` → copy here first
- `deploy-production.yml` → copy here first

Then when you're ready, I'll convert all of them to templates at once.

---

**Next step**: Copy your workflows in here, and let me know when you want to batch-convert them!
