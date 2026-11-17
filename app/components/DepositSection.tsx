"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getAnchor } from "@nairaramp/core";
import type { TransactionStatus } from "@nairaramp/core";
import { StatusTimeline, usePayWithNaira } from "@nairaramp/react";
import { getConfig } from "../../lib/config";
import { makeRamp } from "../../lib/ramp";
import { validateOptionalAmount } from "../../lib/validation";

export interface DepositSectionProps {
  address: string | null;
  isTestnet?: boolean;
}

type TrustlineState = "idle" | "checking" | "present" | "missing" | "error";

export function DepositSection({
  address,
  isTestnet = true,
}: DepositSectionProps) {
  const [amount, setAmount] = useState<string>("");
  const [trustlineState, setTrustlineState] = useState<TrustlineState>("idle");
  const [checkNonce, setCheckNonce] = useState<number>(0);

  const config = getConfig();
  const anchorId = config.ok ? config.anchorId : null;

  const anchor = useMemo(() => {
    if (!anchorId) return null;
    try {
      return getAnchor(anchorId);
    } catch {
      return null;
    }
  }, [anchorId]);

  const asset = anchor?.assets?.[0] ?? null;

  const ramp = useMemo(() => {
    if (!address || !isTestnet || !anchorId) return null;
    try {
      return makeRamp(address);
    } catch {
      return null;
    }
  }, [address, isTestnet, anchorId]);

  useEffect(() => {
    if (!address || !isTestnet || !asset) {
      return;
    }

    const targetAsset = asset;
    let mounted = true;

    async function checkTrustline() {
      setTrustlineState("checking");
      try {
        const response = await fetch(
          `https://horizon-testnet.stellar.org/accounts/${address}`
        );

        if (!mounted) return;

        if (!response.ok) {
          // Unfunded or non-existent account has no trustline
          setTrustlineState("missing");
          return;
        }

        const accountData = await response.json();
        const balances: Array<{
          asset_type?: string;
          asset_code?: string;
          asset_issuer?: string;
        }> = accountData.balances ?? [];

        const hasLine = balances.some(
          (b) =>
            b.asset_code === targetAsset.code &&
            b.asset_issuer === targetAsset.issuer
        );

        setTrustlineState(hasLine ? "present" : "missing");
      } catch {
        if (mounted) {
          setTrustlineState("error");
        }
      }
    }

    void checkTrustline();

    return () => {
      mounted = false;
    };
  }, [address, isTestnet, asset, checkNonce]);

  const handleRecheckTrustline = useCallback(() => {
    setCheckNonce((n) => n + 1);
  }, []);

  // Hook must be called conditionally safe: ramp is created when connected on testnet
  // Using an inner component when ramp & asset are ready ensures hooks are not called conditionally.
  if (!address || !isTestnet || !config.ok || !asset || !ramp) {
    return null;
  }

  return (
    <DepositForm
      ramp={ramp}
      asset={asset}
      amount={amount}
      onAmountChange={setAmount}
      trustlineState={trustlineState}
      onRecheckTrustline={handleRecheckTrustline}
    />
  );
}

interface DepositFormProps {
  ramp: ReturnType<typeof makeRamp>;
  asset: { code: string; issuer: string };
  amount: string;
  onAmountChange: (value: string) => void;
  trustlineState: TrustlineState;
  onRecheckTrustline: () => void;
}

function DepositForm({
  ramp,
  asset,
  amount,
  onAmountChange,
  trustlineState,
  onRecheckTrustline,
}: DepositFormProps) {
  const [validationError, setValidationError] = useState<string | null>(null);
  const { start, phase, status, transactionId, url, error, reset } =
    usePayWithNaira({
      ramp,
      assetCode: asset.code,
    });

  const handleStart = async () => {
    const validated = validateOptionalAmount(amount);
    if (!validated.ok) {
      setValidationError(validated.error);
      return;
    }
    setValidationError(null);
    await start(validated.value);
  };

  const handleReset = () => {
    setValidationError(null);
    onAmountChange("");
    reset();
  };

  return (
    <section
      aria-label="Deposit Section"
      style={{
        padding: "1rem",
        border: "1px solid #ccc",
        borderRadius: "8px",
        marginTop: "1rem",
        marginBottom: "1rem",
      }}
    >
      <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem" }}>
        Deposit with Naira ({asset.code})
      </h2>

      {trustlineState === "missing" && (
        <div
          role="note"
          style={{
            padding: "0.75rem",
            backgroundColor: "#fff8e1",
            border: "1px solid #ffe082",
            borderRadius: "4px",
            marginBottom: "0.75rem",
          }}
        >
          <p style={{ margin: "0 0 0.25rem 0", fontWeight: "bold" }}>
            Add a trustline in Freighter for {asset.code}
          </p>
          <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.875rem", wordBreak: "break-all" }}>
            Issuer: {asset.issuer}
          </p>
          <button
            type="button"
            onClick={onRecheckTrustline}
            style={{
              padding: "0.25rem 0.75rem",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Re-check trustline
          </button>
        </div>
      )}

      {trustlineState === "error" && (
        <div
          role="note"
          style={{
            padding: "0.75rem",
            backgroundColor: "#fff3e0",
            border: "1px solid #ffcc80",
            borderRadius: "4px",
            marginBottom: "0.75rem",
          }}
        >
          <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.875rem" }}>
            Could not verify {asset.code} trustline on Horizon Testnet.
          </p>
          <button
            type="button"
            onClick={onRecheckTrustline}
            style={{
              padding: "0.25rem 0.75rem",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Re-check trustline
          </button>
        </div>
      )}

      <div style={{ marginBottom: "0.75rem" }}>
        <label
          htmlFor="deposit-amount"
          style={{ display: "block", marginBottom: "0.25rem" }}
        >
          Amount (optional):
        </label>
        <input
          id="deposit-amount"
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => {
            setValidationError(null);
            onAmountChange(e.target.value);
          }}
          placeholder="e.g. 5000"
          aria-invalid={validationError ? "true" : undefined}
          style={{
            padding: "0.5rem",
            borderRadius: "4px",
            border: "1px solid #ccc",
            width: "100%",
            maxWidth: "300px",
          }}
        />
        {validationError && (
          <p
            role="alert"
            style={{
              margin: "0.25rem 0 0 0",
              color: "#c62828",
              fontSize: "0.875rem",
            }}
          >
            {validationError}
          </p>
        )}
      </div>

      <div style={{ marginBottom: "1rem" }}>
        {phase === "idle" && (
          <button
            type="button"
            onClick={handleStart}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Pay with Naira
          </button>
        )}

        {phase === "starting" && (
          <button
            type="button"
            disabled
            style={{
              padding: "0.5rem 1rem",
              fontSize: "1rem",
              cursor: "not-allowed",
            }}
          >
            Connecting...
          </button>
        )}

        {phase === "awaiting_user" && url && (
          <p style={{ margin: "0.5rem 0" }}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "underline", color: "#1976d2" }}
            >
              Complete deposit in anchor window
            </a>
          </p>
        )}

        {phase === "processing" && (
          <p style={{ margin: "0.5rem 0", color: "#1976d2" }}>
            Processing your deposit...
          </p>
        )}

        {phase === "completed" && (
          <div
            role="status"
            style={{
              padding: "0.5rem",
              backgroundColor: "#e8f5e9",
              color: "#2e7d32",
              borderRadius: "4px",
              marginTop: "0.5rem",
            }}
          >
            <p style={{ margin: "0 0 0.5rem 0", fontWeight: "bold" }}>
              Deposit completed
              {transactionId ? ` (ID: ${transactionId})` : ""}
            </p>
            <button
              type="button"
              onClick={handleReset}
              style={{
                padding: "0.25rem 0.75rem",
                cursor: "pointer",
              }}
            >
              Start another deposit
            </button>
          </div>
        )}

        {phase === "failed" && (
          <div
            role="alert"
            style={{
              padding: "0.5rem",
              backgroundColor: "#ffebee",
              color: "#c62828",
              borderRadius: "4px",
              marginTop: "0.5rem",
            }}
          >
            <p style={{ margin: "0 0 0.5rem 0" }}>
              {error?.message ?? "Deposit failed"}
            </p>
            <button
              type="button"
              onClick={handleReset}
              style={{
                padding: "0.25rem 0.75rem",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        )}
      </div>

      <StatusTimeline status={status as TransactionStatus | undefined} />
    </section>
  );
}
