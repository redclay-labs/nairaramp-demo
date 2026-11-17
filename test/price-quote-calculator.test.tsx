import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as core from "@nairaramp/core";
import { NairaRampError } from "@nairaramp/core";
import { PriceQuoteCalculator } from "../app/components/PriceQuoteCalculator";
import * as rampModule from "../lib/ramp";

vi.mock("../lib/ramp", () => ({
  makeRamp: vi.fn(),
}));

vi.mock("@nairaramp/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@nairaramp/core")>();
  return {
    ...actual,
    getAnchor: vi.fn(),
  };
});

describe("PriceQuoteCalculator component", () => {
  const testAddress = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
  let mockGetPrice: ReturnType<typeof vi.fn>;

  const sep38Anchor: core.AnchorEntry = {
    id: "sdf-testanchor",
    name: "SDF Test Anchor",
    homeDomain: "testanchor.stellar.org",
    network: "testnet",
    assets: [
      {
        code: "SRT",
        issuer: "GCDNJUBQSX7AJWLJACMJ7I4BC3Z47BQUTMHEICZLE6MU4KQBRYG5JY6B",
      },
    ],
    seps: ["sep10", "sep24", "sep38"],
    countries: ["NG"],
    verifiedAt: "2026-11-01T00:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_STELLAR_NETWORK = "testnet";
    process.env.NEXT_PUBLIC_NAIRARAMP_ANCHOR_ID = "sdf-testanchor";

    mockGetPrice = vi.fn().mockResolvedValue({
      sellAsset: "iso4217:NGN",
      buyAsset:
        "stellar:SRT:GCDNJUBQSX7AJWLJACMJ7I4BC3Z47BQUTMHEICZLE6MU4KQBRYG5JY6B",
      sellAmount: "5000",
      buyAmount: "3.25",
      price: "1538.46",
      totalFee: "50",
      feeAsset: "iso4217:NGN",
    });

    vi.mocked(core.getAnchor).mockReturnValue(sep38Anchor);
    vi.mocked(rampModule.makeRamp).mockReturnValue({
      getPrice: mockGetPrice,
    } as unknown as ReturnType<typeof rampModule.makeRamp>);
  });

  afterEach(() => {
    cleanup();
  });

  it("renders nothing when disconnected or not on testnet", () => {
    const { container: c1 } = render(
      <PriceQuoteCalculator address={null} isTestnet={true} />
    );
    expect(c1.firstChild).toBeNull();

    const { container: c2 } = render(
      <PriceQuoteCalculator address={testAddress} isTestnet={false} />
    );
    expect(c2.firstChild).toBeNull();
  });

  it("shows notice when anchor does not support SEP-38", () => {
    vi.mocked(core.getAnchor).mockReturnValue({
      ...sep38Anchor,
      seps: ["sep10", "sep24"],
    });

    render(<PriceQuoteCalculator address={testAddress} isTestnet={true} />);

    expect(
      screen.getByText(/SEP-38 indicative quotes are not advertised by SDF Test Anchor/i)
    ).toBeDefined();
    expect(mockGetPrice).not.toHaveBeenCalled();
  });

  it("fetches and displays indicative quote rate, receive amount, and fees", async () => {
    render(<PriceQuoteCalculator address={testAddress} isTestnet={true} />);

    await waitFor(() => {
      expect(mockGetPrice).toHaveBeenCalledWith({
        sellAsset: "iso4217:NGN",
        buyAsset:
          "stellar:SRT:GCDNJUBQSX7AJWLJACMJ7I4BC3Z47BQUTMHEICZLE6MU4KQBRYG5JY6B",
        sellAmount: "5000",
        context: "sep24",
      });
    });

    const summary = await screen.findByTestId("quote-summary");
    expect(summary.textContent).toContain("3.25 SRT");
    expect(summary.textContent).toContain("1538.46");
    expect(summary.textContent).toContain("50 (iso4217:NGN)");
  });

  it("handles QUOTE_UNAVAILABLE errors gracefully", async () => {
    mockGetPrice.mockRejectedValueOnce(
      new NairaRampError("QUOTE_UNAVAILABLE", "Pair not supported on testnet")
    );

    render(<PriceQuoteCalculator address={testAddress} isTestnet={true} />);

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("[QUOTE_UNAVAILABLE]");
    expect(alert.textContent).toContain("Pair not supported on testnet");
  });

  it("switches quote direction between buy and sell", async () => {
    render(<PriceQuoteCalculator address={testAddress} isTestnet={true} />);

    const directionSelect = screen.getByLabelText(/Direction:/i);
    fireEvent.change(directionSelect, { target: { value: "sell_crypto" } });

    await waitFor(() => {
      expect(mockGetPrice).toHaveBeenCalledWith({
        sellAsset:
          "stellar:SRT:GCDNJUBQSX7AJWLJACMJ7I4BC3Z47BQUTMHEICZLE6MU4KQBRYG5JY6B",
        buyAsset: "iso4217:NGN",
        sellAmount: "5000",
        context: "sep24",
      });
    });
  });
});

