import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import axe from "axe-core";
import * as core from "@nairaramp/core";
import * as reactModule from "@nairaramp/react";
import Home from "../app/page";
import { AnchorSelector } from "../app/components/AnchorSelector";
import { DepositSection } from "../app/components/DepositSection";
import { PriceQuoteCalculator } from "../app/components/PriceQuoteCalculator";
import { WalletPanel } from "../app/components/WalletPanel";
import { WithdrawSection } from "../app/components/WithdrawSection";
import * as rampModule from "../lib/ramp";
import * as walletModule from "../lib/wallet";

vi.mock("../lib/wallet", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/wallet")>();
  return {
    ...actual,
    isInstalled: vi.fn().mockResolvedValue({ ok: true, data: true }),
    getNetwork: vi.fn().mockResolvedValue({
      ok: true,
      data: { network: "TESTNET", isTestnet: true },
    }),
    connect: vi.fn(),
  };
});

vi.mock("../lib/ramp", () => ({
  makeRamp: vi.fn(),
}));

vi.mock("@nairaramp/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@nairaramp/react")>();
  return {
    ...actual,
    usePayWithNaira: vi.fn(),
  };
});

describe("Automated axe accessibility checks", () => {
  const testAddress = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_STELLAR_NETWORK: "testnet",
      NEXT_PUBLIC_NAIRARAMP_ANCHOR_ID: "sdf-testanchor",
    };

    vi.mocked(walletModule.isInstalled).mockResolvedValue({
      ok: true,
      data: true,
    });
    vi.mocked(walletModule.getNetwork).mockResolvedValue({
      ok: true,
      data: { network: "TESTNET", isTestnet: true },
    });

    vi.mocked(rampModule.makeRamp).mockReturnValue({
      authenticate: vi.fn(),
      deposit: vi.fn(),
      withdraw: vi.fn(),
      completeWithdrawal: vi.fn(),
      getTransaction: vi.fn(),
      watch: vi.fn(),
      getPrice: vi.fn().mockResolvedValue({
        sellAsset: "iso4217:NGN",
        buyAsset: "stellar:SRT:GCDNJUBQSX7AJWLJACMJ7I4BC3Z47BQUTMHEICZLE6MU4KQBRYG5JY6B",
        sellAmount: "5000",
        buyAmount: "3.25",
        price: "1538.46",
        totalFee: "50",
        feeAsset: "iso4217:NGN",
      }),
    } as unknown as ReturnType<typeof rampModule.makeRamp>);

    vi.mocked(reactModule.usePayWithNaira).mockReturnValue({
      start: vi.fn(),
      phase: "idle",
      status: undefined,
      transactionId: undefined,
      url: undefined,
      error: undefined,
      reset: vi.fn(),
    });

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ balances: [] }),
    } as unknown as Response);
  });

  afterEach(() => {
    cleanup();
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  async function expectNoViolations(container: HTMLElement) {
    const results = await axe.run(container, {
      rules: {
        // jsdom does not compute color contrast
        "color-contrast": { enabled: false },
      },
    });
    expect(results.violations).toEqual([]);
  }

  it("Home page has no axe violations", async () => {
    const { container } = render(<Home />);
    await expectNoViolations(container);
  });

  it("WalletPanel has no axe violations", async () => {
    const { container } = render(<WalletPanel />);
    await expectNoViolations(container);
  });

  it("AnchorSelector has no axe violations", async () => {
    const anchors = core.listAnchors({ network: "testnet" });
    const first = anchors[0];
    const { container } = render(
      <AnchorSelector
        selectedAnchorId={first?.id ?? "sdf-testanchor"}
        selectedAssetCode={first?.assets?.[0]?.code ?? "SRT"}
        onAnchorChange={vi.fn()}
        onAssetChange={vi.fn()}
      />
    );
    await expectNoViolations(container);
  });

  it("DepositSection has no axe violations", async () => {
    const { container } = render(
      <DepositSection address={testAddress} isTestnet={true} />
    );
    await expectNoViolations(container);
  });

  it("WithdrawSection has no axe violations", async () => {
    const { container } = render(
      <WithdrawSection address={testAddress} isTestnet={true} />
    );
    await expectNoViolations(container);
  });

  it("PriceQuoteCalculator has no axe violations", async () => {
    const { container } = render(
      <PriceQuoteCalculator address={testAddress} isTestnet={true} />
    );
    await expectNoViolations(container);
  });
});

