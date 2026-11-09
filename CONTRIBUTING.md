# Contributing to NairaRamp Demo

## About the Project
`nairaramp-demo` is a Next.js (App Router) reference application that demonstrates NairaRamp deposit and withdrawal flows on Stellar Testnet using the Freighter wallet. It serves as both an interactive testbed and a developer quickstart built purely on top of published `@nairaramp/core` and `@nairaramp/react` npm packages.

## Setup
To set up the project locally:
1. Ensure **Node 20+** and **pnpm 9** (`pnpm@9.15.9`) are installed.
2. Clone this repository: `git clone https://github.com/redclay-labs/nairaramp-demo.git && cd nairaramp-demo`
3. Install dependencies: `pnpm install`
4. Copy environment configuration: `cp .env.example .env.local`
5. Start local development server: `pnpm dev` (opens at `http://localhost:3000`)
6. Ensure your **Freighter** wallet is set to **Testnet** and funded with test lumens via **Friendbot** (`https://laboratory.stellar.org/#account-creator?network=test`).

## Tests
- Run automated unit and component smoke tests: `pnpm test`
- Perform manual testnet verification using the checklist in [`docs/MANUAL-TEST.md`](docs/MANUAL-TEST.md) (covering wallet connection, deposit flow, withdrawal flow, and wrong-network warning).

## Scope
This repository owns only the demo application pages, components, and quickstart documentation.
- SDK, SEP protocols, cryptographic signer, and ramp logic changes belong in [`nairaramp-core`](https://github.com/redclay-labs/nairaramp-core).
- Reusable React hooks and UI library components belong in [`nairaramp-react`](https://github.com/redclay-labs/nairaramp-react).

## Branching & Pull Requests
- Branch naming convention: `issue-<number>-<short-name>` (e.g. `issue-12-wallet-status`).
- One issue per pull request.
- Every PR must link to its issue using `"Closes #n"`.
- Screenshots are strictly required for any UI or visual change.

## Stellar Wave
This repository takes part in the Stellar Wave program on Drips.

Maintainers add issues in the Drips Wave app, and the Drips Wave bot labels them "Stellar Wave". During an active Wave (usually one week each month), contributors sign in at [drips.network/wave](https://drips.network/wave) with GitHub and apply to an issue; the maintainer assigns one applicant.

Merged work earns points based on complexity:
- **Trivial**: 100 points
- **Medium**: 150 points
- **High**: 200 points

Rewards are shared proportionally by points after the Wave concludes. For detailed guidelines, see the [Stellar Wave documentation](https://docs.drips.network/wave).

## Code Rules
- **Testnet only**: The app must refuse any network other than Stellar Testnet.
- **No unapproved dependencies**: Never add a dependency without prior discussion and maintainer approval.
