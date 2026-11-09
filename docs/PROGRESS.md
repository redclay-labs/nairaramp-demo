# Progress log

## 2026-11-09 - Step 00: Rules

- **What was built:**
  - `AGENTS.md`: Created project instructions, scope boundary, hard rules, commit and push prompts, end of step guidelines, and command list.
  - `docs/DECISIONS.md`: Initialized decisions log with starting rows and recorded GitHub owner (`redclay-labs`).
  - `docs/UPSTREAM-REQUESTS.md`: Initialized requests to sibling repositories log.
  - `VERSIONS.md`: Initialized pinned versions log.
  - `docs/PROGRESS.md`: Initialized progress log.
  - Checked git configuration without committing: confirmed origin URL points to `https://github.com/redclay-labs/nairaramp-demo.git` (owner: `redclay-labs`) and current branch is `main`.
- **Commands run with results:**
  - `git remote -v`: Confirmed origin points to `https://github.com/redclay-labs/nairaramp-demo.git` (exit code 0).
  - `git branch --show-current`: Confirmed branch is `main` (exit code 0).
- **Open issues:** None.

## 2026-11-09 - Step 01: Upstream intake

- **What was built:**
  - `upstream/core-API.md`: Downloaded core API contract from `https://raw.githubusercontent.com/redclay-labs/nairaramp-core/v0.1.0/docs/API.md` with source header line `Source: redclay-labs/nairaramp-core tag v0.1.0, downloaded 2026-11-09`.
  - `upstream/react-API.md`: Downloaded react API contract from `https://raw.githubusercontent.com/redclay-labs/nairaramp-react/v0.1.0/docs/API.md` with source header line `Source: redclay-labs/nairaramp-react tag v0.1.0, downloaded 2026-11-09`.
  - Confirmed via `npm view` that `@nairaramp/core` is version `0.1.0` and `@nairaramp/react` is version `0.1.0`, and recorded them in `VERSIONS.md`.
  - Verified required exports documented in contracts: `createRamp`, `freighterSigner`, `getAnchor`, `listAnchors`, `TransactionStatus`, `Ramp` (`withdraw`, `completeWithdrawal`, `watch`, `deposit`) from core, and `PayWithNaira`, `StatusTimeline`, `usePayWithNaira` from react. No missing exports detected.
- **Commands run with results:**
  - `curl.exe -fsSL https://raw.githubusercontent.com/redclay-labs/nairaramp-core/v0.1.0/docs/API.md -o ...`: Downloaded core API contract cleanly (exit code 0).
  - `curl.exe -fsSL https://raw.githubusercontent.com/redclay-labs/nairaramp-react/v0.1.0/docs/API.md -o ...`: Downloaded react API contract cleanly (exit code 0).
  - `npm view @nairaramp/core version`: Verified version `0.1.0` (exit code 0).
  - `npm view @nairaramp/react version`: Verified version `0.1.0` (exit code 0).
- **Open issues:** None.

## 2026-11-09 - Step 02: Next.js app

- **What was built:**
  - Initialized Next.js 16 App Router application scaffold via `pnpm dlx create-next-app@latest next-tmp` with `--ts`, `--app`, `--eslint`, `--no-tailwind`, `--no-src-dir`, `--import-alias "@/*"`, `--use-pnpm`, `--yes`, `--skip-install`, `--disable-git`, `--no-agents-md`.
  - Moved files from temporary directory to root without overwriting `AGENTS.md`, `docs/`, `upstream/`, or `VERSIONS.md`. Merged `.gitignore` (preserving `.env*` and ignoring `.next-tmp`, `next-tmp`). Deleted temporary directory.
  - Configured `package.json` with `"packageManager": "pnpm@9.15.9"`, `"engines": { "node": ">=20" }`, exact dependencies (`@nairaramp/core@0.1.0`, `@nairaramp/react@0.1.0`, `@stellar/freighter-api@6.0.1`, `next@16.4.5`, `react@19.3.0`, `react-dom@19.3.0`), and devDependencies (`@testing-library/react@16.3.3`, `@types/node@26.6.6`, `@types/react@19.3.0`, `@types/react-dom@19.3.0`, `@vitejs/plugin-react@6.3.0`, `eslint@9.22.0`, `eslint-config-next@16.4.5`, `jsdom@26.0.0`, `typescript@5.8.3`, `vitest@5.1.0`).
  - Added `.nvmrc` pinned to `20`.
  - Configured `vitest.config.ts` with `jsdom` environment and `@vitejs/plugin-react`.
  - Replaced starter page (`app/page.tsx`) with heading "NairaRamp demo" and "Testnet only" notice.
  - Added smoke test in `test/smoke.test.tsx` verifying page heading and notice rendering.
  - Recorded all pinned package versions in `VERSIONS.md`.
  - Recorded decision regarding temporary directory naming in `docs/DECISIONS.md`.
- **Commands run with results:**
  - `pnpm dlx create-next-app@latest ...`: Bootstrapped Next.js template in `next-tmp` (exit code 0).
  - `pnpm install`: Installed dependencies and generated `pnpm-lock.yaml` (exit code 0).
  - `pnpm lint`: Ran ESLint, passed with 0 errors (exit code 0).
  - `pnpm typecheck`: Ran `tsc --noEmit`, passed with 0 errors (exit code 0).
  - `pnpm test`: Ran Vitest smoke test, passed 1 test (exit code 0).
  - `pnpm build`: Ran Next.js Turbopack production build, compiled successfully (exit code 0).
- **Open issues:** None.
