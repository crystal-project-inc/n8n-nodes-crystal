# @crystalknows/n8n-nodes-crystal

This is an n8n community node. It lets you use the [Crystal](https://www.crystalknows.com/) Data API in your n8n workflows.

Crystal predicts anyone's DISC personality type and turns it into practical guidance — how to email them, sell to them, run a meeting with them — from a name, email, or LinkedIn URL.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Usage](#usage)
[Resources](#resources)
[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

In n8n: **Settings → Community Nodes → Install**, then enter `@crystalknows/n8n-nodes-crystal`.

## Operations

### Profile

| Operation | Description | Cost |
| --- | --- | --- |
| **Get** | Real-time lookup of a profile Crystal already knows. Does not create new profiles — returns nothing if the person is not already known; use a Prediction for that. | 1 credit on a hit; re-fetches of the same profile are free |

Identify the person with any combination of full name, email, LinkedIn URL, job title, company name, or phone.

### Prediction

| Operation | Description | Cost |
| --- | --- | --- |
| **Create** | Submit an async lookup and return immediately with a job ID. | 1 credit only if the job completes with a profile found |
| **Get** | Poll for the result of a submitted job by job ID. | — |
| **Create and Wait** | Submit a lookup, then poll until the job finishes (or the timeout is hit) and return the final result. | 1 credit only if a profile is found |

`Create` and `Create and Wait` accept an optional **Record ID** — a client-supplied idempotency key. Resubmitting the same Record ID will not double-charge.

### Content

All content operations take a Crystal profile ID (from a Profile or Prediction step) unless noted.

| Operation | Description | Cost |
| --- | --- | --- |
| **Get Personality Content** | Full personality content for a profile. | Free |
| **Get Selling-To Playbook** | A "selling to this person" playbook. | Free |
| **Get Communication Advice** | Communication advice for each of one or more profiles. | Free |
| **Get Relationship Matrix** | A relationship matrix across several profiles. | Free |
| **Generate Prompt** | A ready-to-inject, DISC-tuned prompt you paste into your own AI workflow. Identify the recipient by profile ID or a raw DISC type (e.g. `D`, `Di`, `Sc`). | Free — deterministic, no model call |
| **Revise Email** | Rewrite a draft email so it lands well with the recipient, adapting tone, structure, and directness to their DISC type. | 1 credit per successful revision (not deduplicated) |

## Credentials

You need a Crystal Data API key.

1. Sign up at [crystalknows.com](https://www.crystalknows.com/) and verify your email.
2. Generate a key at [data.crystalknows.com/api-keys](https://data.crystalknows.com/api-keys).
3. In n8n, create a new **Crystal API** credential and paste the key.

The key is sent as a bearer token (`Authorization: Bearer <key>`). Treat it like a password — anyone with it can call the API as you. The credential test calls `POST /v4/content/generate_prompt`, which is free and spends no credit.

API credits are a single pool per organization. See the [API reference](https://data.crystalknows.com/llms-full.txt) for exactly when a credit is spent.

## Compatibility

- Requires n8n 1.60.0 or later (for `usableAsTool` support).
- Tested against n8n 1.7x and Node.js 20 / 22.

## Usage

- **Enrich a lead the moment it arrives.** Trigger on a new CRM contact → **Prediction: Create and Wait** with their email → branch on `result.state` (`found` / `not_found`).
- **Draft on-brand outreach.** **Content: Generate Prompt** with the profile ID and an objective, then feed the returned `prompt` into an AI Agent / LLM node — or use **Content: Revise Email** to have Crystal rewrite an existing draft directly.
- **As an AI Agent tool.** Attach this node to an AI Agent; the agent can look up a person and pull communication advice on its own.

`Prediction: Create and Wait` blocks the workflow while it polls (default: every 5s, up to 300s). Jobs usually finish within a minute or two but can take longer when Crystal's queue is busy. For large batches, prefer **Create** + a later **Get** (e.g. via a Wait node), or raise the timeout.

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [Crystal Data API reference](https://data.crystalknows.com/llms-full.txt)
* [Crystal API (Swagger)](https://api.crystalknows.com/v4/swagger)

## Version history

See [CHANGELOG.md](./CHANGELOG.md).
