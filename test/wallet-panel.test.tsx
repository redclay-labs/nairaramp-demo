import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WalletPanel } from "../app/components/WalletPanel";
import * as walletModule from "../lib/wallet";

vi.mock("../lib/wallet", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/wallet")>();
  return {
    ...actual,
    isInstalled: vi.fn(),
    getNetwork: vi.fn(),
    connect: vi.fn(),
  };
});

describe("WalletPanel component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows warning and disables connect button when Freighter is not installed", async () => {
    vi.mocked(walletModule.isInstalled).mockResolvedValue({
      ok: true,
      data: false,
    });

    render(<WalletPanel />);

    await waitFor(() => {
      expect(
        screen.getByText(/Freighter extension is not installed/i)
      ).toBeDefined();
    });

    const button = screen.getByRole("button", { name: /Connect Freighter/i });
    expect(button.hasAttribute("disabled")).toBe(true);
  });

  it("shows wrong network warning and disables connect when wallet is not on testnet", async () => {
    vi.mocked(walletModule.isInstalled).mockResolvedValue({
      ok: true,
      data: true,
    });
    vi.mocked(walletModule.getNetwork).mockResolvedValue({
      ok: true,
      data: {
        network: "PUBLIC",
        isTestnet: false,
      },
    });

    render(<WalletPanel />);

    await waitFor(() => {
      expect(
        screen.getByText(/Wrong Network: Freighter must be connected to Stellar Testnet/i)
      ).toBeDefined();
    });

    const button = screen.getByRole("button", { name: /Connect Freighter/i });
    expect(button.hasAttribute("disabled")).toBe(true);
  });

  it("successfully connects, displays shortened address, and links to Friendbot", async () => {
    const testAddress = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

    vi.mocked(walletModule.isInstalled).mockResolvedValue({
      ok: true,
      data: true,
    });
    vi.mocked(walletModule.getNetwork).mockResolvedValue({
      ok: true,
      data: {
        network: "TESTNET",
        isTestnet: true,
      },
    });
    vi.mocked(walletModule.connect).mockResolvedValue({
      ok: true,
      data: {
        address: testAddress,
      },
    });

    const onAddressChange = vi.fn();
    render(<WalletPanel onAddressChange={onAddressChange} />);

    const button = await screen.findByRole("button", {
      name: /Connect Freighter/i,
    });
    expect(button.hasAttribute("disabled")).toBe(false);

    fireEvent.click(button);

    await waitFor(() => {
      expect(
        screen.getByText(walletModule.shortenAddress(testAddress))
      ).toBeDefined();
    });

    expect(onAddressChange).toHaveBeenCalledWith(testAddress);

    const friendbotLink = screen.getByRole("link", {
      name: /Fund account with Friendbot/i,
    });
    expect(friendbotLink.getAttribute("href")).toContain(testAddress);
  });

  it("displays error message when connect fails", async () => {
    vi.mocked(walletModule.isInstalled).mockResolvedValue({
      ok: true,
      data: true,
    });
    vi.mocked(walletModule.getNetwork).mockResolvedValue({
      ok: true,
      data: {
        network: "TESTNET",
        isTestnet: true,
      },
    });
    vi.mocked(walletModule.connect).mockResolvedValue({
      ok: false,
      error: "User rejected connection request",
    });

    render(<WalletPanel />);

    const button = await screen.findByRole("button", {
      name: /Connect Freighter/i,
    });
    fireEvent.click(button);

    await waitFor(() => {
      expect(
        screen.getByText(/User rejected connection request/i)
      ).toBeDefined();
    });
  });
});
