# Deploying NairaRamp Demo to Vercel

This guide explains how to import and deploy the `nairaramp-demo` repository to Vercel, configure the required testnet environment variables, and verify that the deployed application strictly refuses any non-testnet network.

---

## 1. Import Repository into Vercel

1. Log into your account on [Vercel](https://vercel.com).
2. From the Vercel Dashboard, click **Add New...** > **Project**.
3. Select and import the `redclay-labs/nairaramp-demo` Git repository.

---

## 2. Project Configuration Settings

Configure the build settings as follows:

* **Framework Preset**: `Next.js`
* **Root Directory**: `./` (leave default repository root)
* **Build Command**: `next build` (or leave default `pnpm build`)
* **Output Directory**: `.next` (leave default)
* **Install Command**:
  Under **Build and Output Settings**, toggle **Install Command** to **Override** and specify:
  ```bash
  pnpm install --frozen-lockfile
  ```
* **Node.js Version**: Ensure your Vercel project settings use **Node.js 20.x** (Settings > General > Node.js Version).

---

## 3. Environment Variables

Add the environment variables defined in `.env.example`:

| Key | Value | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_STELLAR_NETWORK` | `testnet` | Target Stellar network. Must be strictly `"testnet"`. |
| `NEXT_PUBLIC_NAIRARAMP_ANCHOR_ID` | `sdf-testanchor` | Registered anchor identifier for SEP-24 operations. |

> **Note**: Both variables must be added to **Production**, **Preview**, and **Development** environments in the Vercel dashboard.

Click **Deploy** to trigger the initial deployment build.

---

## 4. Confirming the Deployed Site Refuses Non-Testnet Networks

The demo application is strictly testnet-only and enforces dual-layer network validation:

### A. Client Wallet Network Guard
1. Open the deployed production URL (e.g. `https://nairaramp-demo.vercel.app`) in a browser with the Freighter extension installed.
2. Open the Freighter extension and switch the active network away from Testnet (e.g., to **Public Network / Mainnet** or **Futurenet**).
3. Connect your wallet or refresh the page.
4. **Expected Behavior**:
   - `WalletPanel` immediately renders a prominent warning:
     > **Wrong Network: Freighter is connected to public. Please switch Freighter to Testnet.**
   - The deposit section (`<DepositSection />`) and withdrawal section (`<WithdrawSection />`) are completely hidden.
   - Any attempt to trigger deposit or withdrawal flows is blocked.
5. Switch Freighter back to **Testnet**:
   - The warning banner disappears immediately.
   - Deposit and Cash Out sections are re-enabled.

### B. Configuration-Level Environment Guard
1. In the Vercel Project Settings under **Environment Variables**, temporarily change `NEXT_PUBLIC_STELLAR_NETWORK` to `"mainnet"` and redeploy.
2. Open the deployed URL.
3. **Expected Behavior**:
   - `lib/config.ts` fails configuration validation at application startup.
   - The entire home page content is replaced with a single full-screen error alert:
     > **Configuration Error: Invalid network "mainnet". NairaRamp demo is testnet only.**
   - No wallet connect buttons, deposit flows, or SDK ramps are initialized.
4. Revert `NEXT_PUBLIC_STELLAR_NETWORK` back to `"testnet"` and redeploy to restore normal operation.
