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
- [ ] Open `http://localhost:3000`.
- [ ] Click **Connect Freighter** button.
- [ ] Verify that Freighter requests permission to view public key.
- [ ] Confirm connection: the connected Stellar testnet address (`G...`) is displayed.

### 2. Deposit Flow (Pay with Naira)
- [ ] Select or enter an amount (e.g. 100 NGN or equivalent SRT).
- [ ] Click **Pay with Naira** / **Start Deposit**.
- [ ] Verify the hosted deposit URL opens or interactive prompt initiates.
- [ ] Simulate or confirm payment completion on the mock anchor.
- [ ] Observe `StatusTimeline` transitions: `pending_user_transfer_start` -> `pending_anchor` -> `completed`.
- [ ] Verify success confirmation and final transaction receipt.

### 3. Withdrawal Flow (Cash Out to Naira)
- [ ] Select or enter withdrawal amount and asset.
- [ ] Provide destination Nigerian bank details or mock account info.
- [ ] Click **Cash Out to Naira** / **Start Withdrawal**.
- [ ] Observe Freighter wallet popup requesting transaction signature.
- [ ] Sign the payment transaction to the anchor withdrawal account.
- [ ] Verify transaction submission to Horizon testnet and hash returned.
- [ ] Observe timeline update until settlement reaches `completed`.

### 4. Wrong-Network Warning
- [ ] Open Freighter extension and switch active network away from Testnet (e.g. to Futurenet or Mainnet).
- [ ] Refresh or interact with the demo page.
- [ ] Verify clear, prominent banner warning: **"Wrong Network: Freighter must be connected to Stellar Testnet"**.
- [ ] Verify that deposit and withdrawal actions are disabled while on an unsupported network.
- [ ] Switch Freighter back to Testnet and verify warning disappears and buttons are re-enabled.
