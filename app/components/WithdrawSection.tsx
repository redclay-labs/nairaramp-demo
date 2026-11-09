"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getAnchor, isNairaRampError, NairaRampError } from "@nairaramp/core";
import type { TransactionStatus, WatchSubscription } from "@nairaramp/core";
import { StatusTimeline } from "@nairaramp/react";
import { getConfig } from "../../lib/config";
import { makeRamp } from "../../lib/ramp";

export interface WithdrawSectionProps {
  address: string | null;
  isTestnet?: boolean;
}

export function WithdrawSection({
  address,
  isTestnet = true,
}: WithdrawSectionProps) {
  const [amount, setAmount] = useState<string>("");
  const [status, setStatus] = useState<TransactionStatus | undefined>(undefined);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [anchorUrl, setAnchorUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<{ message: string; code: string } | null>(
    null
  );

  const subscriptionRef = useRef<WatchSubscription | null>(null);
  const completedWithdrawalRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);

  const config = getConfig();

  const anchor = useMemo(() => {
    if (!config.ok) return null;
    try {
      return getAnchor(config.anchorId);
    } catch {
      return null;
    }
  }, [config]);

  const asset = anchor?.assets?.[0] ?? null;

  const ramp = useMemo(() => {
    if (!address || !isTestnet || !config.ok) return null;
    try {
      return makeRamp(address);
    } catch {
      return null;
    }
  }, [address, isTestnet, config.ok]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.stop();
        subscriptionRef.current = null;
      }
    };
  }, []);

  if (!address || !isTestnet || !config.ok || !asset || !ramp) {
    return null;
  }

  const handleCashOut = async () => {
    setError(null);
    setTxHash(null);
    setStatus(undefined);
    setAnchorUrl(null);
    setLoading(true);
    completedWithdrawalRef.current = false;

    // Open window synchronously in click handler to prevent browser popup blocking
    let popup: Window | null = null;
    try {
      popup = window.open("", "nairaramp_withdraw_anchor");
    } catch {
      popup = null;
    }

    try {
      const trimmed = amount.trim();
      const result = await ramp.withdraw({
        assetCode: asset.code,
        amount: trimmed ? trimmed : undefined,
      });

      if (popup && !popup.closed && result.url) {
        popup.location.href = result.url;
      }
      setAnchorUrl(result.url);

      if (subscriptionRef.current) {
        subscriptionRef.current.stop();
        subscriptionRef.current = null;
      }

      subscriptionRef.current = ramp.watch(result.id, {
        onStatus: async (newStatus) => {
          if (!isMountedRef.current) return;
          setStatus(newStatus as TransactionStatus);

          if (
            newStatus === "pending_user_transfer_start" &&
            !completedWithdrawalRef.current
          ) {
            completedWithdrawalRef.current = true;
            try {
              const completeRes = await ramp.completeWithdrawal(result.id);
              if (isMountedRef.current && completeRes?.hash) {
                setTxHash(completeRes.hash);
              }
            } catch (err) {
              if (!isMountedRef.current) return;
              if (isNairaRampError(err)) {
                setError({ message: err.message, code: err.code });
              } else if (err instanceof NairaRampError) {
                setError({ message: err.message, code: err.code });
              } else {
                setError({
                  message:
                    err instanceof Error ? err.message : "Withdrawal failed",
                  code: "TRANSACTION_FAILED",
                });
              }
            }
          }
        },
        onComplete: (tx) => {
          if (!isMountedRef.current) return;
          setStatus("completed");
          if (tx.stellar_transaction_id) {
            setTxHash(tx.stellar_transaction_id);
          }
          setLoading(false);
        },
        onError: (err) => {
          if (!isMountedRef.current) return;
          setError({
            message: err.message,
            code: err.code ?? "TRANSACTION_FAILED",
          });
          setLoading(false);
        },
      });
    } catch (err) {
      if (popup && !popup.closed) {
        try {
          popup.close();
        } catch {
          // ignore popup close errors
        }
      }
      if (isMountedRef.current) {
        setLoading(false);
        if (isNairaRampError(err)) {
          setError({ message: err.message, code: err.code });
        } else if (err instanceof NairaRampError) {
          setError({ message: err.message, code: err.code });
        } else {
          setError({
            message: err instanceof Error ? err.message : "Withdrawal failed",
            code: "TRANSACTION_FAILED",
          });
        }
      }
    }
  };

  return (
    <section
      aria-label="Withdrawal Section"
      style={{
        padding: "1rem",
        border: "1px solid #ccc",
        borderRadius: "8px",
        marginTop: "1rem",
        marginBottom: "1rem",
      }}
    >
      <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem" }}>
        Cash Out to Naira ({asset.code})
      </h2>

      <div style={{ marginBottom: "0.75rem" }}>
        <label
          htmlFor="withdraw-amount"
          style={{ display: "block", marginBottom: "0.25rem" }}
        >
          Amount ({asset.code}, optional):
        </label>
        <input
          id="withdraw-amount"
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 50"
          style={{
            padding: "0.5rem",
            borderRadius: "4px",
            border: "1px solid #ccc",
            width: "100%",
            maxWidth: "300px",
          }}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <button
          type="button"
          onClick={handleCashOut}
          disabled={loading}
          style={{
            padding: "0.5rem 1rem",
            fontSize: "1rem",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Processing..." : "Cash out"}
        </button>

        {anchorUrl && (
          <p style={{ margin: "0.5rem 0" }}>
            <a
              href={anchorUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "underline", color: "#1976d2" }}
            >
              Continue to the anchor
            </a>
          </p>
        )}

        {txHash && (
          <p style={{ margin: "0.5rem 0" }}>
            <strong>Transaction Hash:</strong>{" "}
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: "underline",
                wordBreak: "break-all",
                color: "#059669",
              }}
            >
              {txHash}
            </a>
          </p>
        )}

        {error && (
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
            <p style={{ margin: 0, fontWeight: "bold" }}>
              Error [{error.code}]: {error.message}
            </p>
          </div>
        )}
      </div>

      <StatusTimeline status={status} />
    </section>
  );
}

