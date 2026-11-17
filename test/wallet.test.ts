import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  connect,
  getNetwork,
  isInstalled,
  shortenAddress,
} from "../lib/wallet";
import * as freighterApi from "@stellar/freighter-api";

vi.mock("@stellar/freighter-api", () => ({
  isConnected: vi.fn(),
  requestAccess: vi.fn(),
  getAddress: vi.fn(),
  getNetwork: vi.fn(),
}));

describe("lib/wallet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("isInstalled", () => {
    it("returns true when Freighter is connected", async () => {
      vi.mocked(freighterApi.isConnected).mockResolvedValue({
        isConnected: true,
      } as never);

      const res = await isInstalled();
      expect(res).toEqual({ ok: true, data: true });
    });

    it("returns false when Freighter is not connected", async () => {
      vi.mocked(freighterApi.isConnected).mockResolvedValue({
        isConnected: false,
      } as never);

      const res = await isInstalled();
      expect(res).toEqual({ ok: true, data: false });
    });

    it("returns error result when Freighter API returns an error field", async () => {
      vi.mocked(freighterApi.isConnected).mockResolvedValue({
        isConnected: false,
        error: "Extension unavailable",
      } as never);

      const res = await isInstalled();
      expect(res).toEqual({ ok: false, error: "Extension unavailable" });
    });

    it("catches thrown errors and returns a typed failure", async () => {
      vi.mocked(freighterApi.isConnected).mockRejectedValue(
        new Error("Window not available")
      );

      const res = await isInstalled();
      expect(res).toEqual({ ok: false, error: "Window not available" });
    });
  });

  describe("connect", () => {
    it("returns trimmed address from requestAccess when present", async () => {
      vi.mocked(freighterApi.requestAccess).mockResolvedValue({
        address: "  GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5  ",
      } as never);

      const res = await connect();
      expect(res).toEqual({
        ok: true,
        data: {
          address: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
        },
      });
      expect(freighterApi.getAddress).not.toHaveBeenCalled();
    });

    it("falls back to getAddress when requestAccess returns empty address", async () => {
      vi.mocked(freighterApi.requestAccess).mockResolvedValue({
        address: "",
      } as never);
      vi.mocked(freighterApi.getAddress).mockResolvedValue({
        address: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
      } as never);

      const res = await connect();
      expect(res).toEqual({
        ok: true,
        data: {
          address: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
        },
      });
    });

    it("returns error when requestAccess fails with error field", async () => {
      vi.mocked(freighterApi.requestAccess).mockResolvedValue({
        address: "",
        error: "User rejected access",
      } as never);

      const res = await connect();
      expect(res).toEqual({ ok: false, error: "User rejected access" });
    });

    it("returns error when getAddress fails with error field", async () => {
      vi.mocked(freighterApi.requestAccess).mockResolvedValue({
        address: "",
      } as never);
      vi.mocked(freighterApi.getAddress).mockResolvedValue({
        address: "",
        error: "Locked wallet",
      } as never);

      const res = await connect();
      expect(res).toEqual({ ok: false, error: "Locked wallet" });
    });

    it("returns error when neither requestAccess nor getAddress returns an address", async () => {
      vi.mocked(freighterApi.requestAccess).mockResolvedValue({
        address: "   ",
      } as never);
      vi.mocked(freighterApi.getAddress).mockResolvedValue({
        address: "",
      } as never);

      const res = await connect();
      expect(res).toEqual({
        ok: false,
        error: "Freighter did not return an active account address.",
      });
    });

    it("catches thrown exceptions during connect", async () => {
      vi.mocked(freighterApi.requestAccess).mockRejectedValue("unexpected");

      const res = await connect();
      expect(res).toEqual({
        ok: false,
        error: "Failed to connect to Freighter wallet.",
      });
    });
  });

  describe("getNetwork", () => {
    it("identifies TESTNET by network name", async () => {
      vi.mocked(freighterApi.getNetwork).mockResolvedValue({
        network: "testnet",
        networkPassphrase: "",
      } as never);

      const res = await getNetwork();
      expect(res).toEqual({
        ok: true,
        data: { network: "testnet", isTestnet: true },
      });
    });

    it("identifies TEST NET by network passphrase", async () => {
      vi.mocked(freighterApi.getNetwork).mockResolvedValue({
        network: "CUSTOM",
        networkPassphrase: "Test SDF Network ; September 2015",
      } as never);

      const res = await getNetwork();
      expect(res).toEqual({
        ok: true,
        data: { network: "CUSTOM", isTestnet: true },
      });
    });

    it("rejects PUBLIC mainnet", async () => {
      vi.mocked(freighterApi.getNetwork).mockResolvedValue({
        network: "PUBLIC",
        networkPassphrase: "Public Global Stellar Network ; September 2015",
      } as never);

      const res = await getNetwork();
      expect(res).toEqual({
        ok: true,
        data: { network: "PUBLIC", isTestnet: false },
      });
    });

    it("returns error result when Freighter getNetwork returns error", async () => {
      vi.mocked(freighterApi.getNetwork).mockResolvedValue({
        network: "",
        networkPassphrase: "",
        error: "Network query failed",
      } as never);

      const res = await getNetwork();
      expect(res).toEqual({ ok: false, error: "Network query failed" });
    });
  });

  describe("shortenAddress", () => {
    it("shortens a full Stellar public key", () => {
      expect(
        shortenAddress("GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5")
      ).toBe("GBBD...FLA5");
    });

    it("returns short or empty strings unchanged", () => {
      expect(shortenAddress("")).toBe("");
      expect(shortenAddress("G12345")).toBe("G12345");
    });
  });
});

