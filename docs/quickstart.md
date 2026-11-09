# NairaRamp 15-Minute Quickstart

## 1. What You Will Build

In this quickstart, you will build a complete Naira-to-crypto deposit flow in a React or Next.js web application. You will connect to the Stellar Testnet using the Freighter wallet extension, initiate an interactive SEP-24 fiat deposit using `@nairaramp/core` and `@nairaramp/react`, and display real-time transaction updates using an animated progress timeline.

**Estimated time**: 15 minutes.

---

## 2. Prerequisites

Before starting, ensure you have the following:

- **Node.js 20+** installed (`node --version`).
- **A React or Next.js application** (React 18 or 19; Next.js App Router or Pages Router).
- **Freighter browser extension** installed in your browser ([Freighter Wallet](https://www.freighter.app)):
  - Switch network to **Testnet** (Settings > Network > Test Net).
  - Fund your testnet account address with test lumens using Friendbot via [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test) or by calling `https://friendbot.stellar.org/?addr=<your-address>`.
  - Add a trustline for the test asset **SRT** issued by `GCDNJUBQSX7AJWLJACMJ7I4BC3Z47BQUTMHEICZLE6MU4KQBRYG5JY6B` (in Freighter: click **+ / Manage Assets** > **Add Custom Asset** > Code: `SRT`, Issuer: `GCDNJUBQSX7AJWLJACMJ7I4BC3Z47BQUTMHEICZLE6MU4KQBRYG5JY6B`).

---

## 3. Installation

Install the required packages pinned to exact versions:

```bash
pnpm add @nairaramp/core@0.1.0 @nairaramp/react@0.1.0 @stellar/freighter-api@6.0.1
```

If using npm or yarn:

```bash
npm install --save-exact @nairaramp/core@0.1.0 @nairaramp/react@0.1.0 @stellar/freighter-api@6.0.1
```

---

## 4. Create a Ramp Instance

Initialize a `Ramp` client using `createRamp` and `freighterSigner` from `@nairaramp/core`. Configure it for `testnet` with the test anchor `sdf-testanchor`:

```typescript
import { createRamp, freighterSigner } from "@nairaramp/core";

export const ramp = createRamp({
  network: "testnet",
  anchorId: "sdf-testanchor",
  signer: freighterSigner(),
});
```

`freighterSigner()` automatically routes Stellar transaction signing requests to the connected Freighter browser extension.

---

## 5. Add the Button and Status Timeline

Drop the pre-built `<PayWithNaira />` button and `<StatusTimeline />` components from `@nairaramp/react` into your UI:

```tsx
"use client";

import { useState } from "react";
import { createRamp, freighterSigner } from "@nairaramp/core";
import type { TransactionStatus } from "@nairaramp/core";
import { PayWithNaira, StatusTimeline } from "@nairaramp/react";

const ramp = createRamp({
  network: "testnet",
  anchorId: "sdf-testanchor",
  signer: freighterSigner(),
});

export function DepositDemo() {
  const [status, setStatus] = useState<TransactionStatus | undefined>(undefined);

  return (
    <div style={{ padding: "1.5rem", maxWidth: "420px", fontFamily: "sans-serif" }}>
      <h2>Fund Wallet with Naira</h2>
      <PayWithNaira
        ramp={ramp}
        assetCode="SRT"
        amount="5"
        label="Pay with Naira"
        onComplete={() => setStatus("completed")}
      />
      <div style={{ marginTop: "1.5rem" }}>
        <StatusTimeline status={status} />
      </div>
    </div>
  );
}
```

`<PayWithNaira />` handles launching the anchor popup window synchronously on user click to ensure browser popup blockers do not suppress the payment modal.

---

## 6. Run It and Complete a Deposit

Start your local development server:

```bash
pnpm dev
```

Open `http://localhost:3000` in your browser. Here is what happens during the flow:

1. **Initial State**: You see the primary **Pay with Naira** button and the idle **StatusTimeline** (showing *Started*).
2. **Clicking Pay with Naira**: The button state switches to `"Connecting..."` and immediately opens a secure popup window pointing to the test anchor's SEP-24 hosted URL (`testanchor.stellar.org`).
3. **Interactive Anchor Modal**: In the anchor popup, review the mock payment details (send amount in USD/NGN, receive amount in test `SRT` tokens) and submit the form.
4. **Anchor Processing**: The anchor simulates receipt of fiat funds and executes the Stellar testnet payment transferring `SRT` tokens into your connected Freighter address.
5. **Completion**: 
   - The button label updates to **"Payment completed"** and triggers `onComplete`.
   - The `<StatusTimeline />` moves to the terminal **Completed** step.
   - Your wallet balance in Freighter reflects the received tokens.

---

## 7. Next Steps

- **Withdrawals (Cash Out to Naira)**:
  To let users off-ramp Stellar tokens back to Nigerian bank accounts, review the withdrawal implementation in [`app/components/WithdrawSection.tsx`](../app/components/WithdrawSection.tsx). It uses `ramp.withdraw({ assetCode, amount })`, monitors settlement with `ramp.watch`, and automatically prompts Freighter to sign the transfer payment with `ramp.completeWithdrawal(id)` when the anchor is ready.

- **Choosing a Real Anchor**:
  For production deployments in Nigeria with real bank transfer and USSD payment rails, select an accredited Nigerian anchor from the anchor registry in [docs/anchors-nigeria.md in nairaramp-core on GitHub](https://github.com/redclay-labs/nairaramp-core/blob/main/docs/anchors-nigeria.md).

- **The Mainnet Safety Guard**:
  `@nairaramp/core` prevents accidental mainnet transactions by throwing `MAINNET_NOT_ALLOWED` unless explicitly configured with verified production anchors. Read about mainnet safety guards in [docs/API.md in nairaramp-core on GitHub](https://github.com/redclay-labs/nairaramp-core/blob/main/docs/API.md#6-mainnet-safety-guard).

