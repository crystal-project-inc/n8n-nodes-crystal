# Changelog

All notable changes to this project are documented here.

## [0.1.0] - Unreleased

### Added
- Initial release of the Crystal community node.
- **Credentials**: `Crystal API` (bearer API key), tested against `POST /v4/content/generate_prompt`.
- **Profile** resource: `Get` — real-time lookup of a profile Crystal already knows.
- **Prediction** resource: `Create`, `Get`, and `Create and Wait` (submits an async
  lookup and polls until the job reaches a terminal state).
- **Content** resource: `Get Personality Content`, `Get Selling-To Playbook`,
  `Get Communication Advice`, `Get Relationship Matrix`, `Generate Prompt`, `Revise Email`.
- Node is exposed as an AI Agent tool (`usableAsTool`).
