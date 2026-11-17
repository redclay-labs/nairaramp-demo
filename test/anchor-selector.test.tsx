import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as core from "@nairaramp/core";
import { AnchorSelector } from "../app/components/AnchorSelector";

vi.mock("@nairaramp/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@nairaramp/core")>();
  return {
    ...actual,
    listAnchors: vi.fn(),
  };
});

describe("AnchorSelector component", () => {
  const mockAnchors: core.AnchorEntry[] = [
    {
      id: "sdf-testanchor",
      name: "SDF Test Anchor",
      homeDomain: "testanchor.stellar.org",
      network: "testnet",
      assets: [
        { code: "SRT", issuer: "GCDNJUBQSX7AJWLJACMJ7I4BC3Z47BQUTMHEICZLE6MU4KQBRYG5JY6B" },
        { code: "USDC", issuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5" },
      ],
      seps: ["sep10", "sep24", "sep38"],
      countries: ["NG"],
      verifiedAt: "2026-11-01T00:00:00Z",
    },
    {
      id: "ngn-testanchor",
      name: "NGN Test Anchor",
      homeDomain: "ngn-test.example.org",
      network: "testnet",
      assets: [
        { code: "NGNC", issuer: "GNGNISSUER1234567890" },
      ],
      seps: ["sep10", "sep24"],
      countries: ["NG"],
      verifiedAt: "2026-11-01T00:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(core.listAnchors).mockReturnValue(mockAnchors);
  });

  afterEach(() => {
    cleanup();
  });

  it("populates testnet anchor and asset dropdowns from listAnchors", () => {
    render(
      <AnchorSelector
        selectedAnchorId="sdf-testanchor"
        selectedAssetCode="SRT"
        onAnchorChange={vi.fn()}
        onAssetChange={vi.fn()}
      />
    );

    expect(core.listAnchors).toHaveBeenCalledWith({ network: "testnet" });
    const anchorSelect = screen.getByLabelText(/Testnet Anchor:/i) as HTMLSelectElement;
    expect(anchorSelect.options).toHaveLength(2);
    expect(anchorSelect.value).toBe("sdf-testanchor");

    const assetSelect = screen.getByLabelText(/Asset:/i) as HTMLSelectElement;
    expect(assetSelect.options).toHaveLength(2);
    expect(assetSelect.value).toBe("SRT");
  });

  it("fires onAnchorChange with default asset and onAssetChange on selection", () => {
    const onAnchorChange = vi.fn();
    const onAssetChange = vi.fn();

    render(
      <AnchorSelector
        selectedAnchorId="sdf-testanchor"
        selectedAssetCode="SRT"
        onAnchorChange={onAnchorChange}
        onAssetChange={onAssetChange}
      />
    );

    const anchorSelect = screen.getByLabelText(/Testnet Anchor:/i);
    fireEvent.change(anchorSelect, { target: { value: "ngn-testanchor" } });
    expect(onAnchorChange).toHaveBeenCalledWith("ngn-testanchor", "NGNC");

    const assetSelect = screen.getByLabelText(/Asset:/i);
    fireEvent.change(assetSelect, { target: { value: "USDC" } });
    expect(onAssetChange).toHaveBeenCalledWith("USDC");
  });
});

