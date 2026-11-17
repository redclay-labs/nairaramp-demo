"use client";

import { useState } from "react";
import { getAnchor } from "@nairaramp/core";
import { getConfig } from "../lib/config";
import { AnchorSelector } from "./components/AnchorSelector";
import { DepositSection } from "./components/DepositSection";
import { PriceQuoteCalculator } from "./components/PriceQuoteCalculator";
import { WalletPanel } from "./components/WalletPanel";
import { WithdrawSection } from "./components/WithdrawSection";

export default function Home() {
  const config = getConfig();
  const defaultAnchorId = config.ok ? config.anchorId : "";
  const defaultAssetCode = (() => {
    if (!defaultAnchorId) return "";
    try {
      return getAnchor(defaultAnchorId).assets?.[0]?.code ?? "";
    } catch {
      return "";
    }
  })();

  const [address, setAddress] = useState<string | null>(null);
  const [isTestnet, setIsTestnet] = useState<boolean>(true);
  const [selectedAnchorId, setSelectedAnchorId] =
    useState<string>(defaultAnchorId);
  const [selectedAssetCode, setSelectedAssetCode] =
    useState<string>(defaultAssetCode);

  if (!config.ok) {
    return (
      <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
        <div
          role="alert"
          style={{
            padding: "1rem",
            backgroundColor: "#ffebee",
            color: "#c62828",
            borderRadius: "6px",
            fontWeight: "bold",
          }}
        >
          Configuration Error: {config.error}
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>NairaRamp demo</h1>
      <p>Testnet only</p>
      <WalletPanel
        onAddressChange={setAddress}
        onNetworkChange={setIsTestnet}
      />
      <AnchorSelector
        selectedAnchorId={selectedAnchorId}
        selectedAssetCode={selectedAssetCode}
        onAnchorChange={(nextAnchorId, nextAssetCode) => {
          setSelectedAnchorId(nextAnchorId);
          setSelectedAssetCode(nextAssetCode);
        }}
        onAssetChange={setSelectedAssetCode}
      />
      <PriceQuoteCalculator
        address={address}
        isTestnet={isTestnet}
        anchorId={selectedAnchorId}
        assetCode={selectedAssetCode}
      />
      <DepositSection
        address={address}
        isTestnet={isTestnet}
        anchorId={selectedAnchorId}
        assetCode={selectedAssetCode}
      />
      <WithdrawSection
        address={address}
        isTestnet={isTestnet}
        anchorId={selectedAnchorId}
        assetCode={selectedAssetCode}
      />
    </main>
  );
}
