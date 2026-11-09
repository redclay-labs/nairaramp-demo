export type ConfigSuccess = {
  ok: true;
  network: "testnet";
  anchorId: string;
};

export type ConfigError = {
  ok: false;
  error: string;
};

export type AppConfig = ConfigSuccess | ConfigError;

/**
 * Reads application configuration from environment variables.
 * Returns a typed config object or an error state if the configuration is invalid.
 * The demo strictly requires network to be "testnet".
 */
export function getConfig(
  env?: Record<string, string | undefined>
): AppConfig {
  const network = env
    ? env.NEXT_PUBLIC_STELLAR_NETWORK
    : process.env.NEXT_PUBLIC_STELLAR_NETWORK;
  const anchorId = env
    ? env.NEXT_PUBLIC_NAIRARAMP_ANCHOR_ID
    : process.env.NEXT_PUBLIC_NAIRARAMP_ANCHOR_ID;

  if (network !== "testnet") {
    return {
      ok: false,
      error: `Invalid network "${network ?? ""}". NairaRamp demo is testnet only.`,
    };
  }

  if (!anchorId || anchorId.trim() === "") {
    return {
      ok: false,
      error: "Missing anchor ID configuration (NEXT_PUBLIC_NAIRARAMP_ANCHOR_ID).",
    };
  }

  return {
    ok: true,
    network: "testnet",
    anchorId: anchorId.trim(),
  };
}
