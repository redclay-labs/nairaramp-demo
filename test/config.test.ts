import { describe, it, expect } from "vitest";
import { getConfig } from "../lib/config";

describe("getConfig", () => {
  it("returns config successfully when network is testnet and anchorId is provided", () => {
    const config = getConfig({
      NEXT_PUBLIC_STELLAR_NETWORK: "testnet",
      NEXT_PUBLIC_NAIRARAMP_ANCHOR_ID: "sdf-testanchor",
    });

    expect(config.ok).toBe(true);
    if (config.ok) {
      expect(config.network).toBe("testnet");
      expect(config.anchorId).toBe("sdf-testanchor");
    }
  });

  it("returns error state when network is not testnet", () => {
    const config = getConfig({
      NEXT_PUBLIC_STELLAR_NETWORK: "mainnet",
      NEXT_PUBLIC_NAIRARAMP_ANCHOR_ID: "sdf-testanchor",
    });

    expect(config.ok).toBe(false);
    if (!config.ok) {
      expect(config.error).toContain("testnet only");
      expect(config.error).toContain("mainnet");
    }
  });

  it("returns error state when network is undefined", () => {
    const config = getConfig({
      NEXT_PUBLIC_STELLAR_NETWORK: undefined,
      NEXT_PUBLIC_NAIRARAMP_ANCHOR_ID: "sdf-testanchor",
    });

    expect(config.ok).toBe(false);
    if (!config.ok) {
      expect(config.error).toContain("testnet only");
    }
  });

  it("returns error state when anchorId is missing or empty", () => {
    const config = getConfig({
      NEXT_PUBLIC_STELLAR_NETWORK: "testnet",
      NEXT_PUBLIC_NAIRARAMP_ANCHOR_ID: "   ",
    });

    expect(config.ok).toBe(false);
    if (!config.ok) {
      expect(config.error).toContain("Missing anchor ID configuration");
    }
  });
});
