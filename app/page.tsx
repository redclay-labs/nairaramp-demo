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
      <main className="demo-container">
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
    <main className="demo-container">
      <header className="demo-header">
        <div>
          <h1 className="demo-title">NairaRamp demo</h1>
          <p className="demo-subtitle">
            Deposit and cash-out reference flow on Stellar Testnet with
            Freighter
          </p>
        </div>
        <span className="testnet-badge">Testnet only</span>
      </header>
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
