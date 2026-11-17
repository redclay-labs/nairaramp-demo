import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as core from "@nairaramp/core";
import { makeRamp } from "../lib/ramp";

vi.mock("@nairaramp/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@nairaramp/core")>();
  return {
    ...actual,
    createRamp: vi.fn(),
    freighterSigner: vi.fn(),
  };
});

describe("lib/ramp", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("throws when network configuration is not testnet", () => {
    process.env.NEXT_PUBLIC_STELLAR_NETWORK = "mainnet";
    process.env.NEXT_PUBLIC_NAIRARAMP_ANCHOR_ID = "sdf-testanchor";

    expect(() => makeRamp()).toThrow(/Cannot create ramp: configuration error/);
    expect(core.createRamp).not.toHaveBeenCalled();
  });

  it("throws when anchor ID configuration is missing", () => {
    process.env.NEXT_PUBLIC_STELLAR_NETWORK = "testnet";
    process.env.NEXT_PUBLIC_NAIRARAMP_ANCHOR_ID = "";

    expect(() => makeRamp()).toThrow(/Cannot create ramp: configuration error/);
    expect(core.createRamp).not.toHaveBeenCalled();
  });

  it("creates a testnet ramp with freighterSigner when config is valid", () => {
    process.env.NEXT_PUBLIC_STELLAR_NETWORK = "testnet";
    process.env.NEXT_PUBLIC_NAIRARAMP_ANCHOR_ID = "sdf-testanchor";

    const mockSigner = {
      getPublicKey: vi.fn(),
      signTransaction: vi.fn(),
    };
    const mockRamp = { anchor: { id: "sdf-testanchor" } } as unknown as core.Ramp;

    vi.mocked(core.freighterSigner).mockReturnValue(mockSigner);
    vi.mocked(core.createRamp).mockReturnValue(mockRamp);

    const ramp = makeRamp("GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5");

    expect(ramp).toBe(mockRamp);
    expect(core.freighterSigner).toHaveBeenCalledTimes(1);
    expect(core.createRamp).toHaveBeenCalledWith({
      network: "testnet",
      anchorId: "sdf-testanchor",
      signer: mockSigner,
    });
  });
});
