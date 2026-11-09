# NairaRamp demo

nairaramp-demo is a Next.js (App Router) reference application that demonstrates fiat-to-crypto deposit and withdrawal flows on Stellar Testnet using the Freighter browser wallet. It showcases end-to-end integration with the published `@nairaramp/core` and `@nairaramp/react` packages alongside a 15-minute developer quickstart.

Live demo: LIVE_DEMO_URL

Demo video: DEMO_VIDEO_URL

**Testnet only**: This demo connects exclusively to Stellar Testnet and rejects all other networks.

---

## Local Run Steps

### 1. Prerequisites
- **Node.js**: 20+ (`node --version`)
- **pnpm**: 9 (`pnpm --version`)
- **Freighter Extension**: Installed in your browser, network set to **Testnet**, and funded via Friendbot.

### 2. Setup and Execution

1. **Clone the repository**:
   ```bash
   git clone https://github.com/redclay-labs/nairaramp-demo.git
   cd nairaramp-demo
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   The default configuration targets Stellar Testnet with the SDF test anchor:
   ```env
   NEXT_PUBLIC_STELLAR_NETWORK=testnet
   NEXT_PUBLIC_NAIRARAMP_ANCHOR_ID=sdf-testanchor
   ```

4. **Start the local development server**:
   ```bash
   pnpm dev
   ```

5. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000). Connect your Freighter wallet on Testnet to run deposit and cash out flows.

### 3. Verification Commands

```bash
pnpm lint        # Run ESLint rules
pnpm typecheck   # Validate TypeScript types without emit
pnpm test        # Run Vitest unit tests
pnpm build       # Run Next.js Turbopack production build
```

---

## Documentation and Upstream Packages

- **15-Minute Developer Quickstart**: [docs/quickstart.md](docs/quickstart.md)
- **Manual Testnet Verification Checklist**: [docs/MANUAL-TEST.md](docs/MANUAL-TEST.md)
- **Deployment Guide**: [docs/DEPLOY.md](docs/DEPLOY.md)
- **Contributing Guidelines**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **Security Policy**: [SECURITY.md](SECURITY.md)
- **License**: [Apache-2.0](LICENSE)

### Upstream Repositories

- **Core SDK**: [@nairaramp/core](https://github.com/redclay-labs/nairaramp-core)
- **React Components & Hooks**: [@nairaramp/react](https://github.com/redclay-labs/nairaramp-react)
