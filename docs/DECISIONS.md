# Decisions

GitHub owner: redclay-labs

| Date | Decision | Reason |
| --- | --- | --- |
| 2026-11-09 | Wallet: Freighter only | Most common testnet wallet; keeps the demo short |
| 2026-11-09 | No CSS framework beyond what create-next-app adds | The demo shows the components, not a design system |
| 2026-11-09 | Use `next-tmp` directory with `--disable-git` and `--no-agents-md` | npm project naming disallows leading period in `.next-tmp`; flags avoid nested git and preserve root AGENTS.md |
