# Coding and documentation standards

Follow the [Google TypeScript](https://google.github.io/styleguide/tsguide.html)
and [Google JavaScript](https://google.github.io/styleguide/jsguide.html) guides:
two spaces, 80-column formatting, single-quoted source strings, explicit braces,
strict comparisons, and clear names. Prettier defines deterministic whitespace;
React JSX keeps double-quoted attributes. Framework-required route filenames and
named exports remain intact. Use type-only TypeScript imports.

Use JSDoc for nontrivial exported interfaces and comments to explain intent,
ownership, cancellation or side effects. Do not add boilerplate that repeats the
implementation. Document resulting behavior and verification in each PR.

Run the repository's formatting, lint and test commands before merging. Web also
requires TypeScript, Knip, build, PDF and responsive checks. Landing requires its
desktop/mobile browser smoke test. Python deployment helpers use four spaces and
Ruff's Google docstring convention; keep their contents byte-identical across the
API, web and landing repositories.

Use short-lived branches and PRs. GitHub Actions publishes immutable commit-tagged
images and deploys Coolify Docker Image applications. Never commit runtime secrets.
The API migration/API release precedes worker/web changes when contracts evolve.
Verify healthy deployments and the relevant signed-in behavior after release.

See the [canonical contribution policy](https://github.com/robertopatovsky/MediDocs-api/blob/main/CONTRIBUTING.md)
and [system architecture](https://github.com/robertopatovsky/MediDocs-api/blob/main/docs/architecture/ARCHITECTURE.md)
for data ownership, migration and rollback rules.
