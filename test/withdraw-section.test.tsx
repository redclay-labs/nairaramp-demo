import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NairaRampError } from "@nairaramp/core";
import type { AnchorTransaction, WatchHandlers, WatchSubscription } from "@nairaramp/core";
import { WithdrawSection } from "../app/components/WithdrawSection";
import * as rampModule from "../lib/ramp";

vi.mock("../lib/ramp", () => ({
  makeRamp: vi.fn(),
}));

describe("WithdrawSection component", () => {
  const testAddress = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
  let capturedHandlers: WatchHandlers | null = null;
  const mockStop = vi.fn();
  let mockWithdraw: ReturnType<typeof vi.fn>;
  let mockCompleteWithdrawal: ReturnType<typeof vi.fn>;
  let mockWatch: ReturnType<typeof vi.fn>;
  let mockPopup: { location: { href: string }; closed: boolean; close: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_STELLAR_NETWORK = "testnet";
    process.env.NEXT_PUBLIC_NAIRARAMP_ANCHOR_ID = "sdf-testanchor";

    capturedHandlers = null;
    mockPopup = {
      location: { href: "" },
      closed: false,
      close: vi.fn(),
    };
    vi.spyOn(window, "open").mockReturnValue(mockPopup as unknown as Window);

    mockWithdraw = vi.fn().mockResolvedValue({
      id: "withdraw-123",
      url: "https://testanchor.stellar.org/sep24/interactive?id=withdraw-123",
    });

    mockCompleteWithdrawal = vi.fn().mockResolvedValue({
      hash: "abc123txhashstellar",
    });

    mockWatch = vi.fn().mockImplementation((id: string, handlers: WatchHandlers): WatchSubscription => {
      capturedHandlers = handlers;
      return {
        stop: mockStop,
      };
    });

    vi.mocked(rampModule.makeRamp).mockReturnValue({
      authenticate: vi.fn(),
      deposit: vi.fn(),
      withdraw: mockWithdraw,
      completeWithdrawal: mockCompleteWithdrawal,
      getTransaction: vi.fn(),
      watch: mockWatch,
      getPrice: vi.fn(),
    } as unknown as ReturnType<typeof rampModule.makeRamp>);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders nothing when not connected", () => {
    const { container } = render(
      <WithdrawSection address={null} isTestnet={true} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when connected but not on testnet", () => {
    const { container } = render(
      <WithdrawSection address={testAddress} isTestnet={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders section with asset code and initiates cash out with optional amount", async () => {
    render(<WithdrawSection address={testAddress} isTestnet={true} />);

    expect(
      screen.getByRole("heading", { name: /Cash Out to Naira \(SRT\)/i })
    ).toBeDefined();

    const amountInput = screen.getByLabelText(/Amount \(SRT, optional\):/i);
    fireEvent.change(amountInput, { target: { value: "50" } });

    const cashOutButton = screen.getByRole("button", { name: "Cash out" });
    fireEvent.click(cashOutButton);

    await waitFor(() => {
      expect(mockWithdraw).toHaveBeenCalledWith({
        assetCode: "SRT",
        amount: "50",
      });
    });

    expect(window.open).toHaveBeenCalledWith("", "nairaramp_withdraw_anchor");
    expect(mockPopup.location.href).toBe(
      "https://testanchor.stellar.org/sep24/interactive?id=withdraw-123"
    );
    expect(mockWatch).toHaveBeenCalledWith("withdraw-123", expect.any(Object));
  });

  it("calls completeWithdrawal exactly once when status reaches pending_user_transfer_start", async () => {
    render(<WithdrawSection address={testAddress} isTestnet={true} />);

    const cashOutButton = screen.getByRole("button", { name: "Cash out" });
    fireEvent.click(cashOutButton);

    await waitFor(() => {
      expect(mockWatch).toHaveBeenCalled();
      expect(capturedHandlers).not.toBeNull();
    });

    // First pending_user_transfer_start update
    await capturedHandlers?.onStatus?.("pending_user_transfer_start", {
      id: "withdraw-123",
      status: "pending_user_transfer_start",
    } as unknown as AnchorTransaction);

    await waitFor(() => {
      expect(mockCompleteWithdrawal).toHaveBeenCalledTimes(1);
      expect(mockCompleteWithdrawal).toHaveBeenCalledWith("withdraw-123");
    });

    // Second pending_user_transfer_start update should be ignored (called exactly once)
    await capturedHandlers?.onStatus?.("pending_user_transfer_start", {
      id: "withdraw-123",
      status: "pending_user_transfer_start",
    } as unknown as AnchorTransaction);

    expect(mockCompleteWithdrawal).toHaveBeenCalledTimes(1);

    // Verify transaction hash is displayed with link to stellar.expert
    await waitFor(() => {
      const txLink = screen.getByRole("link", { name: "abc123txhashstellar" });
      expect(txLink).toBeDefined();
      expect(txLink.getAttribute("href")).toBe(
        "https://stellar.expert/explorer/testnet/tx/abc123txhashstellar"
      );
    });
  });

  it("stops watcher on unmount", async () => {
    const { unmount } = render(
      <WithdrawSection address={testAddress} isTestnet={true} />
    );

    const cashOutButton = screen.getByRole("button", { name: "Cash out" });
    fireEvent.click(cashOutButton);

    await waitFor(() => {
      expect(mockWatch).toHaveBeenCalled();
    });

    expect(mockStop).not.toHaveBeenCalled();

    unmount();

    expect(mockStop).toHaveBeenCalledTimes(1);
  });

  it("renders error message and code when ramp.withdraw fails", async () => {
    mockWithdraw.mockRejectedValueOnce(
      new NairaRampError("UNSUPPORTED_ASSET", "SRT asset is not supported")
    );

    render(<WithdrawSection address={testAddress} isTestnet={true} />);

    const cashOutButton = screen.getByRole("button", { name: "Cash out" });
    fireEvent.click(cashOutButton);

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert.textContent).toContain("Error [UNSUPPORTED_ASSET]: SRT asset is not supported");
    });
  });

  it("renders error message and code when completeWithdrawal fails", async () => {
    mockCompleteWithdrawal.mockRejectedValueOnce(
      new NairaRampError("SIGNER_REJECTED", "Freighter signing rejected by user")
    );

    render(<WithdrawSection address={testAddress} isTestnet={true} />);

    const cashOutButton = screen.getByRole("button", { name: "Cash out" });
    fireEvent.click(cashOutButton);

    await waitFor(() => {
      expect(mockWatch).toHaveBeenCalled();
    });

    await capturedHandlers?.onStatus?.("pending_user_transfer_start", {
      id: "withdraw-123",
      status: "pending_user_transfer_start",
    } as unknown as AnchorTransaction);

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert.textContent).toContain(
        "Error [SIGNER_REJECTED]: Freighter signing rejected by user"
      );
    });
  });

  it("renders error message and code when watcher onError is called", async () => {
    render(<WithdrawSection address={testAddress} isTestnet={true} />);

    const cashOutButton = screen.getByRole("button", { name: "Cash out" });
    fireEvent.click(cashOutButton);

    await waitFor(() => {
      expect(mockWatch).toHaveBeenCalled();
    });

    capturedHandlers?.onError?.(
      new NairaRampError("TRANSACTION_FAILED", "Anchor rejected withdrawal")
    );

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert.textContent).toContain(
        "Error [TRANSACTION_FAILED]: Anchor rejected withdrawal"
      );
    });
  });
});
