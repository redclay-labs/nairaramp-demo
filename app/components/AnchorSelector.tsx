"use client";

import { useMemo } from "react";
import { listAnchors } from "@nairaramp/core";
import type { AnchorEntry } from "@nairaramp/core";

export interface AnchorSelectorProps {
  selectedAnchorId: string;
  selectedAssetCode: string;
  onAnchorChange: (anchorId: string, defaultAssetCode: string) => void;
  onAssetChange: (assetCode: string) => void;
}

export function AnchorSelector({
  selectedAnchorId,
  selectedAssetCode,
  onAnchorChange,
  onAssetChange,
}: AnchorSelectorProps) {
  const anchors: AnchorEntry[] = useMemo(
    () => listAnchors({ network: "testnet" }),
    []
  );

  const activeAnchor = useMemo(
    () =>
      anchors.find((a) => a.id === selectedAnchorId) ?? anchors[0] ?? null,
    [anchors, selectedAnchorId]
  );

  if (anchors.length === 0 || !activeAnchor) {
    return null;
  }

  const assets = activeAnchor.assets ?? [];

  return (
    <section
      aria-label="Testnet Anchor and Asset"
      style={{
        padding: "1rem",
        border: "1px solid #ccc",
        borderRadius: "8px",
        marginTop: "1rem",
        marginBottom: "1rem",
      }}
    >
      <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem" }}>
        Testnet Anchor &amp; Asset
      </h2>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          alignItems: "flex-end",
        }}
      >
        <div>
          <label
            htmlFor="anchor-select"
            style={{ display: "block", marginBottom: "0.25rem" }}
          >
            Testnet Anchor:
          </label>
          <select
            id="anchor-select"
            value={activeAnchor.id}
            onChange={(e) => {
              const nextId = e.target.value;
              const nextAnchor = anchors.find((a) => a.id === nextId);
              const nextAsset = nextAnchor?.assets?.[0]?.code ?? "";
              onAnchorChange(nextId, nextAsset);
            }}
            style={{
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
              minWidth: "220px",
            }}
          >
            {anchors.map((anchor) => (
              <option key={anchor.id} value={anchor.id}>
                {anchor.name} ({anchor.homeDomain})
              </option>
            ))}
          </select>
        </div>

        {assets.length > 0 && (
          <div>
            <label
              htmlFor="asset-select"
              style={{ display: "block", marginBottom: "0.25rem" }}
            >
              Asset:
            </label>
            <select
              id="asset-select"
              value={
                assets.some((a) => a.code === selectedAssetCode)
                  ? selectedAssetCode
                  : assets[0].code
              }
              onChange={(e) => onAssetChange(e.target.value)}
              style={{
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
                minWidth: "140px",
              }}
            >
              {assets.map((asset) => (
                <option key={asset.code} value={asset.code}>
                  {asset.code}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.875rem", color: "#555" }}>
        Supported SEPs: {activeAnchor.seps.join(", ").toUpperCase()}
      </p>
    </section>
  );
}

