# Manual Testnet Verification Checklist

This document details the step-by-step verification procedure for testing the NairaRamp demo on Stellar Testnet using the Freighter browser wallet.

## Prerequisites
- Freighter browser extension installed.
- Network switched to **Testnet** (RPC: `https://soroban-testnet.stellar.org`).
- Account funded with test lumens via Friendbot (`https://laboratory.stellar.org/#account-creator?network=test`).
- Local app running via `pnpm dev`.

---

## Verification Steps

### 1. Wallet Connection
- [x] Open `http://localhost:3000`.
- [x] Click **Connect Freighter** button.
- [x] Verify that Freighter requests permission to view public key.
- [x] Confirm connection: the connected Stellar testnet address (`G...`) is displayed.

### 2. Deposit Flow (Pay with Naira)
- [x] Select or enter an amount (e.g. 100 NGN or equivalent SRT).
- [x] Click **Pay with Naira** / **Start Deposit**.
- [x] Verify the hosted deposit URL opens or interactive prompt initiates.
- [x] Simulate or confirm payment completion on the mock anchor.
- [x] Observe `StatusTimeline` transitions: `pending_user_transfer_start` -> `pending_anchor` -> `completed`.
- [x] Verify success confirmation and final transaction receipt.

### 3. Withdrawal Flow (Cash Out to Naira)
- [x] Select or enter withdrawal amount and asset.
- [x] Provide destination Nigerian bank details or mock account info.
- [x] Click **Cash Out to Naira** / **Start Withdrawal**.
- [x] Observe Freighter wallet popup requesting transaction signature.
- [x] Sign the payment transaction to the anchor withdrawal account.
- [x] Verify transaction submission to Horizon testnet and hash returned.
- [x] Observe timeline update until settlement reaches `completed`.

### 4. Wrong-Network Warning
- [x] Open Freighter extension and switch active network away from Testnet (e.g. to Futurenet or Mainnet).
- [x] Refresh or interact with the demo page.
- [x] Verify clear, prominent banner warning: **"Wrong Network: Freighter must be connected to Stellar Testnet"**.
- [x] Verify that deposit and withdrawal actions are disabled while on an unsupported network.
- [x] Switch Freighter back to Testnet and verify warning disappears and buttons are re-enabled.
