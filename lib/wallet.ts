import {
  getAddress as freighterGetAddress,
  getNetwork as freighterGetNetwork,
  isConnected as freighterIsConnected,
  requestAccess as freighterRequestAccess,
} from "@stellar/freighter-api";

export type WalletResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type WalletNetworkInfo = {
  network: string;
  isTestnet: boolean;
};

/**
 * Checks whether the Freighter browser extension is installed.
 * Uses freighterIsConnected() under the hood, returning a typed result.
 */
export async function isInstalled(): Promise<WalletResult<boolean>> {
  try {
    const res = await freighterIsConnected();
    if (res.error) {
      return { ok: false, error: String(res.error) };
    }
    return { ok: true, data: Boolean(res.isConnected) };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to check Freighter extension installation.",
    };
  }
}

/**
 * Connects to Freighter by requesting access and obtaining the user's public address.
 * Never throws raw errors to the UI.
 */
export async function connect(): Promise<WalletResult<{ address: string }>> {
  try {
    const accessRes = await freighterRequestAccess();
    if (accessRes.error) {
      return { ok: false, error: String(accessRes.error) };
    }

    if (accessRes.address && accessRes.address.trim() !== "") {
      return { ok: true, data: { address: accessRes.address.trim() } };
    }

    const addrRes = await freighterGetAddress();
    if (addrRes.error) {
      return { ok: false, error: String(addrRes.error) };
    }

    if (addrRes.address && addrRes.address.trim() !== "") {
      return { ok: true, data: { address: addrRes.address.trim() } };
    }

    return { ok: false, error: "Freighter did not return an active account address." };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to connect to Freighter wallet.",
    };
  }
}

/**
 * Retrieves the currently active network configuration from Freighter.
 * Verifies whether the active network matches Stellar Testnet.
 */
export async function getNetwork(): Promise<WalletResult<WalletNetworkInfo>> {
  try {
    const res = await freighterGetNetwork();
    if (res.error) {
      return { ok: false, error: String(res.error) };
    }

    const netName = (res.network ?? "").trim().toUpperCase();
    const passphrase = res.networkPassphrase ?? "";
    const isTestnet =
      netName === "TESTNET" ||
      netName === "TEST NET" ||
      passphrase.includes("Test SDF Network");

    return {
      ok: true,
      data: {
        network: res.network ?? "",
        isTestnet,
      },
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to query Freighter network.",
    };
  }
}

/**
 * Helper to shorten a Stellar public key for display in the UI.
 * e.g. "GBBD4XYZ...WXYZ" -> "GBBD...WXYZ"
 */
export function shortenAddress(address: string): string {
  if (!address || address.length < 10) {
    return address;
  }
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}
