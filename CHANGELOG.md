# Changelog

All notable changes to this project are documented here.

## [0.1.0] - Unreleased

### Added
- Initial release of the Crystal community node.

### Security
- Toolchain pinned to `@n8n/node-cli` ^0.47.2 and `release-it` ^21 to clear all
  critical/high advisories from the dev dependency tree.
- The published package has **no runtime dependencies** (`npm audit --omit=dev`:
  0 vulnerabilities); `n8n-workflow` is a peer provided by the n8n host.
- Remaining `npm audit` findings (10 moderate: `qs`, `stream-json`, `uuid`) live
  inside `@n8n/node-cli`'s own tree and are dev-only. `npm audit fix --force`
  would downgrade `@n8n/node-cli` below n8n's 0.23 verification floor, so they are
  left for upstream to resolve.
- **Credentials**: `Crystal API` (bearer API key), tested against `POST /v4/content/generate_prompt`.
- **Profile** resource: `Get` — real-time lookup of a profile Crystal already knows.
- **Prediction** resource: `Create`, `Get`, and `Create and Wait` (submits an async
  lookup and polls until the job reaches a terminal state; default poll 5s, timeout 300s).
- **Content** resource: `Get Personality Content`, `Get Selling-To Playbook`,
  `Get Communication Advice`, `Get Relationship Matrix`, `Generate Prompt`, `Revise Email`.
- Node is exposed as an AI Agent tool (`usableAsTool`).
