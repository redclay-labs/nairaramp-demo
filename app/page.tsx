"use client";

import { useState } from "react";
import { getConfig } from "../lib/config";
import { DepositSection } from "./components/DepositSection";
import { WalletPanel } from "./components/WalletPanel";

export default function Home() {
  const [address, setAddress] = useState<string | null>(null);
  const [isTestnet, setIsTestnet] = useState<boolean>(true);
  const config = getConfig();

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
      <DepositSection address={address} isTestnet={isTestnet} />
    </main>
  );
}
