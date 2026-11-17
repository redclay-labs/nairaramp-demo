"use client";

import { useEffect, useMemo, useState } from "react";
import { getAnchor, isNairaRampError, NairaRampError } from "@nairaramp/core";
import type { Quote } from "@nairaramp/core";
import { getConfig } from "../../lib/config";
import { makeRamp } from "../../lib/ramp";
import { validateOptionalAmount } from "../../lib/validation";

export interface PriceQuoteCalculatorProps {
  address: string | null;
  isTestnet?: boolean;
  anchorId?: string;
  assetCode?: string;
}

type QuoteDirection = "buy_crypto" | "sell_crypto";

export function PriceQuoteCalculator({
  address,
  isTestnet = true,
  anchorId: anchorIdProp,
  assetCode: assetCodeProp,
}: PriceQuoteCalculatorProps) {
  const [direction, setDirection] = useState<QuoteDirection>("buy_crypto");
  const [sellAmount, setSellAmount] = useState<string>("5000");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const config = getConfig();
  const anchorId = anchorIdProp ?? (config.ok ? config.anchorId : null);

  const anchor = useMemo(() => {
    if (!anchorId) return null;
    try {
      return getAnchor(anchorId);
    } catch {
      return null;
    }
  }, [anchorId]);

  const asset = useMemo(() => {
    if (!anchor?.assets?.length) return null;
    if (assetCodeProp) {
      return (
        anchor.assets.find((a) => a.code === assetCodeProp) ?? anchor.assets[0]
      );
    }
    return anchor.assets[0];
  }, [anchor, assetCodeProp]);

  const ramp = useMemo(() => {
    if (!address || !isTestnet || !anchorId) return null;
    try {
      return makeRamp(address, anchorId);
    } catch {
      return null;
    }
  }, [address, isTestnet, anchorId]);

  const supportsSep38 = Boolean(anchor?.seps?.includes("sep38"));

  useEffect(() => {
    if (!address || !isTestnet || !anchor || !asset || !ramp || !supportsSep38) {
      return;
    }

    const validated = validateOptionalAmount(sellAmount);
    if (!validated.ok || !validated.value) {
      return;
    }

    const activeAmount = validated.value;
    const stellarAsset = `stellar:${asset.code}:${asset.issuer}`;
    const fiatAsset = "iso4217:NGN";
    const sellAsset = direction === "buy_crypto" ? fiatAsset : stellarAsset;
    const buyAsset = direction === "buy_crypto" ? stellarAsset : fiatAsset;

    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await ramp.getPrice({
          sellAsset,
          buyAsset,
          sellAmount: activeAmount,
          context: "sep24",
        });
        if (!cancelled) {
          setQuote(result);
        }
      } catch (err) {
        if (!cancelled) {
          setQuote(null);
          if (isNairaRampError(err) || err instanceof NairaRampError) {
            setError(`[${err.code}] ${err.message}`);
          } else {
            setError(
              err instanceof Error
                ? err.message
                : "Unable to fetch indicative quote."
            );
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [address, isTestnet, anchor, asset, ramp, supportsSep38, direction, sellAmount]);

  if (!address || !isTestnet || !config.ok || !anchor || !asset || !ramp) {
    return null;
  }

  const amountValidation = validateOptionalAmount(sellAmount);
  const inlineValidationError =
    sellAmount.trim() === ""
      ? "Enter an amount to get an indicative quote."
      : !amountValidation.ok
        ? amountValidation.error
        : null;

  return (
    <section
      aria-label="Indicative Price Quote"
      style={{
        padding: "1rem",
        border: "1px solid #ccc",
        borderRadius: "8px",
        marginTop: "1rem",
        marginBottom: "1rem",
      }}
    >
      <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem" }}>
        Indicative Price Quote (SEP-38)
      </h2>

      {!supportsSep38 ? (
        <p style={{ margin: 0, fontSize: "0.875rem", color: "#555" }}>
          SEP-38 indicative quotes are not advertised by {anchor.name}.
        </p>
      ) : (
        <div>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
              alignItems: "flex-end",
              marginBottom: "0.75rem",
            }}
          >
            <div>
              <label
                htmlFor="quote-direction"
                style={{ display: "block", marginBottom: "0.25rem" }}
              >
                Direction:
              </label>
              <select
                id="quote-direction"
                value={direction}
                onChange={(e) => {
                  setQuote(null);
                  setError(null);
                  setDirection(e.target.value as QuoteDirection);
                }}
                style={{
                  padding: "0.5rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="buy_crypto">Buy {asset.code} with NGN</option>
                <option value="sell_crypto">Sell {asset.code} for NGN</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="quote-amount"
                style={{ display: "block", marginBottom: "0.25rem" }}
              >
                Sell Amount ({direction === "buy_crypto" ? "NGN" : asset.code}):
              </label>
              <input
                id="quote-amount"
                type="text"
                inputMode="decimal"
                value={sellAmount}
                onChange={(e) => {
                  setQuote(null);
                  setError(null);
                  setSellAmount(e.target.value);
                }}
                placeholder="e.g. 5000"
                style={{
                  padding: "0.5rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  width: "180px",
                }}
              />
            </div>
          </div>

          {inlineValidationError && (
            <p
              role="alert"
              style={{
                margin: "0.25rem 0",
                color: "#c62828",
                fontSize: "0.875rem",
              }}
            >
              {inlineValidationError}
            </p>
          )}

          {loading && (
            <p style={{ margin: "0.25rem 0", fontSize: "0.875rem", color: "#555" }}>
              Fetching indicative quote...
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
              {error}
            </div>
          )}

          {quote && !loading && !error && (
            <div
              data-testid="quote-summary"
              style={{
                padding: "0.75rem",
                backgroundColor: "#f5f5f5",
                borderRadius: "4px",
                fontSize: "0.9rem",
              }}
            >
              <p style={{ margin: "0 0 0.25rem 0" }}>
                <strong>Estimated Receive:</strong> {quote.buyAmount}{" "}
                {direction === "buy_crypto" ? asset.code : "NGN"}
              </p>
              <p style={{ margin: "0 0 0.25rem 0" }}>
                <strong>Indicative Rate:</strong> {quote.price}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Estimated Fee:</strong> {quote.totalFee} ({quote.feeAsset})
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

