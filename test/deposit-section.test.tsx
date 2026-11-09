import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DepositSection } from "../app/components/DepositSection";
import * as rampModule from "../lib/ramp";
import * as reactModule from "@nairaramp/react";

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

describe("DepositSection component", () => {
  const testAddress = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
  const mockStart = vi.fn();
  const mockReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_STELLAR_NETWORK = "testnet";
    process.env.NEXT_PUBLIC_NAIRARAMP_ANCHOR_ID = "sdf-testanchor";

    vi.mocked(rampModule.makeRamp).mockReturnValue({
      authenticate: vi.fn(),
      deposit: vi.fn(),
      withdraw: vi.fn(),
      completeWithdrawal: vi.fn(),
      getTransaction: vi.fn(),
      watch: vi.fn(),
      getPrice: vi.fn(),
    } as unknown as ReturnType<typeof rampModule.makeRamp>);

    vi.mocked(reactModule.usePayWithNaira).mockReturnValue({
      start: mockStart,
      phase: "idle",
      status: "pending_user_transfer_start",
      transactionId: "tx-123",
      url: undefined,
      error: undefined,
      reset: mockReset,
    });

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        balances: [
          {
            asset_type: "credit_alphanum4",
            asset_code: "SRT",
            asset_issuer:
              "GCDNJUBQSX7AJWLJACMJ7I4BC3Z47BQUTMHEICZLE6MU4KQBRYG5JY6B",
            balance: "100.0",
          },
        ],
      }),
    } as unknown as Response);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders nothing when not connected", () => {
    const { container } = render(
      <DepositSection address={null} isTestnet={true} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when connected but not on testnet", () => {
    const { container } = render(
      <DepositSection address={testAddress} isTestnet={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders deposit section and shows trustline hint when trustline is missing", async () => {
    // Mock fetch returning account without SRT trustline
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        balances: [
          { asset_type: "native", balance: "100.0" },
        ],
      }),
    } as unknown as Response);

    render(<DepositSection address={testAddress} isTestnet={true} />);

    expect(
      screen.getByRole("heading", { name: /Deposit with Naira/i })
    ).toBeDefined();

    await waitFor(() => {
      expect(
        screen.getByText(/Add a trustline in Freighter for SRT/i)
      ).toBeDefined();
    });

    expect(
      screen.getByText(/GCDNJUBQSX7AJWLJACMJ7I4BC3Z47BQUTMHEICZLE6MU4KQBRYG5JY6B/i)
    ).toBeDefined();
  });

  it("handles deposit button click with optional amount", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        balances: [
          {
            asset_type: "credit_alphanum4",
            asset_code: "SRT",
            asset_issuer: "GCDNJUBQSX7AJWLJACMJ7I4BC3Z47BQUTMHEICZLE6MU4KQBRYG5JY6B",
            balance: "50.0",
          },
        ],
      }),
    } as unknown as Response);

    render(<DepositSection address={testAddress} isTestnet={true} />);

    const amountInput = screen.getByLabelText(/Amount \(optional\):/i);
    fireEvent.change(amountInput, { target: { value: "5000" } });

    const payButton = screen.getByRole("button", { name: "Pay with Naira" });
    fireEvent.click(payButton);

    expect(mockStart).toHaveBeenCalledWith("5000");
  });

  it("displays anchor link in awaiting_user phase", () => {
    vi.mocked(reactModule.usePayWithNaira).mockReturnValue({
      start: mockStart,
      phase: "awaiting_user",
      status: "pending_user_transfer_start",
      transactionId: "tx-123",
      url: "https://testanchor.stellar.org/sep24/interactive?id=123",
      error: undefined,
      reset: mockReset,
    });

    render(<DepositSection address={testAddress} isTestnet={true} />);

    const link = screen.getByRole("link", {
      name: /Complete deposit in anchor window/i,
    });
    expect(link.getAttribute("href")).toBe(
      "https://testanchor.stellar.org/sep24/interactive?id=123"
    );
  });

  it("displays error message and retry button in failed phase", () => {
    vi.mocked(reactModule.usePayWithNaira).mockReturnValue({
      start: mockStart,
      phase: "failed",
      status: "error",
      transactionId: undefined,
      url: undefined,
      error: new Error("Anchor unreachable") as unknown as import("@nairaramp/core").NairaRampError,
      reset: mockReset,
    });

    render(<DepositSection address={testAddress} isTestnet={true} />);

    expect(screen.getByText("Anchor unreachable")).toBeDefined();

    const retryButton = screen.getByRole("button", { name: "Try again" });
    fireEvent.click(retryButton);

    expect(mockReset).toHaveBeenCalled();
  });
});
