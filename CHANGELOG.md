# Changelog

All notable changes to this project are documented here.

## [0.1.0] - Unreleased

### Added
- Initial release of the Crystal community node.
- **Credentials**: `Crystal API` (bearer API key), tested against `POST /v4/content/generate_prompt`.
- **Profile** resource: `Get` — real-time lookup of a profile Crystal already knows.
- **Prediction** resource: `Create`, `Get`, and `Create and Wait` (submits an async
  lookup and polls until the job reaches a terminal state; default poll 5s, timeout 300s).
  Auto-generates a `record_id` per execution when none is supplied.
- **Content** resource: `Get Personality Content`, `Get Selling-To Playbook`,
  `Get Communication Advice`, `Get Relationship Matrix`, `Generate Prompt`, `Revise Email`.
- Node is exposed as an AI Agent tool (`usableAsTool`).

### Security
- The published package has **no runtime dependencies** — `npm audit --omit=dev`
  reports 0 vulnerabilities. `n8n-workflow` is a peer provided by the n8n host.
- Dev toolchain pinned to `@n8n/node-cli` ^0.47.2 and `release-it` ^20.2.1.
  `release-it` 21 drops the `-n` flag that `n8n-node release` passes, so it cannot
  be used; 20.2.x is the newest that works.
- Remaining `npm audit` findings (dev-only, inside `@n8n/node-cli` and `release-it`)
  do not affect installs of this package and cannot be resolved without breaking
  the release tooling — n8n community packages may not use an `overrides` field.
