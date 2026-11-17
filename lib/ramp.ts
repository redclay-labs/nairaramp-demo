import { createRamp, freighterSigner, type Ramp } from "@nairaramp/core";
import { getConfig } from "./config";

export type { Ramp };

/**
 * Creates a Ramp instance configured for Stellar Testnet using the active Freighter signer.
 * Enforces testnet-only policy and throws if application configuration is invalid.
 */
export function makeRamp(address?: string, anchorIdOverride?: string): Ramp {
  const config = getConfig();

  if (!config.ok) {
    throw new Error(`Cannot create ramp: configuration error (${config.error})`);
  }

  // address is accepted to bind to the connected wallet session
  void address;

  const anchorId = anchorIdOverride?.trim() || config.anchorId;

  return createRamp({
    network: "testnet",
    anchorId,
    signer: freighterSigner(),
  });
}
