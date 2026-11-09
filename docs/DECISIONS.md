# Decisions

GitHub owner: redclay-labs

| Date | Decision | Reason |
| --- | --- | --- |
| 2026-11-09 | Wallet: Freighter only | Most common testnet wallet; keeps the demo short |
| 2026-11-09 | No CSS framework beyond what create-next-app adds | The demo shows the components, not a design system |
| 2026-11-09 | Use `next-tmp` directory with `--disable-git` and `--no-agents-md` | npm project naming disallows leading period in `.next-tmp`; flags avoid nested git and preserve root AGENTS.md |
| 2026-11-09 | Use actions/checkout@v4, pnpm/action-setup@v4, actions/setup-node@v4 | Current major GitHub Actions versions supporting Node 20 with pnpm caching |
| 2026-11-09 | Map Freighter isInstalled to isConnected | @stellar/freighter-api exports isConnected() to test extension availability; isInstalled is not exported in v6.0.1 |
| 2026-11-09 | Use usePayWithNaira in DepositSection | PayWithNaira does not expose TransactionStatus or status callbacks required for StatusTimeline; usePayWithNaira provides reactive status |
| 2026-11-09 | Synchronous window opening in WithdrawSection | Open popup before awaiting async SEP-24 withdraw call to avoid browser popup blockers |
| 2026-11-09 | Ref guard for completeWithdrawal in WithdrawSection | Use completedWithdrawalRef to ensure ramp.completeWithdrawal is called exactly once when status reaches pending_user_transfer_start |
| 2026-11-09 | Use amount 5 in quickstart sample | sdf-testanchor enforces max limit of 10 SRT on testnet; amount 5 ensures quickstart sample succeeds out-of-the-box |
