# Seed Issues

This document lists the curated seed issues identified from real enhancement opportunities in `nairaramp-demo`. All issues are strictly scoped to this repository, require no private credentials or mainnet funds, and contain specific "Done when" verification criteria.

## Issue Summary

| # | Title | Complexity | Labels | File |
| - | ----- | ---------- | ------ | ---- |
| 1 | feat(ui): add one-click Change Trust button for SRT trustline | Trivial (100) | `enhancement`, `good first issue` | [`docs/seed-issues/01.md`](seed-issues/01.md) |
| 2 | feat(ui): add copyable integration code snippet panel per section | Trivial (100) | `enhancement`, `documentation` | [`docs/seed-issues/02.md`](seed-issues/02.md) |
| 3 | feat(i18n): add Nigerian Pidgin language toggle for UI copy | Trivial (100) | `enhancement` | [`docs/seed-issues/03.md`](seed-issues/03.md) |
| 4 | feat(ui): add testnet anchor selector dropdown using listAnchors | Medium (150) | `enhancement` | [`docs/seed-issues/04.md`](seed-issues/04.md) |
| 5 | style(ui): improve responsive layout and mobile touch target ergonomics | Medium (150) | `enhancement`, `style` | [`docs/seed-issues/05.md`](seed-issues/05.md) |
| 6 | test(a11y): add automated axe accessibility checks to component test suites | Medium (150) | `enhancement`, `testing` | [`docs/seed-issues/06.md`](seed-issues/06.md) |
| 7 | feat(wallet): support @creit.tech/stellar-wallets-kit alongside Freighter | High (200) | `enhancement` | [`docs/seed-issues/07.md`](seed-issues/07.md) |
| 8 | test(e2e): implement Playwright end-to-end test suite for deposit and withdrawal flows | High (200) | `enhancement`, `testing` | [`docs/seed-issues/08.md`](seed-issues/08.md) |
| 9 | feat(ui): add SEP-38 indicative price quotation calculator | High (200) | `enhancement` | [`docs/seed-issues/09.md`](seed-issues/09.md) |

---

## Creation Commands

Run the following commands using the GitHub CLI (`gh`) to create these issues on the repository:

```bash
# Issue 1
gh issue create --title "feat(ui): add one-click Change Trust button for SRT trustline" --body-file docs/seed-issues/01.md --label "enhancement,good first issue"

# Issue 2
gh issue create --title "feat(ui): add copyable integration code snippet panel per section" --body-file docs/seed-issues/02.md --label "enhancement,documentation"

# Issue 3
gh issue create --title "feat(i18n): add Nigerian Pidgin language toggle for UI copy" --body-file docs/seed-issues/03.md --label "enhancement"

# Issue 4
gh issue create --title "feat(ui): add testnet anchor selector dropdown using listAnchors" --body-file docs/seed-issues/04.md --label "enhancement"

# Issue 5
gh issue create --title "style(ui): improve responsive layout and mobile touch target ergonomics" --body-file docs/seed-issues/05.md --label "enhancement,style"

# Issue 6
gh issue create --title "test(a11y): add automated axe accessibility checks to component test suites" --body-file docs/seed-issues/06.md --label "enhancement,testing"

# Issue 7
gh issue create --title "feat(wallet): support @creit.tech/stellar-wallets-kit alongside Freighter" --body-file docs/seed-issues/07.md --label "enhancement"

# Issue 8
gh issue create --title "test(e2e): implement Playwright end-to-end test suite for deposit and withdrawal flows" --body-file docs/seed-issues/08.md --label "enhancement,testing"

# Issue 9
gh issue create --title "feat(ui): add SEP-38 indicative price quotation calculator" --body-file docs/seed-issues/09.md --label "enhancement"
```
