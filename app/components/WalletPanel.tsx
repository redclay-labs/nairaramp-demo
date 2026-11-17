"use client";

import { useCallback, useEffect, useState } from "react";
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

type AccountFundingState = "idle" | "checking" | "funded" | "unfunded" | "error";

export function WalletPanel({
  onAddressChange,
  onNetworkChange,
}: WalletPanelProps) {
  const [hasFreighter, setHasFreighter] = useState<boolean | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [isTestnet, setIsTestnet] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fundingState, setFundingState] = useState<AccountFundingState>("idle");
  const [xlmBalance, setXlmBalance] = useState<string | null>(null);

  const syncWalletEnvironment = useCallback(async () => {
    const installRes = await isInstalled();
    if (!installRes.ok) {
      setHasFreighter(false);
      return;
    }
    setHasFreighter(installRes.data);

    if (installRes.data) {
      const netRes = await getNetwork();
      if (netRes.ok) {
        setNetwork(netRes.data.network);
        setIsTestnet(netRes.data.isTestnet);
        onNetworkChange?.(netRes.data.isTestnet);
      } else {
        setErrorMessage(netRes.error);
      }
    }
  }, [onNetworkChange]);

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

  useEffect(() => {
    if (!address || !isTestnet) {
      return;
    }

    let mounted = true;

    async function checkAccountFunding() {
      setFundingState("checking");
      try {
        const response = await fetch(
          `https://horizon-testnet.stellar.org/accounts/${address}`
        );
        if (!mounted) return;

        if (!response.ok) {
          setFundingState("unfunded");
          setXlmBalance(null);
          return;
        }

        const data = await response.json();
        const balances: Array<{ asset_type?: string; balance?: string }> =
          data.balances ?? [];
        const native = balances.find((b) => b.asset_type === "native");
        setXlmBalance(native?.balance ?? null);
        setFundingState("funded");
      } catch {
        if (mounted) {
          setFundingState("error");
        }
      }
    }

    void checkAccountFunding();

    return () => {
      mounted = false;
    };
  }, [address, isTestnet]);

  const handleConnect = async () => {
    setLoading(true);
    setErrorMessage(null);

    const netRes = await getNetwork();
    if (!netRes.ok) {
      setLoading(false);
      setErrorMessage(netRes.error);
      return;
    }

    setNetwork(netRes.data.network);
    setIsTestnet(netRes.data.isTestnet);
    onNetworkChange?.(netRes.data.isTestnet);
    if (!netRes.data.isTestnet) {
      setLoading(false);
      return;
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

  const handleRefresh = async () => {
    setRefreshing(true);
    setErrorMessage(null);
    await syncWalletEnvironment();
    setRefreshing(false);
  };

  const handleDisconnect = () => {
    setAddress(null);
    setFundingState("idle");
    setXlmBalance(null);
    setErrorMessage(null);
    onAddressChange?.(null);
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
      <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem" }}>
        Wallet Connection
      </h2>

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
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
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

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "1rem",
              cursor: refreshing || loading ? "not-allowed" : "pointer",
            }}
          >
            {refreshing ? "Refreshing..." : "Refresh network"}
          </button>
        </div>
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

          {fundingState === "funded" && xlmBalance && (
            <p style={{ margin: "0.25rem 0", fontSize: "0.875rem", color: "#2e7d32" }}>
              Testnet balance: {xlmBalance} XLM
            </p>
          )}

          {fundingState === "unfunded" && (
            <p style={{ margin: "0.25rem 0", fontSize: "0.875rem", color: "#e65100" }}>
              Account is not funded on Stellar Testnet yet.
            </p>
          )}

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

          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
              marginTop: "0.5rem",
            }}
          >
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                padding: "0.35rem 0.75rem",
                fontSize: "0.875rem",
                cursor: refreshing ? "not-allowed" : "pointer",
              }}
            >
              {refreshing ? "Refreshing..." : "Refresh network"}
            </button>

            <button
              type="button"
              onClick={handleDisconnect}
              style={{
                padding: "0.35rem 0.75rem",
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
