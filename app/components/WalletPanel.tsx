"use client";

import { useEffect, useState } from "react";
import {
  connect,
  getNetwork,
  isInstalled,
  shortenAddress,
} from "../../lib/wallet";

export interface WalletPanelProps {
  onAddressChange?: (address: string | null) => void;
  onNetworkChange?: (isTestnet: boolean) => void;
}

export function WalletPanel({
  onAddressChange,
  onNetworkChange,
}: WalletPanelProps) {
  const [hasFreighter, setHasFreighter] = useState<boolean | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [isTestnet, setIsTestnet] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkStatus() {
      const installRes = await isInstalled();
      if (!mounted) return;

      if (!installRes.ok) {
        setHasFreighter(false);
        return;
      }
      setHasFreighter(installRes.data);

      if (installRes.data) {
        const netRes = await getNetwork();
        if (!mounted) return;
        if (netRes.ok) {
          setNetwork(netRes.data.network);
          setIsTestnet(netRes.data.isTestnet);
          onNetworkChange?.(netRes.data.isTestnet);
        }
      }
    }

    void checkStatus();

    return () => {
      mounted = false;
    };
  }, [onNetworkChange]);

  const handleConnect = async () => {
    setLoading(true);
    setErrorMessage(null);

    const netRes = await getNetwork();
    if (netRes.ok) {
      setNetwork(netRes.data.network);
      setIsTestnet(netRes.data.isTestnet);
      onNetworkChange?.(netRes.data.isTestnet);
      if (!netRes.data.isTestnet) {
        setLoading(false);
        return;
      }
    }

    const res = await connect();
    setLoading(false);

    if (!res.ok) {
      setErrorMessage(res.error);
      return;
    }

    setAddress(res.data.address);
    onAddressChange?.(res.data.address);
  };

  return (
    <section
      aria-label="Wallet Connection"
      style={{
        padding: "1rem",
        border: "1px solid #ccc",
        borderRadius: "8px",
        marginTop: "1rem",
        marginBottom: "1rem",
      }}
    >
      <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem" }}>Wallet Connection</h2>

      {hasFreighter === false && (
        <div
          role="alert"
          style={{
            padding: "0.5rem",
            backgroundColor: "#ffebee",
            color: "#c62828",
            borderRadius: "4px",
            marginBottom: "0.75rem",
          }}
        >
          Freighter extension is not installed. Please install{" "}
          <a
            href="https://www.freighter.app/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "underline" }}
          >
            Freighter
          </a>{" "}
          to use this demo.
        </div>
      )}

      {hasFreighter && !isTestnet && (
        <div
          role="alert"
          style={{
            padding: "0.5rem",
            backgroundColor: "#fff3e0",
            color: "#e65100",
            borderRadius: "4px",
            marginBottom: "0.75rem",
            fontWeight: "bold",
          }}
        >
          Wrong Network: Freighter must be connected to Stellar Testnet
          {network ? ` (currently on ${network})` : ""}.
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          style={{
            padding: "0.5rem",
            backgroundColor: "#ffebee",
            color: "#c62828",
            borderRadius: "4px",
            marginBottom: "0.75rem",
          }}
        >
          {errorMessage}
        </div>
      )}

      {!address ? (
        <button
          type="button"
          onClick={handleConnect}
          disabled={loading || hasFreighter === false || !isTestnet}
          style={{
            padding: "0.5rem 1rem",
            fontSize: "1rem",
            cursor:
              loading || hasFreighter === false || !isTestnet
                ? "not-allowed"
                : "pointer",
          }}
        >
          {loading ? "Connecting..." : "Connect Freighter"}
        </button>
      ) : (
        <div>
          <p style={{ margin: "0.25rem 0" }}>
            <strong>Connected Key:</strong>{" "}
            <span
              title={address}
              aria-label={`Connected address: ${shortenAddress(address)}`}
            >
              {shortenAddress(address)}
            </span>
          </p>
          <p style={{ margin: "0.25rem 0" }}>
            <a
              href={`https://laboratory.stellar.org/#account-creator?network=test&account=${encodeURIComponent(
                address
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "underline" }}
            >
              Fund account with Friendbot
            </a>
          </p>
        </div>
      )}
    </section>
  );
}
